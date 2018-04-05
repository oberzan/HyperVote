const jwt = require('jsonwebtoken');

const ballotService = require('../services/ballot');
const voteService = require('../services/vote');

homepage = (req, res, next) => {
  ballotService.getBallots()
    .then(async ballots => {
      let ballotsOptions = {};
      for(let ballot of ballots) {
        let options = await ballotService.getResults(ballot.title);
        
        let nVotes = 0;
        for(let option of options)
          nVotes += option.n;

        ballotsOptions[ballot.title] = {
          options: options,
          nVotes: nVotes
        }
      };
      res.render('index', {
        title: "HyperVote",
        ballots: ballots,
        ballotsOptions: ballotsOptions,
        i18n: res
      });
    }); 
}

ballot = (req, res, next) => {
  ballotService.getBallot(req.params.id)
    .then(ballot => {
      ballotService.getResults(req.params.id)
        .then(options => {
          let nVotes = 0;
          for(let option of options)
            nVotes += option.n;

          res.render('ballot', {
            title: "HyperVote",
            ballot: ballot,
            options: options,
            nVotes: nVotes,
            i18n: res
          });
        })
    })
}

authenticate = (req, res, next) => {
  
  res.render('authenicate', {
    i18n: res
  });  
}

postSecret = (req, res, next) => {
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