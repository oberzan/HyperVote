const ballotService = require('../services/ballot');
const voteService = require('../services/vote');

function homepage(req, res, next) {
  ballotService.getBallots()
    .then(ballots => {
      res.render('index', {
        title: "HyperVote",
        ballots: ballots,
        i18n: res
      });
    })  
}

function ballot(req, res, next) {
  ballotService.getBallot(req.params.id)
    .then(ballot => {
      console.log(ballot);
      res.render('ballot', {
        title: "HyperVote",
        ballot: ballot,
        i18n: res
      });
    })  
}

module.exports = {
  homepage: homepage,
  ballot: ballot
}