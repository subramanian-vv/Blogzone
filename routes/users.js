const express = require('express');
const router = express.Router();

const { ensureAuthenticated } = require('../config/auth');

//User model
const User = require('../models/User');

router.get('/dashboard', ensureAuthenticated, function (req, res) {
    res.render('dashboard', {
        name: req.user.name
    });
});

module.exports = router;