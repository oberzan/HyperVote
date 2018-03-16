var express = require('express');
var router = express.Router();

var index = require('../controllers/index');
var admin = require('../controllers/admin');
var ballot = require('../controllers/ballot');

// router.get('/', function(req, res, next) {
//   res.redirect("/feed");
// });

/* GET home page. */
router.get('/', index.homepage);

/* ADMIN */
router.get('/admin/ballots', admin.index)
router.post('/admin/ballots', ballot.createBallot)

module.exports = router;
