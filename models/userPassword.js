const mongoose = require('mongoose');
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME_MINUTES = 30;

const UserPasswordSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        index: true, 
        required: true,
    },
    loginAttempts: {
        type: Number,
        required: true,
        default: 0
    },
    lockUntil: {
        type: Date,
        default: null
    },
    lastAttempt: {
        type: Date,
        default: null
    }
});

UserPasswordSchema.methods.incLoginAttempts= async function(){
    if(this.lockUntil && this.lockUntil > Date.now()){
        return;
    }

    this.loginAttempts+=1;
    this.lastAttempt= new Date();
    if(this.loginAttempts >= MAX_LOGIN_ATTEMPTS){
        this.lockUntil= new Date(Date.now()+ LOCK_TIME_MINUTES*60*1000);
    }
    await this.save();
}

UserPasswordSchema.methods.resetLoginAttempts= async function(){
    this.loginAttempts=0;
    this.lockUntil= null;
    this.lastAttempt= null;
    await this.save();
}

const UserPassword= mongoose.model('UserPassword', UserPasswordSchema);
module.exports= UserPassword;