// models/endOfYearReport.js
const mongoose = require('mongoose');

const StudentEntrySchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    courseOfStudy: String,
    yearOrLevel: String,
    attachmentPeriodMonths: Number,
    commencementDate: Date,
    completionDate: Date
});

const CommencementFormSchema = new mongoose.Schema({
    organizationSection: {
        name: String,
        address: String,
        phoneNumber: String,
        email: String,
        filledByUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    institution: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Institution'
    },
    students: [StudentEntrySchema],
    institutionApprover: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    institutionComments: String,
    itfApprover: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ITF'
    },
    itfComments: String,
    submissionDate: Date,
    status: {
        type: String,
        enum: [
            'draft',
            'submitted-student',
            'submitted-organization',
            'approved-institution',
            'approved-itf',
            'rejected'
        ],
        default: 'draft'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

const EndOfYearReportSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    institution: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Institution'
    },
    studentSection: {
        courseOfStudy: String,
        yearOfStudy: String,
        companyName: String,
        companyAddress: String,
        department: String,
        startDate: Date,
        endDate: Date,
        totalWeeks: Number,
        trainingExperience: String,
        previousAttachment: String,
        totalWeeksAttached: Number
    },
    employerSection: {
        employerComment: String,
        employerAssessment: {
            type: String,
            enum: ['VERY GOOD', 'GOOD', 'SATISFACTORY', 'POOR']
        },
        futureAcceptance: Boolean,
        futureJobOffer: String,
        officerDesignation: String,
        officerEmail: String,
        officerPhone: String,
        employerSignatureDate: Date,
        token: {
            type: String,
            unique: true
        },
        tokenExpires: {
            type: Date
        }
    },
    institutionSection: {
        numberOfVisits: Number,
        facilityAssessment: {
            type: String,
            enum: ['STANDARD', 'ADEQUATE', 'RELEVANT', 'NOT RELEVANT']
        },
        studentInvolvement: {
            type: String,
            enum: ['FULLY', 'PARTIALLY']
        },
        studentPerformanceGrade: {
            type: String,
            enum: ['A', 'B', 'C', 'D']
        },
        supervisorComments: String,
        supervisor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        supervisorDepartment: String,
        supervisorEmail: String,
        supervisorPhone: String,
        supervisorSignatureDate: Date
    },
    status: {
        type: String,
        enum: [
            'draft',
            'submitted-student',
            'reviewed-employer',
            'submitted-employer',
            'reviewed-institution',
            'completed'
        ],
        default: 'draft'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });



EndOfYearReportSchema.index({ student: 1, startDate: 1, endDate: 1 }, { unique: true });
CommencementFormSchema.index({ 'students.student': 1, institution: 1, submissionDate: 1 }, { unique: true });

const SCAF = mongoose.model('CommencementForm', CommencementFormSchema);
const Form8 = mongoose.model('EndOfYearReport', EndOfYearReportSchema)

module.exports = { SCAF, Form8 };