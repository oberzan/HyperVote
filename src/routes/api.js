let express = require('express');
let router = express.Router();
let guard = require('express-jwt-permissions')()

let crypto = require('../api/crypto');
let ballot = require('../api/ballot')


router.post('/hash/token', crypto.hashToken);

router.post('/ballot', guard.check('ADMIN'), ballot.createBallot)
router.delete('/ballot/:id', guard.check('ADMIN'), ballot.delete);

router.post('/ballot/:id/tokens', guard.check('ADMIN'), ballot.createTokens);

router.get('/ballot/:id/results', ballot.getResults);


router.post('/vote/:id', ballot.publishVote);

module.exports = router;
