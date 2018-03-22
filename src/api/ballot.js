const request = require('request');
const ballot = require('../services/ballot')
const vote = require('../services/vote')

var returnJsonResponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

function createTokens(req, res) {
  console.log("createTokens for " + req.params.id);
  vote.createVotes(req.params.id)
    .then(() => {

      returnJsonResponse(res, 200, "Success");
    })
    .catch(() => {
      returnJsonResponse(res, 1, err);
    });
  
}

function deleteBallot(req, res) {
  console.log("DELETE ballot: " + req.params.id);
  ballot.delete(req.params.id)
    .then( data => {
      returnJsonResponse(res, 204, data);
    })
    .catch( err => {
      returnJsonResponse(res, 1, err)
    });  
}

module.exports = {
  delete: deleteBallot,
  createTokens: createTokens
}