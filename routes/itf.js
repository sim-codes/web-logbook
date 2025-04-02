const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middlewares/auth');
const isITF = require('../middlewares/itf');
const {
    getUnapprovedInstitutions,
    approveInstitution,
    rejectInstitution,
    deleteInstitution
} = require('../controllers/institution');
const { getITFStudents } = require('../controllers/itf')
const { Institution } = require('../models/user');

// ITF routes
router.get('/institutions', isAuthenticated, isITF, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const ITEMS_PER_PAGE = 10;
        const skip = (page - 1) * ITEMS_PER_PAGE;

        const [institutions, total] = await Promise.all([
            Institution.find({ approved: true })
                .skip(skip)
                .limit(ITEMS_PER_PAGE),
            Institution.countDocuments({ approved: true })
        ]);

        res.render('itf/institutions-list', {
            title: 'eBooklog - Institutions',
            institutions,
            currentPage: page,
            totalPages: Math.ceil(total / ITEMS_PER_PAGE),
            user: req.user
        });
    } catch (err) {
        console.error(err);
        req.session.message = {
            type: 'danger',
            message: 'Error fetching institutions'
        };
        res.redirect('/dashboard');
    }
});

router.get('/students', isAuthenticated, isITF, getITFStudents);

router.get('/approve-institutions', isAuthenticated, isITF, getUnapprovedInstitutions);
router.post('/approve-institution', isAuthenticated, isITF, approveInstitution);
router.post('/reject-institution', isAuthenticated, isITF, rejectInstitution);
router.post('/delete-institution', isAuthenticated, isITF, deleteInstitution);

module.exports = router;
