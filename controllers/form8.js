const { Form8, SCAF } = require('../models/forms');
const { Student } = require('../models/user');
const crypto = require('crypto');
const ITEMS_PER_PAGE = 10;

const generateEmployerToken = () => {
    return crypto.randomBytes(16).toString('hex');
};


const getStudentForms = async (req, res) => {
    try {
        const studentId = req.user._id;

        const forms = await Form8.find({ student: studentId })
                .populate('institution', 'name');

        res.render('student/form8-list', {
            title: 'eBooklog - My Forms',
            forms,
            user: req.user
        });
    } catch (err) {
        console.error(err);
        req.session.message = { type: 'danger', message: 'Error fetching forms' };
        res.redirect('/dashboard');
    }
};

// Student: Create new Form8
const createForm8 = async (req, res) => {
    try {
        const studentId = req.user._id;
        const { courseOfStudy, yearOfStudy, companyName, companyAddress, department, startDate, endDate, trainingExperience } = req.body;

        const existingForm = await Form8.findOne({ student: studentId, startDate, endDate });
        if (existingForm) {
            req.session.message = { type: 'danger', message: 'Form already exists for this period' };
            return res.redirect('/student/form8');
        }

        const form = new Form8({
            student: studentId,
            institution: req.user.institution,
            studentSection: {
                courseOfStudy,
                yearOfStudy,
                companyName,
                companyAddress,
                department,
                startDate,
                endDate,
                totalWeeks: Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24 * 7)),
                trainingExperience
            },
            status: 'draft'
        });

        await form.save();
        req.session.message = { type: 'success', message: 'Form draft created' };
        res.redirect('/student/form8');
    } catch (err) {
        console.error(err);
        req.session.message = { type: 'danger', message: 'Error creating form' };
        res.redirect('/student/form8');
    }
};

// Student: Submit Form8
const submitForm8 = async (req, res) => {
    try {
        const formId = req.params.id;
        const form = await Form8.findOne({ _id: formId, student: req.user._id });

        if (!form) {
            return res.status(404).send('Form not found');
        }

        if (form.status !== 'draft') {
            req.session.message = { type: 'danger', message: 'Form already submitted' };
            return res.redirect('/student/form8');
        }

        // Generate employer token
        const token = generateEmployerToken();
        form.employerSection.token = token;
        form.employerSection.tokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days expiry
        form.status = 'submitted-student';
        await form.save();

        // TODO: Send email with link `/form8/employer/${token}` to employer (implement email logic)
        console.log(`Please complete the assessment: ${req.protocol}://${req.get('host')}/employer/form8/${token}`)
        req.session.message = { type: 'success', message: 'Form submitted, employer notified' };
        res.redirect('/student/form8');
    } catch (err) {
        console.error(err);
        req.session.message = { type: 'danger', message: 'Error submitting form' };
        res.redirect('/student/form8');
    }
};

