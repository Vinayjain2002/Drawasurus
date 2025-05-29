const mongoose = require('mongoose');

const EventLogSchema = new mongoose.Schema({
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GameSession',
    required: true
  },
  eventType: {
    type: String,
    enum: ['join', 'leave', 'guess', 'start', 'end', 'draw', 'message'],
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  details: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const EventLog = mongoose.model('EventLog', EventLogSchema);
module.exports = EventLog;
