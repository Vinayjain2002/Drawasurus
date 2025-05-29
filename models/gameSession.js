const mongoose = require('mongoose');

const GameSessionSchema = new mongoose.Schema({
    gameId: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    roomCode: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true,
        minlength: 3,
        maxlength: 6
    },
    players: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    currentDrawer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    currentWord: {
        type: String,
        required: true,
        trim: true
    },
    roundNumber: {
        type: Number,
        default: 1,
        min: 1
    },
    maxRounds: {
        type: Number,
        required: true,
        min: 1
    },
    status: {
        type: String,
        required: true,
        enum: ['waiting', 'in-progress', 'finished', 'cancelled'],
        default: 'waiting'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    endedAt: {
        type: Date,
        required: false
    }
});

const GameSession = mongoose.model('GameSession', GameSessionSchema);

module.exports = GameSession;
