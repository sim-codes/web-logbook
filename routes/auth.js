const express = require('express');
const router = express.Router();
const { signin, signup,
    loginUser, register, logout
} = require('../controllers/auth');

router.get('/signin', signin);
router.get('/signup', signup);

router.post('/login', loginUser);
router.get('/logout', logout);
router.post('/register', register);

module.exports = router;