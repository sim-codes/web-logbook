const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middlewares/auth');
const { getInstitutionStudents } = require('../controllers/institution');
const { getInstitutionForms, reviewInstitutionForm, submitInstitutionForm } = require('../controllers/form8');

router.get('/students', isAuthenticated, getInstitutionStudents);
router.get('/forms', isAuthenticated, getInstitutionForms);
router.get('/forms/:id/review', isAuthenticated, reviewInstitutionForm);
router.post('/forms/:id/review', isAuthenticated, submitInstitutionForm);

module.exports = router;
