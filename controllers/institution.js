const { Institution, Student } = require('../models/user');

const ITEMS_PER_PAGE = 10;

const getApprovedInstitutions = async (req, res, next) => {
    try {
        const institutions = await Institution.find({ approved: true });
        req.institutions = institutions;
        next();
    } catch (err) {
        console.error('Error fetching institutions:', err);
        req.institutions = [];
        next();
    }
};

const getUnapprovedInstitutions = async (req, res) => {
    try {
        const unapprovedInstitutions = await Institution.find({ approved: false });
        res.render('itf/approve-institutions', {
            title: 'Approve Institutions',
            user: req.user,
            institutions: unapprovedInstitutions
        });
    } catch (err) {
        console.error('Error fetching unapproved institutions:', err);
        req.session.message = {
            type: 'danger',
            message: 'Failed to fetch institutions'
        };
        res.redirect('/dashboard');
    }
};

// Approve an institution
const approveInstitution = async (req, res) => {
    try {
        const { institutionId } = req.body;

        const institution = await Institution.findByIdAndUpdate(
            institutionId,
            { approved: true },
            { new: true }
        );

        if (!institution) {
            req.session.message = {
                type: 'danger',
                message: 'Institution not found'
            };
            return res.redirect('/itf/approve-institutions');
        }

        req.session.message = {
            type: 'success',
            message: `${institution.name} has been approved`
        };
        res.redirect('/itf/approve-institutions');
    } catch (err) {
        console.error('Error approving institution:', err);
        req.session.message = {
            type: 'danger',
            message: 'Failed to approve institution'
        };
        res.redirect('/itf/approve-institutions');
    }
};

const rejectInstitution = async (req, res) => {
    try {
        const { institutionId } = req.body;
        const institution = await Institution.findByIdAndDelete(institutionId);

        if (!institution) {
            req.session.message = {
                type: 'danger',
                message: 'Institution not found'
            };
            return res.redirect('/itf/approve-institutions');
        }

        req.session.message = {
            type: 'success',
            message: `${institution.name} has been rejected and removed`
        };
        res.redirect('/itf/approve-institutions');
    } catch (err) {
        console.error('Error rejecting institution:', err);
        req.session.message = {
            type: 'danger',
            message: 'Failed to reject institution'
        };
        res.redirect('/itf/approve-institutions');
    }
};

const deleteInstitution = async (req, res) => {
    try {
        await Institution.findByIdAndDelete(req.body.institutionId);
        req.flash('success', 'Institution deleted successfully');
    } catch (err) {
        console.error('Error deleting institution:', err);
        req.flash('error', 'Failed to delete institution');
    }
    res.redirect('/itf/institutions');
};

const getInstitutionStudents = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * ITEMS_PER_PAGE;

        const [students, total] = await Promise.all([
            Student.find({ institution: req.user._id })
                .skip(skip)
                .limit(ITEMS_PER_PAGE)
                .populate('supervisor'),
            Student.countDocuments({ institution: req.user._id })
        ]);

        res.render('institution/students-list', {
            title: 'eBooklog - Your Students',
            students,
            currentPage: page,
            totalPages: Math.ceil(total / ITEMS_PER_PAGE),
            user: req.user
        });
    } catch (err) {
        console.error(err);
        req.session.message = {
            type: 'danger',
            message: 'Error fetching students'
        };
        res.redirect('/dashboard');
    }
};

module.exports = {
    getApprovedInstitutions,
    getUnapprovedInstitutions,
    approveInstitution,
    rejectInstitution,
    deleteInstitution,
    getInstitutionStudents
};
