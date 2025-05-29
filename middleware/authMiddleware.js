const User= require('../models/users.js');
const jwt= require('jsonwebtoken');

exports.authorizeUser=async (req,res,next)=>{
    const authHeader= req.headers.authorization;
    if(!authHeader || !authHeader.startsWith('Bearer')){
        return res.status(401).json({"message": "No token Provided. Authorization denied"});
    }

    const token= authHeader.split(' ')[1];
    try{
        const decoded= jwt.verify(token, process.env.JWT_SECRET);
        req.user= await User.findById(decoded.id).select('-password');

        if(!req.user){
            return res.status(401).json({"message": "User no Longer exists"});
        }

        next();
    }
    catch(err){
        return res.status(401).json({"message": "Invalid Or Expired Token"});
    }
}
