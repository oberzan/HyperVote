const jwt = require('jsonwebtoken');

const config = require('../../config.json');

const ballotService = require('../services/ballot');
const voteService = require('../services/vote');
const googleColors = [
  '#3366CC',
  '#DC3912',
  '#FF9900',
  '#109618',
  '#990099',
  '#3B3EAC',
  '#0099C6',
  '#DD4477',
  '#66AA00',
  '#B82E2E',
  '#316395',
  '#994499',
  '#22AA99',
  '#AAAA11',
  '#6633CC',
  '#E67300',
  '#8B0707',
  '#329262',
  '#5574A6',
  '#3B3EAC'
];

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
        googleColors,
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
            googleColors,
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

  let secret = config.secret.admin;
  if(!secret) {
    console.error("Admin secret not set")
    res.status(500).end();
  }
  if(req.body.secret === secret) {

    console.log("Setting a cookie");
    console.log(req.body.secret);
    let payload = {
      user: "admin",
      permissions: ['ADMIN']
    }

    res.status(200)
       .cookie("token",
               jwt.sign(payload),
               config.secret.jwt,
               { expiresIn: 10 * 60 })
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