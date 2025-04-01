const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

// Base User Schema
const BaseUserSchema = new mongoose.Schema({
    name: String,
    email: {
        type: String,
        unique: true,
        required: true,
    },
    role: {
        type: String,
        enum: ['student', 'lecturer', 'institution', 'itf', 'admin'],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Plugin for authentication
BaseUserSchema.plugin(passportLocalMongoose, {
    usernameField: 'email',
    usernameUnique: false
});


// Student-specific fields
const StudentSchema = new mongoose.Schema({
    matricNumber: String,
    institution: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Institution'
    },
    supervisor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lecturer'
    },
    logs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Logbook'
    }]
});

// Lecturer-specific fields
const LecturerSchema = new mongoose.Schema({
    staffId: String,
    institution: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Institution'
    },
    studentsSupervised: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }]
});

// Institution-specific fields
const InstitutionSchema = new mongoose.Schema({
    address: String,
    approved: {
        type: Boolean,
        default: false
    },
    lecturers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lecturer'
    }],
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }]
});

// ITF-specific fields
const ITFSchema = new mongoose.Schema({
    region: String,
    officeAddress: String
});

// Create discriminators
const User = mongoose.model('User', BaseUserSchema);
const Student = User.discriminator('Student', StudentSchema);
const Lecturer = User.discriminator('Lecturer', LecturerSchema);
const Institution = User.discriminator('Institution', InstitutionSchema);
const ITF = User.discriminator('ITF', ITFSchema);

module.exports = { User, Student, Lecturer, Institution, ITF };
