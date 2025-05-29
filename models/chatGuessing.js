const mongoose = require('mongoose');

const ChatGuessHistorySchema = new mongoose.Schema({
    gameId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GameSession',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    isGuess: {
        type: Boolean,
        default: false
    },
    isCorrect: {
        type: Boolean,
        required: function() {
            return this.isGuess; // Required only if it's a guess
        }
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const ChatGuessHistory = mongoose.model('ChatGuessHistory', ChatGuessHistorySchema);

module.exports = ChatGuessHistory;