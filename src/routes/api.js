var express = require('express');
var router = express.Router();

var crypto = require('../api/crypto');
var ballot = require('../api/ballot')


router.post('/hash/token', crypto.hashToken);

router.delete('/ballot/:id', ballot.delete);

router.post('/ballot/:id/tokens', ballot.createTokens);

module.exports = router;
