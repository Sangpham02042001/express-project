var express = require('express');
var router = express.Router();
var Page = require('../models/page');

router.get('/', (req, res, next) => {
    Page.find({}).sort({ sorting: 1 }).exec((err, pages) => {
        if (err) return;
        res.render('admin/pages', {
            pages: pages
        });
    });
});

router.get('/add-page', (req, res) => {
    var title = "",
        slug = "",
        content = "";

    res.render('admin/add_page', {
        title: title,
        slug: slug,
        content: content
    })
});

router.post('/add-page', (req, res) => {
    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('content', 'Content must have a value.').notEmpty();

    var title = req.body.title,
        slug = req.body.slug.replace(/\s+/g, '-').toLowerCase(),
        content = req.body.content;

    if (slug == '') slug = title.replace(/\s+/g, '-').toLowerCase();

    var errors = req.validationErrors();

    if (errors) {
        res.render('admin/add_page', {
            errors: errors,
            title: title,
            slug: slug,
            content: content
        })
    } else {
        console.log('Success');
        Page.findOne({ slug: slug }, (err, page) => {
            if (page) {
                req.flash('danger', "Page slug existed, choose another");
                res.render('admin/add_page', {
                    errors: errors,
                    title: title,
                    slug: slug,
                    content: content
                })
            } else {
                var page = new Page({
                    title: title,
                    slug: slug,
                    content: content,
                    sorting: 100,
                });

                page.save((err) => {
                    if (err) return console.log(err);
                    req.flash('success', "Page Added");
                    res.redirect('/admin/pages');
                });
            }
        })
    }
});

router.post('/reorder-pages', (req, res, next) => {
    var ids = req.body['id[]'];

    var count = 0;
    for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        count++;
        (function (count) {
            Page.findById(id, (err, page) => {
                page.sorting = count;
                page.save((err) => {
                    if (err) return console.log(err);
                });
            });
        })(count);
    }
});

module.exports = router;