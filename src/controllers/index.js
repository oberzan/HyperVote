const ballot = require('../services/ballot');
const voteService = require('../services/vote');

function vote(req, res, next) {
  let ballot = req.params.id;
  let option = req.body.option;
  voteService.publishVote(ballot, req.body.token, option)
    .then(() => {
      res.status(200).send({
        message: `${res.__("You successfully voted")} ${ballot}. ${res.__("Your vote was")} ${option}.`
      });
      // res.render('voted', {
      //   ballot: ballot,
      //   option: option,
      //   i18n: res
      // });
    })
    .catch((err) => {
      res.status(400).send({
        message: `${i18.__("Invalid token")}`
      });

      // if(err.toString().indexOf("does not exist") > -1){
      //   console.log("Does not exist");
      // }
      // res.render('error', {
      //   error: {
      //     stack: err.stack
      //   }
      // });
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