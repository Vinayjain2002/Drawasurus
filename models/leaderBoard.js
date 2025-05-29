const mongoose = require('mongoose');

const UserOverallStatsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true,
        trim: true
    },
    totalScore: {
        type: Number,
        default: 0
    },
    gamesPlayed: {
        type: Number,
        default: 0
    },
    gamesWon: {
        type: Number,
        default: 0
    },
    averageScore: {
        type: Number
    },
    lastPlayedAt: {
        type: Date
    },
    rank: {
        type: Number
    }
});

const UserOverallStats = mongoose.model('UserOverallStats', UserOverallStatsSchema);

module.exports = UserOverallStats;