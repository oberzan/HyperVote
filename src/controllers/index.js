const jwt = require('jsonwebtoken');

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

function authenticate(req, res, next) {
  
  res.render('authenicate', {
    i18n: res
  });  
}

function postSecret(req, res, next) {
  console.log("postSecret");

  let secret = process.env.HYPERVOTE_SECRET;
  if(req.body.secret === secret) {

    console.log("Setting a cookie");
    console.log(req.body.secret);
    res.status(200)
       .cookie("token",
               jwt.sign({
                  user: "admin" },
                  process.env.JWT_SECRET,
                  { expiresIn: 10 * 60 }))
       .json({ user:"admin" });
  } else {
    res.status(400)
       .clearCookie("token")
       .send();
  }
}

module.exports = {
  authenticate: authenticate,
  postSecret: postSecret,
  homepage: homepage,
  ballot: ballot
}