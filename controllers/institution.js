const { Institution } = require('../models/user');

// Get all approved institutions
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

module.exports = { getApprovedInstitutions };
