const ballot = require('../services/ballot');
const voteService = require('../services/vote');

function vote(req, res) {
  res.send(voteService.createVotes());

}

function homepage(req, res, next) {
  ballot.getBallots()
    .then(ballots => {
      res.render('index', {
        title: "HyperVote",
        ballots: ballots,
        i18n: res
      });
    })  
}

module.exports = {
  homepage: homepage,
  vote: vote
}