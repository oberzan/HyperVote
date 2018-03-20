const request = require('request');
const ballotController = require('../services/ballot')

var returnJsonResponse = function(response, status, content) {
  response.status(status);
  response.json(content);
};



function deleteBallot(request, response) {
  console.log("DELETE ballot: " + request.params.id);
  ballotController.delete(request.params.id)
    .then( data => {
      returnJsonResponse(response, 204, data);
    })
    .catch( err => {
      returnJsonResponse(response, 1, err)
    });  
}
module.exports = {
  delete: deleteBallot,
  //getBallots: getBallots
}