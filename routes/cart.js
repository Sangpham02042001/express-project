var express = require('express');
var router = express.Router();
var Product = require('../models/product');

router.get('/add/:slug', (req, res, next) => {
    var slug = req.params.slug;

    Product.findOne({ slug: slug }, (err, p) => {
        if (err) {
            console.log(err);
        } else {
            if (req.app.locals.cart == null) {
                req.app.locals.cart = [];
                req.app.locals.cart.push({
                    title: slug,
                    qty: 1,
                    price: parseFloat(p.price).toFixed(2),
                    image: '/product_images/' + p.id + '/' + p.image
                });
            } else {
                var cart = req.app.locals.cart;
                var newItem = true;

                for (var i = 0; i < cart.length; i++) {
                    if (cart[i].title == slug) {
                        cart[i].qty++;
                        newItem = false;
                        break;
                    }
                }

                if (newItem) {
                    cart.push({
                        title: slug,
                        qty: 1,
                        price: parseFloat(p.price).toFixed(2),
                        image: '/product_images/' + p.id + '/' + p.image
                    });
                }
            }
        }
        // console.log(req.app.locals.cart);
        req.flash('success', "Product added");
        res.redirect('back');
    });
});


router.get('/checkout', (req, res, next) => {
    res.render('checkout', {
        title: 'Checkout',
        cart: req.app.locals.cart
    })
});

router.get('/clear', (req, res, next) => {
    req.app.locals.cart = null;

    res.redirect('/cart/checkout');
});

module.exports = router;