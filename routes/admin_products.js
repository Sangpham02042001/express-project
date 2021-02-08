var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var mkdirp = require('mkdirp');
var fs = require('fs-extra');
var resizeImg = require('resize-img');

var Product = require('../models/product');
var Category = require('../models/category');

router.get('/', (req, res, next) => {
    var count;

    Product.count((err, c) => {
        count = c;
    });

    Product.find((err, products) => {
        res.render('admin/products', {
            products: products,
            count: count
        })
    })
});

router.get('/add-product', (req, res) => {
    var title = "",
        desc = "",
        price = "";
    Category.find((err, categories) => {
        res.render('admin/add_product', {
            title: title,
            desc: desc,
            categories: categories,
            price: price
        });
    })
});

router.post('/add-product', (req, res) => {

    if (req.files == null) {
        Category.find((err, categories) => {
            res.render('admin/add_product', {
                errors: '',
                title: '',
                desc: '',
                categories: categories,
                price: ''
            });
        });
        return;
    }
    var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : '';

    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('desc', 'Description must have a value.').notEmpty();
    req.checkBody('price', 'Price must have a value.').isDecimal();
    req.checkBody('image', 'You must upload an image').isImage(imageFile);

    var title = req.body.title,
        slug = title.replace(/\s+/g, '-').toLowerCase(),
        desc = req.body.desc,
        price = req.body.price,
        category = req.body.category;

    var errors = req.validationErrors();

    if (errors) {
        // console.log(errors);
        Category.find((err, categories) => {
            res.render('admin/add_product', {
                errors: errors,
                title: title,
                desc: desc,
                categories: categories,
                price: price
            });
        })
    } else {
        console.log('Success');
        Product.findOne({ slug: slug }, (err, product) => {
            if (product) {
                req.flash('danger', "Product title existed, choose another");
                Category.find((err, categories) => {
                    res.render('admin/add_product', {
                        errors: err,
                        title: title,
                        desc: desc,
                        categories: categories,
                        price: price
                    });
                });
            } else {

                var price2 = parseFloat(price).toFixed(2);
                var product = new Product({
                    title: title,
                    slug: slug,
                    desc: desc,
                    price: price2,
                    category: category,
                    image: imageFile
                });

                product.save((err) => {
                    if (err) return console.log(err);

                    if (!fs.existsSync('/public/product_images/' + product.id)) {

                        fs.mkdirSync('public/product_images/' + product.id, function (err) {
                            return console.log(err);
                        });

                        fs.mkdirSync('public/product_images/' + product.id + '/gallery', function (err) {
                            return console.log(err);
                        });

                        fs.mkdirSync('public/product_images/' + product.id + '/gallery/thumbs', function (err) {
                            return console.log(err);
                        });
                    }

                    if (imageFile !== '') {
                        var productImage = req.files.image;
                        var path = 'public/product_images/' + product.id + '/' + imageFile;

                        productImage.mv(path, function (err) {
                            console.log(err);
                        })
                    }

                    req.flash('success', "Product Added");
                    res.redirect('/admin/products');
                });
            }
        })
    }
});

router.get('/edit-product/:id', (req, res) => {

    var errors;

    if (req.session.errors) errors = req.session.errors;
    req.session.errors = null;

    Category.find((err, categories) => {

        Product.findById(req.params.id, (err, pro) => {
            if (err) {
                console.log(err);
                res.redirect('/admin/products');
            } else {
                var galleryDir = 'public/product_images/' + pro.id + '/gallery';
                var galleryImages = null;

                fs.readdir(galleryDir, (err, files) => {
                    if (err) {
                        console.log(err);
                    } else {
                        galleryImages = files;

                        res.render('admin/edit_product', {
                            errors: errors,
                            id: pro.id,
                            title: pro.title,
                            desc: pro.desc,
                            categories: categories,
                            category: pro.category.replace(/\s+/g, '-').toLowerCase(),
                            price: parseFloat(pro.price).toFixed(2),
                            image: pro.image,
                            galleryImages: galleryImages
                        });
                    }
                });
            }
        });
    });
});


