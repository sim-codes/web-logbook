const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middlewares/auth');
const { getBankDetails, postBankDetails } = require('../controllers/student')
const { getStudentForms, createForm8, submitForm8 } = require('../controllers/formController');

router.get('/bank-details', isAuthenticated, getBankDetails);
router.post('/bank', isAuthenticated, postBankDetails);


router.get('/form8', isAuthenticated, getStudentForms);
router.post('/form8/draft', isAuthenticated, createForm8);
router.get('/form8/:id/submit', isAuthenticated, submitForm8);
router.get('/form8/new', isAuthenticated,
    (req, res) => res.render('student/form8-new',
        {
            title: 'eBooklog - Fill Form 8',
            user: req.user
        }));

module.exports = router;
