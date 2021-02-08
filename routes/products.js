var express = require('express');
var router = express.Router();
var Product = require('../models/product');
var Category = require('../models/category');
var fs = require('fs-extra');

router.get('/', (req, res, next) => {
    Product.find({}, (err, products) => {
        if (err) {
            console.log(err);
        } else {
            res.render('all_products', {
                products: products,
                title: 'All Products'
            })
        }
    })
});

router.get('/:category', (req, res, next) => {

    var categorySlug = req.params.category;

    Category.findOne({ slug: categorySlug }, (err, category) => {
        Product.find({ category: categorySlug }, (err, products) => {
            if (err) {
                console.log(err);
            } else {
                res.render('cat_products', {
                    products: products,
                    title: category.title
                })
            }
        })
    })
});

router.get('/:category/:product', (req, res, next) => {
    var galleryImages = null;
    Product.findOne({ slug: req.params.product }, (err, product) => {
        if (err) {
            console.log(err);
        } else {
            var galleryDir = 'public/product_images/' + product.id + '/gallery';

            fs.readdir(galleryDir, (err, files) => {
                if (err) {
                    console.log(err);
                } else {
                    galleryImages = files;

                    res.render('product', {
                        title: product.title,
                        p: product,
                        galleryImages: galleryImages
                    })
                }
            })
        }
    })
});

module.exports = router;