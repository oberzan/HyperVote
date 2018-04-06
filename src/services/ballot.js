const request = require('request');

const composerClient = require('../composer-client')

returnJsonResponse = (response, status, content) => {
  response.status(status);
  response.json(content);
};

getBallot = (id) => {  
  return new Promise(async (resolve, reject) => {
    let registry = await composerClient.getConnection().getAssetRegistry('org.vote.Ballot');
    registry.get(id)
      .then(data => {
        resolve(data);
      }).catch(err => {
        console.log("ERROR: ");
        console.error(err);
        reject(err);
      });
  });  
}

getBallots = () => {
  return new Promise(async (resolve, reject) => {
    let registry = await composerClient.getConnection().getAssetRegistry('org.vote.Ballot');
    registry.getAll()
      .then(data => {
        resolve(data);
      }).catch(err => {
        console.log("ERROR: ");
        console.error(err);
        reject(err);
      });
  });
}

createBallot = (data) => {
  return new Promise(async (resolve, reject) => {
    //let connection = 
    let registry = await composerClient.getConnection().getAssetRegistry('org.vote.Ballot');
    let factory = await composerClient.getDefinition().getFactory();
    
    let ballot = factory.newResource("org.vote", "Ballot", data.title);
    ballot.description = data.description;
    ballot.options = [];
    data.options.forEach(opt => {
      let option = factory.newConcept("org.vote", "Option");
      option.Name = opt;
      option.description = "TODO"
      ballot.options.push(option);
    });
    // ballot.options = data.options;
    //"start": new Date().toISOString(),
    ballot.end = data.end;
    ballot.votes = data.end;
    ballot.voters = [];

    registry.add(ballot)
      .then(res => {
        resolve(res);
      }).catch(err => {
        console.log("ERROR: ");
        console.error(err);
        reject(err);
      });
  });  
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

        var sorted = [];
        for (let option in selCounts) sorted.push({name: option, n: selCounts[option]});
        sorted.sort((a, b) => {
          return b.n - a.n;
        });
        console.log(sorted);
        resolve(sorted);
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