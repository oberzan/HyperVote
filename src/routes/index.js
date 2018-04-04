var express = require('express');
var router = express.Router();

var index = require('../controllers/index');
var admin = require('../controllers/admin');

var ballot = require('../services/ballot');

// router.get('/', function(req, res, next) {
//   res.redirect("/feed");
// });

/* ADMIN */
router.get('/admin', admin.index)
router.post('/admin', ballot.createBallot)

router.get('/authenticate', index.authenticate);
router.post('/authenticate', index.postSecret)

/* GET home page. */
router.get('/', index.homepage);
router.get('/:id', index.ballot);



module.exports = router;
