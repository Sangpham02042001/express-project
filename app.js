var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var config = require('./config/database');
var bodyParser = require('body-parser');
var session = require('express-session');
var expressValidator = require('express-validator');
var flash = require('req-flash');
var fileUpload = require('express-fileupload');
var passport = require('passport');

//Connect db
mongoose.connect(config.database, { useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to Mongoose'))

var pages = require('./routes/pages');
var products = require('./routes/products');
var cart = require('./routes/cart');
var users = require('./routes/users');
var admin = require('./routes/admin');
var adminPages = require('./routes/admin_pages');
var adminCategories = require('./routes/admin_categories');
var adminProducts = require('./routes/admin_products');
var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.locals.errors = null;

var Page = require('./models/page');
var Category = require('./models/category');

Page.find({}).sort({ sorting: 1 }).exec((err, pages) => {
    if (err) {
        console.log(err);
    } else {
        app.locals.pages = pages;
    }
});

Category.find({}, (err, categories) => {
    if (err) {
        console.log(err);
    } else {
        app.locals.categories = categories;
    }
});

app.use(fileUpload());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}));
app.use(flash());

app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.'),
            root = namespace.shift(),
            formParam = root;
        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        }
    },
    customValidators: {
        isImage: (value, filename) => {
            var extension = (path.extname(filename)).toLowerCase();
            switch (extension) {
                case '.jpg':
                    return '.jpg'
                case '.jpeg':
                    return '.jpeg'
                case '.png':
                    return '.png'
                case '':
                    return '.jpg'
                default:
                    return false;
            }
        }
    }
}));

app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

app.locals.cart = null;

app.get('*', (req, res, next) => {
    app.locals.users = req.user || null;
    next();
})

//Set route 
app.use('/products', products);
app.use('/', pages);
app.use('/cart', cart);
app.use('/users', users);
app.use('/admin', admin);
app.use('/admin/pages', adminPages);
app.use('/admin/categories', adminCategories);
app.use('/admin/products', adminProducts);

var port = 3000;
app.listen(port, () => {
    console.log("server started on port, ", port);
})