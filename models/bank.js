const mongoose = require('mongoose');

const bankSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
        unique: true
    },
    accountNumber: {
        type: String,
        required: true,
        immutable: true
    },
    bankName: {
        type: String,
        required: true,
        immutable: true
    },
    bankSortCode: {
        type: String,
        required: true,
        immutable: true
    },
    accountName: {
        type: String,
        required: true,
        immutable: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        immutable: true
    }
});

module.exports = mongoose.model('Bank', bankSchema);