// Employer: Access Form8 via token
const getEmployerForm = async (req, res) => {
    try {
        const token = req.params.token;
        const form = await Form8.findOne({ 'employerSection.token': token })
            .populate('student', 'name')
            .populate('institution', 'name');

        if (!form || new Date() > form.employerSection.tokenExpires) {
            return res.status(404).send('Invalid or expired link');
        }

        res.render('employer/form8', {
            title: 'Employer Assessment',
            form,
            token
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

// Employer: Submit their section
const submitEmployerForm = async (req, res) => {
    try {
        const token = req.params.token;
        const { employerComment, employerAssessment, futureAcceptance, reportingOfficer, officerDesignation, officerEmail, officerPhone } = req.body;

        const form = await Form8.findOne({ 'employerSection.token': token });
        if (!form || new Date() > form.employerSection.tokenExpires) {
            return res.status(404).send('Invalid or expired link');
        }

        form.employerSection.employerComment = employerComment;
        form.employerSection.employerAssessment = employerAssessment;
        form.employerSection.futureAcceptance = futureAcceptance === 'true';
        form.employerSection.reportingOfficer = reportingOfficer;
        form.employerSection.officerDesignation = officerDesignation;
        form.employerSection.officerEmail = officerEmail;
        form.employerSection.officerPhone = officerPhone;
        form.employerSection.employerSignatureDate = new Date();
        form.status = 'reviewed-employer';
        form.employerSection.token = null;
        form.employerSection.tokenExpires = null;

        await form.save();
        res.send('Assessment submitted successfully. Thank you!');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error submitting assessment');
    }
};

// Institution: View and approve Form8
const getInstitutionForms = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * ITEMS_PER_PAGE;
        const institutionId = req.user._id;

        const [forms, total] = await Promise.all([
            Form8.find({ institution: institutionId, status: { $in: ['reviewed-employer', 'submitted-employer'] } })
                .skip(skip)
                .limit(ITEMS_PER_PAGE)
                .populate('student', 'name'),
            Form8.countDocuments({ institution: institutionId, status: { $in: ['reviewed-employer', 'submitted-employer'] } })
        ]);

        res.render('institution/form8-list', {
            title: 'eBooklog - Review Forms',
            forms,
            currentPage: page,
            totalPages: Math.ceil(total / ITEMS_PER_PAGE),
            user: req.user
        });
    } catch (err) {
        console.error(err);
        req.session.message = { type: 'danger', message: 'Error fetching forms' };
        res.redirect('/dashboard');
    }
};

const reviewInstitutionForm = async (req, res) => {
    try {
        const formId = req.params.id;
        const institutionId = req.user._id;

        const form = await Form8.findOne({ _id: formId, institution: institutionId })
            .populate('student', 'name')
            .populate('institution', 'name');

        if (!form || !['reviewed-employer', 'submitted-employer'].includes(form.status)) {
            req.session.message = { type: 'danger', message: 'Form not found or not ready for review' };
            return res.redirect('/institution/forms');
        }

        res.render('institution/form8-review', {
            title: 'eBooklog - Review Form8',
            form,
            user: req.user
        });
    } catch (err) {
        console.error(err);
        req.session.message = { type: 'danger', message: 'Error fetching form' };
        res.redirect('/institution/forms');
    }
};

const submitInstitutionForm = async (req, res) => {
    try {
        const formId = req.params.id;
        const institutionId = req.user._id;
        const {
            numberOfVisits,
            facilityAssessment,
            studentInvolvement,
            studentPerformanceGrade,
            supervisorComments,
            supervisorName,
            supervisorDepartment,
            supervisorEmail,
            supervisorPhone
        } = req.body;

        const form = await Form8.findOne({ _id: formId, institution: institutionId });
        if (!form || !['reviewed-employer', 'submitted-employer'].includes(form.status)) {
            req.session.message = { type: 'danger', message: 'Form not found or not ready for review' };
            return res.redirect('/institution/forms');
        }

        form.institutionSection.numberOfVisits = numberOfVisits;
        form.institutionSection.facilityAssessment = facilityAssessment;
        form.institutionSection.studentInvolvement = studentInvolvement;
        form.institutionSection.studentPerformanceGrade = studentPerformanceGrade;
        form.institutionSection.supervisorComments = supervisorComments;
        form.institutionSection.supervisor = req.user._id;
        form.institutionSection.supervisorName = supervisorName;
        form.institutionSection.supervisorDepartment = supervisorDepartment;
        form.institutionSection.supervisorEmail = supervisorEmail;
        form.institutionSection.supervisorPhone = supervisorPhone;
        form.institutionSection.supervisorSignatureDate = new Date();
        form.status = 'completed';

        await form.save();
        req.session.message = { type: 'success', message: 'Form review completed' };
        res.redirect('/institution/forms');
    } catch (err) {
        console.error(err);
        req.session.message = { type: 'danger', message: 'Error submitting review' };
        res.redirect('/institution/forms');
    }
};

// ITF: View completed Form8s
const getITFForm8s = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * ITEMS_PER_PAGE;

        const [forms, total] = await Promise.all([
            Form8.find({ status: 'completed' })
                .skip(skip)
                .limit(ITEMS_PER_PAGE)
                .populate('student', 'name')
                .populate('institution', 'name'),
            Form8.countDocuments({ status: 'completed' })
        ]);

        res.render('itf/form8-list', {
            title: 'eBooklog - Completed Form8s',
            forms,
            currentPage: page,
            totalPages: Math.ceil(total / ITEMS_PER_PAGE),
            user: req.user
        });
    } catch (err) {
        console.error(err);
        req.session.message = { type: 'danger', message: 'Error fetching completed Form8s' };
        res.redirect('/dashboard');
    }
};

// ITF: Delete a Form8
const deleteForm8 = async (req, res) => {
    try {
        const formId = req.params.id;
        const form = await Form8.findOne({ _id: formId, status: 'completed' });

        if (!form) {
            req.session.message = { type: 'danger', message: 'Form not found or not completed' };
            return res.redirect('/itf/form8s');
        }

        await Form8.deleteOne({ _id: formId });
        req.session.message = { type: 'success', message: 'Form8 deleted successfully' };
        res.redirect('/itf/form8s');
    } catch (err) {
        console.error(err);
        req.session.message = { type: 'danger', message: 'Error deleting Form8' };
        res.redirect('/itf/form8s');
    }
};

module.exports = {
    getStudentForms,
    createForm8,
    submitForm8,
    getEmployerForm,
    submitEmployerForm,
    getInstitutionForms,
    reviewInstitutionForm,
    submitInstitutionForm,
    getITFForm8s,
    deleteForm8
};