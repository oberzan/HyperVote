const request = require('request');
const ballotController = require('../controllers/ballot')

var returnJsonResponse = function(response, status, content) {
  response.status(status);
  response.json(content);
};

function getBallots() {  
  return new Promise(function(resolve, reject) {
    request.get({
      headers: {'Accept': 'application/json'},
      url: 'http://172.16.67.238:3000/api/org.vote.Ballot'      
    }).on('error', (err) =>{
      console.log("ERROR: ");
      console.error(err);
      if (err.errno == 'ECONNREFUSED') {
        console.log("Connection with rest-server refused.");
      }
      reject(err);
    }).on('data', (data) => {
      //console.log("DATA: ")
      //console.log(JSON.parse(data.toString()))
      console.log(1111111111111111111111111111111);
      console.log(data.toString());
      resolve(JSON.parse(data.toString()));
    });
  });  
}

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
  getBallots: getBallots
}