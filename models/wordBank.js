const mongoose = require('mongoose');

const WordBankSchema = new mongoose.Schema({
    word: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    category: {
        type: String,
        trim: true
    },
    difficulty: {
        type: String,
        required: true,
        enum: ['easy', 'medium', 'hard']
    }
});

const WordBank = mongoose.model('WordBank', WordBankSchema);

module.exports = WordBank;