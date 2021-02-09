var express = require('express');
var router = express.Router();
var User = require('../models/user');

router.get('/login', (req, res, next) => {
    res.render('admin', {
        title: "Admin Check"
    });
});

router.post('/login', (req, res, next) => {
    req.checkBody('adminname', "Admin name is required").notEmpty();
    req.checkBody('password', "password is required").notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        res.render('register', {
            errors: errors,
            title: 'Register'
        });
    } else {
        if (req.body.adminname == 'admin') {
            res.redirect('/admin/pages');
        } else {
            res.render('admin', {
                title: "Admin Check"
            });
        }
    }
})

module.exports = router;