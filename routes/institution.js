const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middlewares/auth');
const { getInstitutionStudents } = require('../controllers/institution');
const { getInstitutionForms, reviewInstitutionForm, submitInstitutionForm } = require('../controllers/form8');
const { getInstitutionSCAFs, reviewSCAF, submitSCAF } = require('../controllers/scaf');

router.get('/students', isAuthenticated, getInstitutionStudents);
router.get('/forms', isAuthenticated, getInstitutionForms);
router.get('/forms/:id/review', isAuthenticated, reviewInstitutionForm);
router.post('/forms/:id/review', isAuthenticated, submitInstitutionForm);

router.get('/scafs', isAuthenticated, getInstitutionSCAFs);
router.get('/scafs/:id/review', isAuthenticated, reviewSCAF);
router.post('/scafs/:id/review', isAuthenticated, submitSCAF);
module.exports = router;
