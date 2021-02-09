var express = require('express');
var router = express.Router();
var User = require('../models/user');
var passport = require('passport');
var bcrypt = require('bcryptjs');

router.get('/register', (req, res, next) => {
    res.render('register', {
        title: 'Register'
    });
});

router.post('/register', (req, res, next) => {
    var name = req.body.name,
        email = req.body.email,
        username = req.body.username,
        password = req.body.password,
        password2 = req.body.password2;

    req.checkBody('name', "Name is required").notEmpty();
    req.checkBody('email', "Email is required").notEmpty();
    req.checkBody('username', "User name is required").notEmpty();
    req.checkBody('password', "password is required").notEmpty();
    req.checkBody('password2', "Password does not match").equals(password);

    var errors = req.validationErrors();

    if (errors) {
        res.render('register', {
            errors: errors,
            title: 'Register'
        });
    } else {
        User.findOne({ username: username }, (err, user) => {
            if (err) {
                console.log(err);
            } else {
                if (user) {
                    req.flash('danger', "Username exist, choose another");
                    res.redirect('/users/register');
                } else {
                    var user = new User({
                        name: name,
                        username: username,
                        email: email,
                        password: password,
                        admin: 0
                    });

                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(user.password, salt, (err, hash) => {
                            if (err) {
                                console.log(err);
                            } else {
                                user.password = hash;
                                user.save((err) => {
                                    if (err) {
                                        console.log(err)
                                    } else {
                                        req.flash('success', "Register successfully");
                                        res.redirect('/users/login');
                                    }
                                });
                            }
                        });
                    });
                }
            }
        });
    }
});

router.get('/login', (req, res, next) => {
    if (req.user) {
        res.redirect('/');
    } else {
        res.render('login', {
            title: 'Login'
        });
    }
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

module.exports = router;