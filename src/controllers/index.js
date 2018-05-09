const jwt = require('jsonwebtoken');
const moment = require('moment');
const crypto = require('crypto');

const config = require('../../config.json');
const logger = require('../../log.js')(module);

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
        if(ballot.end > Date.now())          
          continue;

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
        .then(async options => {
          let nVotes = 0;
          let token = req.query.token;
          token = token && token.length == 36 ? token : "";
          if(token) {
            let hash = crypto.createHash('sha256').update(token, 'utf8').digest().toString('hex');
            let selected = await voteService.getVote(hash);
            logger.info(selected.selection);
          }
          for(let option of options)
            nVotes += option.n;

          res.render('ballot', {
            title: "HyperVote",
            token: token,
            ballot: ballot,
            options: options,
            selected: selected,
            nVotes: nVotes,
            googleColors,
            i18n: res
          });
        })
    })
    .catch(err => {
      logger.error(err.details);
      
      if(err.details.includes('does not exist'))
        return res.status(404).send("Requested ballot does not exist.");
      res.sendStatus(400);
    });
}

authenticate = (req, res, next) => {
  
  res.render('authenticate', {
    i18n: res
  });  
}

postSecret = (req, res, next) => {
  logger.info("postSecret");

  let secret = config.secret.admin;
  if(!secret) {
    logger.error("Admin secret not set")
    res.sendStatus(500);
  }
  if(req.body.secret === secret) {

    logger.info("Setting a cookie");
    logger.info(req.body.secret);
    let payload = {
      user: "admin",
      permissions: ['ADMIN']
    }

    let cookieLife = 10 * 60;
    res.status(200)
       .cookie("token",
               jwt.sign(payload,
                 config.secret.jwt,
                 { expiresIn: cookieLife }))
       .json({ cookieExpTime: moment().add(cookieLife, 's').toDate(),
               user:"admin" });
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