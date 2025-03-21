const express = require('express');
const router = express.Router();
const { home } = require('../controllers/static');

router.get('/', home);

module.exports = router;