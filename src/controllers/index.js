const ballot = require('../services/ballot');
const voteService = require('../services/vote');

function vote(req, res) {
  console.log(req);
  res.send(voteService.createVotes(req.body.ballot));

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