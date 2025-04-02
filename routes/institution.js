const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middlewares/auth');
const { getInstitutionStudents } = require('../controllers/institution');

router.get('/students', isAuthenticated, getInstitutionStudents);
module.exports = router;
