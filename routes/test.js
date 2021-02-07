var express = require('express');
var router = express.Router();

router.get('/', (req, res, next) => {
    res.render('test');
});

router.post('/', (req, res, next) => {
    if (req.files == null) {
        res.end("fadfas");
    } else {
        res.end("fadfasfdsafasd");
    }
})

module.exports = router;