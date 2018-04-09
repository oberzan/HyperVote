const crypto = require('crypto');

module.exports.hashToken = function(req, res) {
  console.log(req.body)
  if(req.body.token) {
    var obj = req.body.token;
    var hash = crypto.createHash('sha256').update(obj, 'utf8').digest().toString('hex');
    console.log(hash);
    res.status(200).json(hash);
  } else {
    res.status(400).json("Nothing to hash");
  }
}
    