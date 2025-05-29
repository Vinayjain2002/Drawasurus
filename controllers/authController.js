const User= require('../models/users.js');
const jwt= require('jsonwebtoken');
const crypto= require('crypto');
const nodemailer= require('nodemailer');
const {getBloomFilter} = require('../config/bloom.js');

const createToken= (userId)=>{
    return jwt.sign({id: userId}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES});
}

exports.register= async(req,res)=>{
    const {username, password, email}= req.body;
    if(!username || !password || !email){
        return res.status(400).json({"message": "Req fields are not provided"});
    }
    if(!isValidEmail(email) || !isValidPassword(password) || !isValidUsername(username)){
        return res.status(400).json({"message": "Invalid input"});
    }


    try{
        const usernameBloomFilter= getBloomFilter();
        const lowercasedUsername= username.toLowerCase();
        if(usernameBloomFilter && !usernameBloomFilter.test(lowercasedUsername)){
            const emailExists= await User.findOne({email: email});
            if(emailExists){
                return res.status(400).json({"message": "Email is already registered"});
            }
            const user= new User({
            username: username,
            email: email,
            password: password});
            await user.save();
            const token= createToken(user._id);
            return res.status(201).json({"token": token, "username": username.username});
        }

        // we need to check is the username exists or not from the Database
        const userExists= await User.findOne({
            $or: [{username: lowercasedUsername}, {email: email.toLowerCase()}]
        });

        if(userExists){
            if(userExists.username== lowercasedUsername){
                return res.status(400).json({"message": "Username is already taken"});
            }
            if(userExists.email== email.toLowerCase()){
                return res.status(400).json({"message": "Email is already exists"});
            }
        }

        // the username and email is unique
        const newUser= new User({
            username: lowercasedUsername,
            email: email.toLowerCase(),
            password: password
        });
        await newUser.save();

        if(usernameBloomFilter){
            usernameBloomFilter.add(lowercasedUsername);
        }
        const token= createToken(newUser._id);
        return res.status(201).json({"nessage": "User is registered Successfully", "token": token, "username": newUser.username});
    }
    catch(err){
        if(err.code=== 11000){
            if (err.keyPattern && err.keyPattern.username) {
                return res.status(400).json({ message: 'Username is already taken' });
            }
            if (err.keyPattern && err.keyPattern.email) {
                return res.status(400).json({ message: 'User with this email already exists' });
            }
        }

        console.error("Registeration Error", err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

exports.generateRefreshToken= (userId)=>{
    try{
        return jwt.sign({id:userId}, process.env.JWT_REFRESH_SECRET, {expiresIn: '7d'});
    }
    catch(err){
        return res.status(400).json({"message": "Provide Valid Credentials"});
    }   
}

exports.login= async (req, res) =>{
    const { email, password } = req.body;
    if (!email || !password) {
            return res.status(400).json({ message: 'Please enter both email and password.' });
    }
    try{
        const user = await User.findOne({ email: email.toLowerCase() }); // Ensure lowercase matching
         if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        if (user.isLocked()) {
            const timeLeft = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000)); // Time in minutes
            return res.status(429).json({
                message: `Account locked due to too many failed login attempts. Please try again in ${timeLeft} minutes.`,
                locked: true,
                lockUntil: user.lockUntil
            });
        }

        const isMatch= await user.comparePassword(password);

        if(isMatch){
            const UserPassword= await UserPassword.findOne({ userId: user._id });
            if(!UserPassword){
                const newUserPassword= new UserPassword({
                    userId: user._id
                });
                await newUserPassword.save();
                const token = createToken(user._id);
                return res.status(200).json({
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    token: token,
                    message: 'Logged in successfully'
                });
            }
            UserPassword.resetLoginAttempts();
        }
        else{
            const UserPassword= await UserPassword.findOne({ userId: user._id });
            await UserPassword.incLoginAttempts();
            return res.status(401).json({"message": "Invalid Credentials"});
        }
    }
    catch(err){
        return res.status(500).json({"message": "Internal Server Error"});   
    }
}


exports.updateUser = async (req, res) => {
    const { username, email, gamesPlayed, gamesWon, totalScore } = req.body;

    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (username && username !== user.username) {
            const usernameExists = await User.findOne({ username });
            if (usernameExists) {
                return res.status(400).json({ message: 'Username already taken.' });
            }
            user.username = username;
        }

        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                return res.status(400).json({ message: 'Email already registered.' });
            }
            user.email = email;
        }

        if (typeof gamesPlayed === 'number') user.gamesPlayed = gamesPlayed;
        if (typeof gamesWon === 'number') user.gamesWon = gamesWon;
        if (typeof totalScore === 'number') user.totalScore = totalScore;

        await user.save();

        res.status(200).json({
            message: 'User profile updated successfully.',
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                gamesPlayed: user.gamesPlayed,
                gamesWon: user.gamesWon,
                totalScore: user.totalScore,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Server error during user update.' });
    }
};

exports.deleteUser = async (req, res) => {
    const userId = req.user._id; // User to be deleted (themselves)
    if(userId== null){
        return res.status(400).json({"message": "Please define a Valid Token"});
    }
    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        await user.deleteOne(); // Mongoose 5.x+ uses deleteOne() or deleteMany()

        res.status(200).json({ message: 'User account deleted successfully.' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Server error during user deletion.' });
    }
};

exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword, email } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Please provide current and new passwords.' });
    }

    // Assuming isValidPassword function is available
    if (!isValidPassword(newPassword)) {
        return res.status(400).json({ message: 'New password does not meet complexity requirements.' });
    }

    try {
        const user = await User.find(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const isMatch = await user.comparePassword(currentPassword);

        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect.' });
        }

        user.password = newPassword; // The pre-save hook will hash this before saving
        await user.save();

        res.status(200).json({ message: 'Password updated successfully.' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Server error during password change.' });
    }
};

exports.logoutUser = (req, res) => {
    res.status(200).json({ message: 'Logged out successfully.' });
};

