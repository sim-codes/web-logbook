const { Institution } = require('../models/user');

const getApprovedInstitutions = async (req, res, next) => {
    try {
        const institutions = await Institution.find({ approved: true }, 'name _id');
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

module.exports = { getApprovedInstitutions, getUnapprovedInstitutions, approveInstitution, rejectInstitution  };
