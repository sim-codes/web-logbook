const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middlewares/auth');
const {
    getUnapprovedInstitutions,
    approveInstitution,
    rejectInstitution
} = require('../controllers/institution');
const { getApprovedInstitutions } = require('../controllers/institution');

// Middleware to ensure only ITF can access these routes
const isITF = (req, res, next) => {
    if (req.user && req.user.role === 'itf') {
        return next();
    }
    req.session.message = {
        type: 'danger',
        message: 'Unauthorized access'
    };
    res.redirect('/dashboard');
};

// ITF routes
router.get('/institutions', isAuthenticated, getApprovedInstitutions, (req, res) => {
    res.render('itf/institutions-list', {
        title: 'eBooklog - Student Signup',
        user: req.user,
        institutions: req.institutions || []
    });
});

router.get('/approve-institutions', isITF, getUnapprovedInstitutions);
router.post('/approve-institution', isITF, approveInstitution);
router.post('/reject-institution', isITF, rejectInstitution);

module.exports = router;
