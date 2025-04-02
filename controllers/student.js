const { Student } = require('../models/user');

const getBankDetails = async (req, res) => {
    try {

        res.render('student/bank', {
            title: 'eBooklog - Student Account',
            user: req.user
        });
    } catch (err) {
        console.error(err);
        req.flash('error', 'Error fetching students');
        req.session.message = {
            type: 'danger',
            message: 'Failed to fetch bank details'
        };
        res.redirect('/dashboard');
    }
};

module.exports = {
    getBankDetails
};