const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middlewares/auth');
const {
    signin,
    signup,
    loginUser,
    register,
    logout,
    signOut
} = require('../controllers/auth');
const { getApprovedInstitutions } = require('../controllers/institution');

// Authentication routes
router.get('/signin', signin);
router.get('/signup/select-role', signup);

// Specific signup routes with institution fetching
router.get('/signup/student', getApprovedInstitutions, (req, res) => {
    res.render('auth/signup-student', {
        title: 'eBooklog - Student Signup',
        user: req.user,
        institutions: req.institutions || []
    });
});

router.get('/signup/lecturer', getApprovedInstitutions, (req, res) => {
    res.render('auth/signup-lecturer', { 
        title: 'eBooklog - Lecturer Signup',
        user: req.user,
        institutions: req.institutions || []
    });
});

router.get('/signup/institution', (req, res) => {
    res.render('auth/signup-institution', { 
        title: 'eBooklog - Institution Signup',
        user: req.user 
    });
});

router.get('/signup/itf', (req, res) => {
    res.render('auth/signup-itf', {
        title: 'eBooklog - ITF Signup',
        user: req.user
    });
});

router.post('/login', loginUser);
router.get('/logout', isAuthenticated, signOut);
router.post('/logout', isAuthenticated, logout);
router.post('/register', register);

module.exports = router;
