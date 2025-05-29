const mongoose = require('mongoose');

const PlayerGameStatsSchema = new mongoose.Schema({
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
    score: {
        type: Number,
        default: 0
    },
    isWinner: {
        type: Boolean,
        default: false
    },
    guessedCorrectly: [{
        type: Boolean
    }]
});

const PlayerGameStats = mongoose.model('PlayerGameStats', PlayerGameStatsSchema);

module.exports = PlayerGameStats;