// routes/dashboard.js
const express = require('express');
const router = express.Router();
const { dashboard, createLog, getEditLog, updateLog, deleteLog } = require('../controllers/dashboard');
const isAuthenticated = require('../middlewares/auth');
const upload = require('../multer');

router.get('', isAuthenticated, dashboard);
router.get('/logbooks/new', isAuthenticated, (req, res) =>
    res.render('logbooks/new',
        {
            title: 'New Log',
            user: req.user
        })
);
router.post('/logbooks', isAuthenticated, upload, createLog);
router.get('/logbooks/:id/edit', isAuthenticated, getEditLog);
router.post('/logbooks/:id/update', isAuthenticated, upload, updateLog);
router.post('/logbooks/:id/delete', isAuthenticated, deleteLog);

module.exports = router;