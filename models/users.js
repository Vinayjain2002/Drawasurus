const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        trim: true,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    gamesPlayed: {
        type: Number,
        default: 0
    },
    gamesWon: {
        type: Number,
        default: 0
    },
    totalScore: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        // Corrected: Use Date.now to set the default to the current timestamp
        default: Date.now
    }
});

UserSchema.pre('save', async function(next){
    if(!this.isModified('password')){
        return next();
    }

    const salt= await bcrypt.genSalt(10);
    this.password= await bcrypt.hash(this.password, salt);

    next();
});

UserSchema.methods.comparePassword= function(candidatePassword){
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', UserSchema);
module.exports = User;