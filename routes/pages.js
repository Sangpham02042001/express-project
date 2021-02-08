var express = require('express');
var router = express.Router();
var Page = require('../models/page');

router.get('/', (req, res, next) => {
    Page.findOne({ slug: 'home' }, (err, page) => {
        if (err) {
            console.log(err);
        } else {
            res.render('index', {
                title: page.title,
                content: page.content
            })
        }
    })
});

router.get('/:slug', (req, res, next) => {
    var slug = req.params.slug;

    Page.findOne({ slug: slug }, (err, page) => {
        if (err) {
            console.log(err);
        } else {
            if (!page) {
                res.redirect('/');
            } else {
                res.render('index', {
                    title: page.title,
                    content: page.content
                })
            }
        }
    })
});

module.exports = router;