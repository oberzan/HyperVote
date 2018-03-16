var express = require('express');
var router = express.Router();

var crypto = require('../api/crypto');
var ballot = require('../api/ballot')


router.post('/hash/token', crypto.hashToken);

router.delete('/ballot/:id', ballot.delete);

module.exports = router;
