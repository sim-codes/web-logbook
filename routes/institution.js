const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middlewares/auth');
const { getInstitutionStudents } = require('../controllers/institution');
const { getInstitutionForms, reviewInstitutionForm } = require('../controllers/formController');

router.get('/students', isAuthenticated, getInstitutionStudents);
router.get('/forms', isAuthenticated, getInstitutionForms);
router.get('/forms/:id/review', isAuthenticated, reviewInstitutionForm);
// router.post('/institution/forms/:id/review', isInstitution, formController.submitInstitutionForm);

module.exports = router;
