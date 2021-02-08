var express = require('express');
var mongoose = require('mongoose');
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

router.get('/edit-page/:pageId', (req, res) => {

    Page.findById(req.params.pageId, (err, page) => {
        if (err) return console.log(err);

        // console.log(typeof page._id);
        // console.log(page._id);
        // console.log(typeof page.id);
        // console.log(page.id);
        res.render('admin/edit_page', {
            title: page.title,
            slug: page.slug,
            content: page.content,
            id: page.id
        })
    });
});


router.post('/edit-page/:pageId', (req, res) => {
    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('content', 'Content must have a value.').notEmpty();

    var title = req.body.title,
        slug = req.body.slug.replace(/\s+/g, '-').toLowerCase(),
        content = req.body.content;

    if (slug == '') slug = title.replace(/\s+/g, '-').toLowerCase();

    var errors = req.validationErrors();

    if (errors) {
        res.render('admin/edit_page', {
            errors: errors,
            title: title,
            slug: slug,
            content: content,
            id: req.params.pageId
        });
    } else {
        Page.findOne({ title: title, _id: req.params.pageId } || { slug: slug, _id: req.params.pageId }, (err, page) => {
            if (page) {
                req.flash('danger', "Page existed, choose another");
                res.render('admin/edit_page', {
                    title: title,
                    slug: slug,
                    content: content,
                    id: req.params.pageId
                })
            } else {
                Page.findById(req.params.pageId, (err, page) => {
                    if (err) return console.log(err);
                    page.title = title;
                    page.slug = slug;
                    page.content = content;

                    page.save((err) => {
                        if (err) return console.log(err);

                        req.flash('success', "Page Edited");
                        res.redirect('/admin/pages');
                    })
                })
            }
        });
    }
});

router.get('/delete-page/:pageId', (req, res, next) => {
    Page.findByIdAndRemove(req.params.pageId, (err) => {
        if (err)
            return console.log(err);
        req.flash('success', "Page Deleted");
        res.redirect('/admin/pages');
    })

});


module.exports = router;