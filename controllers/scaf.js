const { SCAF } = require('../models/forms');
const { Student } = require('../models/user');
const ITEMS_PER_PAGE = 10;

// Student: View SCAF list
const getStudentSCAFs = async (req, res) => {
    try {
        const studentId = req.user._id;

        const scafs = await SCAF.find({ 'students.student': studentId })
                .populate('institution', 'name');

        res.render('student/scaf-list', {
            title: 'eBooklog - My SCAFs',
            scafs,
            user: req.user
        });
    } catch (err) {
        console.error(err);
        req.session.message = { type: 'danger', message: 'Error fetching SCAFs' };
        res.redirect('/dashboard');
    }
};

// Student: Create new SCAF entry
const createSCAF = async (req, res) => {
    try {
        const studentId = req.user._id;
        const { courseOfStudy, yearOrLevel, attachmentPeriodMonths, commencementDate, completionDate } = req.body;

        // Check for duplicate
        const existingSCAF = await SCAF.findOne({
            'students.student': studentId,
            institution: req.user.institution,
            'students.commencementDate': commencementDate
        });
        if (existingSCAF) {
            req.session.message = { type: 'danger', message: 'SCAF already exists for this period' };
            return res.redirect('/student/scafs');
        }

        let scaf = await SCAF.findOne({ institution: req.user.institution, submissionDate: { $exists: false } });
        if (!scaf) {
            scaf = new SCAF({
                institution: req.user.institution,
                status: 'draft',
                createdBy: req.user._id
            });
        }

        scaf.students.push({
            student: studentId,
            courseOfStudy,
            yearOrLevel,
            attachmentPeriodMonths,
            commencementDate,
            completionDate
        });

        await scaf.save();
        req.session.message = { type: 'success', message: 'SCAF entry added' };
        res.redirect('/student/scafs');
    } catch (err) {
        console.error(err);
        req.session.message = { type: 'danger', message: 'Error creating SCAF' };
        res.redirect('/student/scafs');
    }
};

// Institution: View SCAF list
const getInstitutionSCAFs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * ITEMS_PER_PAGE;
        const institutionId = req.user._id;

        const [scafs, total] = await Promise.all([
            SCAF.find({ institution: institutionId })
                .skip(skip)
                .limit(ITEMS_PER_PAGE)
                .populate('students.student', 'name'),
            SCAF.countDocuments({ institution: institutionId })
        ]);

        res.render('institution/scaf-list', {
            title: 'eBooklog - SCAF Review',
            scafs,
            currentPage: page,
            totalPages: Math.ceil(total / ITEMS_PER_PAGE),
            user: req.user
        });
    } catch (err) {
        console.error(err);
        req.session.message = { type: 'danger', message: 'Error fetching SCAFs' };
        res.redirect('/dashboard');
    }
};

// Institution: Review and fill organization section
const reviewSCAF = async (req, res) => {
    try {
        const scafId = req.params.id;
        const scaf = await SCAF.findOne({ _id: scafId, institution: req.user._id })
            .populate('students.student', 'name');

        if (!scaf) {
            req.session.message = { type: 'danger', message: 'SCAF not found' };
            return res.redirect('/institution/scafs');
        }

        res.render('institution/scaf-review', {
            title: 'eBooklog - Review SCAF',
            scaf,
            user: req.user
        });
    } catch (err) {
        console.error(err);
        req.session.message = { type: 'danger', message: 'Error fetching SCAF' };
        res.redirect('/institution/scafs');
    }
};

// Institution: Submit SCAF
const submitSCAF = async (req, res) => {
    try {
        const scafId = req.params.id;
        const { name, address, phoneNumber, email } = req.body;

        const scaf = await SCAF.findOne({ _id: scafId, institution: req.user._id });
        if (!scaf) {
            req.session.message = { type: 'danger', message: 'SCAF not found' };
            return res.redirect('/institution/scafs');
        }

        scaf.organizationSection.name = name;
        scaf.organizationSection.address = address;
        scaf.organizationSection.phoneNumber = phoneNumber;
        scaf.organizationSection.email = email;
        scaf.organizationSection.filledByUser = req.user._id;
        scaf.submissionDate = new Date();
        scaf.status = 'submitted-organization';

        await scaf.save();
        req.session.message = { type: 'success', message: 'SCAF submitted' };
        res.redirect('/institution/scafs');
    } catch (err) {
        console.error(err);
        req.session.message = { type: 'danger', message: 'Error submitting SCAF' };
        res.redirect('/institution/scafs');
    }
};

// ITF: View completed SCAFs
const getITFSCAFs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * ITEMS_PER_PAGE;

        const [scafs, total] = await Promise.all([
            SCAF.find({ status: { $in: ['submitted-organization', 'approved-institution', 'approved-itf'] } })
                .skip(skip)
                .limit(ITEMS_PER_PAGE)
                .populate('institution', 'name')
                .populate('students.student', 'name'),
            SCAF.countDocuments({ status: { $in: ['submitted-organization', 'approved-institution', 'approved-itf'] } })
        ]);

        res.render('itf/scaf-list', {
            title: 'eBooklog - Completed SCAFs',
            scafs,
            currentPage: page,
            totalPages: Math.ceil(total / ITEMS_PER_PAGE),
            user: req.user
        });
    } catch (err) {
        console.error(err);
        req.session.message = { type: 'danger', message: 'Error fetching completed SCAFs' };
        res.redirect('/dashboard');
    }
};

// ITF: Delete a SCAF
const deleteSCAF = async (req, res) => {
    try {
        const scafId = req.params.id;
        const scaf = await SCAF.findOne({ _id: scafId, status: { $in: ['submitted-organization', 'approved-institution', 'approved-itf'] } });

        if (!scaf) {
            req.session.message = { type: 'danger', message: 'SCAF not found or not completed' };
            return res.redirect('/itf/scafs');
        }

        await SCAF.deleteOne({ _id: scafId });
        req.session.message = { type: 'success', message: 'SCAF deleted successfully' };
        res.redirect('/itf/scafs');
    } catch (err) {
        console.error(err);
        req.session.message = { type: 'danger', message: 'Error deleting SCAF' };
        res.redirect('/itf/scafs');
    }
};


module.exports = {
    getStudentSCAFs,
    createSCAF,
    getInstitutionSCAFs,
    reviewSCAF,
    submitSCAF,
    getITFSCAFs,
    deleteSCAF
};
