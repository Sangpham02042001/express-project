var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var Category = require('../models/category');

router.get('/', (req, res, next) => {
    Category.find({}, (err, categories) => {
        if (err) return;
        res.render('admin/categories', {
            categories: categories
        });
    });
});

router.get('/add-category', (req, res) => {
    var title = "";

    res.render('admin/add_category', {
        title: title
    })
});

router.post('/add-category', (req, res) => {
    req.checkBody('title', 'Category must have a value.').notEmpty();

    var title = req.body.title.toLowerCase(),
        slug = req.body.title.replace(/\s+/g, '-').toLowerCase();

    var errors = req.validationErrors();

    if (errors) {
        res.render('admin/add_category', {
            errors: errors,
            title: title,
        })
    } else {
        console.log('Success');
        Category.findOne({ slug: slug }, (err, page) => {
            if (page) {
                req.flash('danger', "Category existed, choose another");
                res.render('admin/add_category', {
                    errors: errors,
                    title: title,
                })
            } else {
                var category = new Category({
                    title: title,
                    slug: slug,
                });

                category.save((err) => {
                    if (err) return console.log(err);
                    Category.find({}, (err, categories) => {
                        if (err) {
                            console.log(err);
                        } else {
                            req.app.locals.categories = categories;
                        }
                    });
                    req.flash('success', "Category Added");
                    res.redirect('/admin/categories');
                });
            }
        })
    }
});

router.get('/edit-category/:id', (req, res) => {

    Category.findById(req.params.id, (err, category) => {
        if (err) return console.log(err);

        // console.log(typeof page._id);
        // console.log(page._id);
        // console.log(typeof page.id);
        // console.log(page.id);
        res.render('admin/edit_category', {
            title: category.title,
            id: category.id
        })
    });
});


router.post('/edit-category/:id', (req, res) => {
    req.checkBody('title', 'Title must have a value.').notEmpty();

    var title = req.body.title,
        slug = req.body.title.replace(/\s+/g, '-').toLowerCase(),
        id = req.params.id;

    if (slug == '') slug = title.replace(/\s+/g, '-').toLowerCase();

    var errors = req.validationErrors();

    if (errors) {
        res.render('admin/edit_category', {
            errors: errors,
            title: title,
            id: id
        });
    } else {
        Category.findOne({ title: req.body.title }, (err, category) => {
            if (category) {
                req.flash('danger', "Category existed, choose another");
                res.render('admin/edit_category', {
                    title: title,
                    id: id
                })
            } else {
                Category.findById(id, (err, category) => {
                    if (err) return console.log(err);
                    category.title = title;
                    category.slug = slug;

                    category.save((err) => {
                        if (err) return console.log(err);

                        Category.find({}, (err, categories) => {
                            if (err) {
                                console.log(err);
                            } else {
                                req.app.locals.categories = categories;
                            }
                        });
                        req.flash('successMessage', "Change successfully");
                        res.redirect('/admin/categories/');
                    })
                })
            }
        });
    }
});

router.get('/delete-category/:id', (req, res, next) => {
    Category.findByIdAndRemove(req.params.id, (err) => {
        if (err)
            return console.log(err);
        Category.find({}, (err, categories) => {
            if (err) {
                console.log(err);
            } else {
                app.locals.categories = categories;
            }
        });
        req.flash('success', "Category Deleted");
        res.redirect('/admin/categories');
    })

});


module.exports = router;