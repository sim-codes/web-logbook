const mongoose = require('mongoose');

const logbookSchema = new mongoose.Schema({
    day: {
        type: Date,
        required: true
    },
    work: {
        type: String,
        required: true
    },
    images: {
        type: [String]
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    }
    }, {
    timestamps: true
});

module.exports = mongoose.model('Logbook', logbookSchema);
