let express = require('express');
let router = express.Router();
let guard = require('express-jwt-permissions')()

let index = require('../controllers/index');
let admin = require('../controllers/admin');

let ballot = require('../services/ballot');

// router.get('/', function(req, res, next) {
//   res.redirect("/feed");
// });

/* ADMIN */
router.get('/admin', guard.check('ADMIN'), admin.index)
// router.post('/admin', ballot.createBallot)

router.get('/authenticate', index.authenticate);
router.post('/authenticate', index.postSecret)

/* GET home page. */
router.get('/', index.homepage);
router.get('/:id', index.ballot);
router.get('/:id/:token', index.ballot);



module.exports = router;
