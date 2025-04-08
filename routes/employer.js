const express = require('express');
const router = express.Router();
const { getEmployerForm, submitEmployerForm } = require('../controllers/formController');

router.get('/form8/:token', getEmployerForm);
router.post('/form8/:token', submitEmployerForm);
module.exports = router;
