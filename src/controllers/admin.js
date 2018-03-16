const ballot = require('../api/ballot');

function index(req, res, next) {
  ballot.getBallots()
    .then( ballots => {
      console.log("Admin.index: got response");
      console.log(ballots);
      ballots.forEach(ballot => {
        console.log(ballot);      
      });
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