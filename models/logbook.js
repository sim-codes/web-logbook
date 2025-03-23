const mongoose = require('mongoose');

const logbookSchema = new mongoose.Schema({
    day: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    images: {
        type: Array
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }},
    {
        timestamps: true
    }
);


module.exports = mongoose.model('Logbook', logbookSchema);