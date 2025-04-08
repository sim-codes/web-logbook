const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middlewares/auth');
const { getBankDetails, postBankDetails } = require('../controllers/student')

router.get('/bank-details', isAuthenticated, getBankDetails);
router.post('/bank', isAuthenticated, postBankDetails);
module.exports = router;
