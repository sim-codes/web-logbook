const express = require('express');
const router = express.Router();
const { dashboard } = require('../controllers/dashboard');
const isAuthenticated = require('../middlewares/auth');

router.get('', isAuthenticated, dashboard);

module.exports = router;