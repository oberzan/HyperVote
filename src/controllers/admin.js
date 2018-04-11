const ballot = require('../services/ballot');
const logger = require('../../log.js')(module);

index = (req, res, next) => {
  ballot.getBallots()
    .then( ballots => {
      logger.info("Admin.index: got response");
      res.render('admin', {
        ballots: ballots,
        i18n: res
      });
    }).catch( err => {
      logger.error(err);
    });  
}

module.exports = {
  index: index
}