const express = require('express');
const router = express.Router();
const { getEmployerForm, submitEmployerForm } = require('../controllers/form8');
const { getOrgSCAF, submitOrgSCAF } = require('../controllers/scaf');

router.get('/form8/:token', getEmployerForm);
router.post('/form8/:token', submitEmployerForm);

router.get('/scaf/:token', getOrgSCAF);
router.post('/scaf/:token', submitOrgSCAF);

module.exports = router;