router.post('/edit-product/:id', (req, res) => {

    var title = req.body.title,
        slug = title.replace(/\s+/g, '-').toLowerCase(),
        desc = req.body.desc,
        category = req.body.category,
        price = req.body.price,
        image = null,
        id = req.params.id,
        galleryDir = 'public/product_images/' + id + '/gallery',
        galleryImages = null;

    fs.readdir(galleryDir, (err, files) => {
        if (err) {
            console.log(err);
        } else {
            galleryImages = files;
        }
    });

    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('desc', 'Description must have a value.').notEmpty();
    req.checkBody('price', "Price must have a value");

    var errors;

    if (req.files == null) {
        errors = req.validationErrors();
        Product.findById(id, (err, product) => {
            if (err) {
                console.log(err);
            } else {
                product.title = title;
                product.slug = slug;
                product.desc = desc;
                product.price = price;
                product.category = category;

                product.save((err) => {
                    if (err) {
                        console.log(err);
                    }
                });

                res.redirect('/admin/products');
            }
        });
        return;
    }

    var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : '';
    req.checkBody('image', 'You must upload an image').isImage(imageFile);
    image = imageFile;
    errors = req.validationErrors();

    if (errors) {
        Category.find({}, (err, categories) => {
            res.render('admin/edit_product', {
                errors: errors,
                title: title,
                desc: desc,
                category: category,
                price: price,
                image: image,
                categories: categories,
                id: id,
                galleryImages: galleryImages
            });
        });
    } else {
        Category.find({}, (err, categories) => {
            Product.findOne({ title: title }, (err, product) => {
                if (product) {
                    req.flash('danger', "Product existed, choose another");
                    res.render('admin/edit_product', {
                        errors: errors,
                        title: title,
                        desc: desc,
                        category: category,
                        price: price,
                        image: image,
                        categories: categories,
                        id: id,
                        galleryImages: galleryImages
                    })
                }
                else {
                    Product.findById(req.params.id, (err, product) => {
                        if (err) return console.log(err);
                        console.log(image);
                        product.title = title;
                        product.slug = slug;
                        product.desc = desc;
                        product.price = price;
                        product.category = category;
                        product.image = image;

                        product.save((err) => {
                            if (err) return console.log(err);

                            if (imageFile !== '') {
                                var productImage = req.files.image;
                                var path = 'public/product_images/' + product.id + '/' + image;

                                productImage.mv(path, function (err) {
                                    console.log(err);
                                })
                            }

                            req.flash('success', "Product Edited");
                            res.redirect('/admin/products');
                        })
                    })
                }
            })
        });
    }
});

router.post('/product-gallery/:id', (req, res, next) => {
    var productImage = req.files.file;
    var id = req.params.id;
    var path = 'public/product_images/' + id + '/gallery/' + req.files.file.name;
    var thumbsPath = 'public/product_images/' + id + '/gallery/thumbs/' + req.files.file.name;

    productImage.mv(path, (err) => {
        if (err) console.log(err);

        resizeImg(fs.readFileSync(path), { width: 100, height: 100 })
            .then((buf) => {
                fs.writeFileSync(thumbsPath, buf);
            });
    });

    res.sendStatus(200);
});

router.get('/delete-product/:id', (req, res, next) => {
    var id = req.params.id;
    var path = 'public/product_images/' + id;

    fs.remove(path, (err) => {
        if (err) {
            console.log(err);
        } else {
            Product.findByIdAndRemove(id, (err) => {
                if (err) {
                    return console.log(err);
                } else {
                    req.flash('success', "Product Deleted");
                    res.redirect('/admin/products');
                }
            });
        }
    })
});

router.get('/delete-image/:image', (req, res, next) => {
    var originalImage = 'public/product_images/' + req.query.id + '/gallery/' + req.params.image;
    var thumbImage = 'public/product_images/' + req.query.id + '/gallery/thumbs/' + req.params.image;

    fs.remove(originalImage, (err) => {
        if (err) {
            console.log(err);
        } else {
            fs.remove(thumbImage, (err) => {
                if (err) {
                    console.log(err);
                } else {
                    req.flash('success', "Image Deleted");
                    res.redirect('/admin/products/edit-product/' + req.query.id);
                }
            });
        }
    })
});


module.exports = router;