const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const isAuthenticated = require('../middlewares/auth');

// Profile routes
router.get('/profile', isAuthenticated, userController.getProfile);
router.post('/profile', isAuthenticated, userController.updateProfile);

module.exports = router;