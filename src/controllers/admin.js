const ballot = require('../services/ballot');

function index(req, res, next) {
  ballot.getBallots()
    .then( ballots => {
      console.log("Admin.index: got response");
      console.log(ballots);
      res.render('admin', {
        ballots: ballots
      });
    }).catch( err => {
      console.log(err);
    });  
}

module.exports = {
  index: index
}