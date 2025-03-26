const express = require('express');
const router = express.Router();
const {
    getUnapprovedInstitutions,
    approveInstitution,
    rejectInstitution
} = require('../controllers/institution');

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
router.get('/approve-institutions', isITF, getUnapprovedInstitutions);
router.post('/approve-institution', isITF, approveInstitution);
router.post('/reject-institution', isITF, rejectInstitution);

module.exports = router;
