const mongoose = require('mongoose');

const RoundHistorySchema = new mongoose.Schema({
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GameSession',
    required: true
  },
  roundNumber: {
    type: Number,
    required: true
  },
  word: {
    type: String,
    required: true
  },
  drawerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  guesses: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    guess: String,
    isCorrect: Boolean,
    timestamp: Date
  }],
  startedAt: {
    type: Date,
    default: Date.now
  },
  endedAt: {
    type: Date
  }
});

const RoundHistory = mongoose.model('RoundHistory', RoundHistorySchema);
module.exports = RoundHistory;
