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
    //"start": new Date().toISOString(),
    ballot.end = data.end;
    ballot.votes = [];
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
  return new Promise(async (resolve, reject) => {
    
    let registry = await composerClient.getConnection().getAssetRegistry('org.vote.Ballot');
    await registry.remove(id)
      .catch(err =>
        reject(err)
      );
    console.log(id + " deleted successufuly");
    resolve();  
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
        let selCounts = {};
        selections.forEach(x => {
          if(selCounts[x])
            selCounts[x] += 1
          else
            selCounts[x] = 1
        });

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