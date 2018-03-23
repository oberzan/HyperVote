const ballot = require('../services/ballot');
const voteService = require('../services/vote');

function vote(req, res) {
  let ballot = req.params.id;
  let option = req.body.option;
  voteService.publishVote(ballot, req.body.token, option)
    .then(() => {
      res.render('voted', {
        ballot: ballot,
        option: option,
        i18n: res
      });
    });
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