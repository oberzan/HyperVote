const crypto = require('crypto');
const logger = require('../../log.js')

module.exports.hashToken = function(req, res) {
  logger.debug(req.body)
  if(req.body.token) {
    var obj = req.body.token;
    var hash = crypto.createHash('sha256').update(obj, 'utf8').digest().toString('hex');
    logger.debug(hash);
    res.status(200).json(hash);
  } else {
    res.status(400).json("Nothing to hash");
  }
}
    