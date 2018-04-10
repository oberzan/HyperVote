const ballot = require('../services/ballot');

function index(req, res, next) {
  ballot.getBallots()
    .then( ballots => {
      console.log("Admin.index: got response");
      res.render('admin', {
        ballots: ballots,
        i18n: res
      });
    }).catch( err => {
      console.log(err);
    });  
}

module.exports = {
  index: index
}