const { SCAF } = require('../models/forms');
const { Student } = require('../models/user');
const crypto = require('crypto');
const ITEMS_PER_PAGE = 10;

const generateOrgToken = () => {
    return crypto.randomBytes(16).toString('hex');
};

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

// Student: Submit SCAF for organization review
const submitSCAF = async (req, res) => {
    try {
        const scafId = req.params.id;
        const scaf = await SCAF.findOne({ _id: scafId, 'students.student': req.user._id });

        if (!scaf) {
            req.session.message = { type: 'danger', message: 'SCAF not found' };
            return res.redirect('/student/scafs');
        }

        if (scaf.status !== 'draft') {
            req.session.message = { type: 'danger', message: 'SCAF already submitted' };
            return res.redirect('/student/scafs');
        }

        const token = generateOrgToken();
        scaf.organizationSection.token = token;
        scaf.organizationSection.tokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        scaf.status = 'submitted-student';
        await scaf.save();

        // TODO: Send email with link `/scaf/organization/${token}` to organization
        console.log(`Please complete the assessment: ${req.protocol}://${req.get('host')}/organization/scaf/${token}`)
        req.session.message = { type: 'success', message: 'SCAF submitted, organization notified' };
        res.redirect('/student/scafs');
    } catch (err) {
        console.error(err);
        req.session.message = { type: 'danger', message: 'Error submitting SCAF' };
        res.redirect('/student/scafs');
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

// Organization: Access SCAF via token
const getOrgSCAF = async (req, res) => {
    try {
        const token = req.params.token;
        const scaf = await SCAF.findOne({ 'organizationSection.token': token })
            .populate('students.student', 'name');

        if (!scaf || new Date() > scaf.organizationSection.tokenExpires) {
            return res.status(404).send('Invalid or expired link');
        }

        res.render('organization/scaf', {
            title: 'Organization SCAF Details',
            scaf,
            token
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

// Organization: Submit their section
const submitOrgSCAF = async (req, res) => {
    try {
        const token = req.params.token;
        const { name, address, phoneNumber, email } = req.body;

        const scaf = await SCAF.findOne({ 'organizationSection.token': token });
        if (!scaf || new Date() > scaf.organizationSection.tokenExpires) {
            return res.status(404).send('Invalid or expired link');
        }

        scaf.organizationSection.name = name;
        scaf.organizationSection.address = address;
        scaf.organizationSection.phoneNumber = phoneNumber;
        scaf.organizationSection.email = email;
        scaf.submissionDate = new Date();
        scaf.status = 'submitted-organization';
        scaf.organizationSection.token = null;
        scaf.organizationSection.tokenExpires = null;

        await scaf.save();
        res.send('SCAF submitted successfully. Thank you!');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error submitting SCAF');
    }
};


module.exports = {
    getStudentSCAFs,
    createSCAF,
    getInstitutionSCAFs,
    reviewSCAF,
    submitSCAF,
    getITFSCAFs,
    deleteSCAF,
    getOrgSCAF,
    submitOrgSCAF
};
