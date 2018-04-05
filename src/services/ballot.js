const request = require('request');
const moment = require('moment');

const composerClient = require('../composer-client')

returnJsonResponse = (response, status, content) => {
  response.status(status);
  response.json(content);
};

getBallot = (id) => {  
  return new Promise(function(resolve, reject) {
    let registry = composerClient.getConnection().getAssetRegistry('org.vote.Ballot');
    registry.getAll()
      .then(data => {
        console.log(data.toString());
        resolve(JSON.parse(data.toString()));
      }).catch(err => {
        console.log("ERROR: ");
        console.error(err);
        if (err.errno == 'ECONNREFUSED') {
          console.log("Connection with rest-server refused.");
        }
        reject(err);
      });

    // request.get({
    //   headers: {'Accept': 'application/json'},
    //   url: encodeURI('http://172.16.67.238:3000/api/org.vote.Ballot' + '/' + id)
    // }).on('error', (err) =>{
    //   console.log("ERROR: ");
    //   console.error(err);
    //   if (err.errno == 'ECONNREFUSED') {
    //     console.log("Connection with rest-server refused.");
    //   }
    //   reject(err);
    // }).on('data', (data) => {
    //   //console.log("DATA: ")
    //   //console.log(JSON.parse(data.toString()))
    //   console.log(data.toString());
    //   resolve(JSON.parse(data.toString()));
    // });
  });  
}

getBallots = () => {  
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
      console.log(data.toString());
      resolve(JSON.parse(data.toString()));
    });
  });  
}

createBallot = (req, res, next) => {
  console.log(req.body);
  console.log(req.body.endTime);
  var options = [];
  req.body.option.forEach(opt => {
    options.push({
      "$class": "org.vote.Option",
      "Name": opt,
      "description": "opt.description" //TODO
    });
  });

  data = {
    "$class": "org.vote.Ballot",
    "title": req.body.title,
    "description": req.body.description,
    "options": options,
    "start": new Date().toISOString(),
    "end": moment(req.body.endTime, 'DD.MM.YYYY HH:mm').toISOString(), //TODO: Fix for timezones. Cnvert on the client side
    "votes": [],
    "voters": []
  };
  console.log(data);

  request.post({
      //headers: {'content-type':'application/json'},
      url: 'http://172.16.67.238:3000/api/org.vote.Ballot',
      json: data
    },
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log("RESPONSE: ")
        console.log(body);
        //returnJsonResponse(res, 200, body);
        res.redirect('back');
        //returnJsonResponse(res, 200, body);
      } else {
        console.log("ERROR: ");
        console.error(error)
      }
    }
  );  
}

deleteBallot = (id) => {  
  return new Promise(function(resolve, reject) {
    
    request.del(
      encodeURI('http://172.16.67.238:3000/api/org.vote.Ballot/' + id),
      function (err, response, body) {
        console.log(response.statusCode);
        
        if (!err && response.statusCode == 204) {
          console.log("BallotController deleted successufuly");
          resolve(response.statusMessage);
        } else {
          reject(err)
        }
      }

    );
  });  
}

getResults = (ballot) => {
  console.log('Get votes');

  let connection = composerClient.getConnection();

  return new Promise((resolve, reject) => {
    let query = connection.buildQuery(`
        SELECT org.vote.Vote 
        WHERE (ballot == _$ballot)
    `);
    let bId = encodeURI('resource:org.vote.Ballot#'+ballot);
    console.log(bId);
    connection.query(query, { ballot: bId })
      .then(response => {
        let selections = response.map(x => x.selection);
        console.log(selections);
        let selCounts = {};
        selections.forEach(x => {
          if(selCounts[x])
            selCounts[x] += 1
          else
            selCounts[x] = 1
        });
        console.log(selCounts);
        // let serializer = composerClient.getDefinition().getSerializer();      
        resolve(selCounts);
      })
      .catch(err => {
        console.log(err);
        reject(err);
      });
  });
}

module.exports = {
  getBallot: getBallot,
  getBallots: getBallots,
  createBallot: createBallot,
  delete: deleteBallot,
  getResults: getResults
}