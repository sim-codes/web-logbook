const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middlewares/auth');
const { getBankDetails } = require('../controllers/student')

router.get('/bank-details', isAuthenticated, getBankDetails);
module.exports = router;
