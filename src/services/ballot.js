const composerClient = require('../configs/composer-client')
const logger = require('../../log.js')(module);

getBallot = (id) => {  
  return new Promise(async (resolve, reject) => {
    let registry = await composerClient.getConnection().getAssetRegistry('org.vote.Ballot');
    registry.get(id)
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        logger.error(err);
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
      })
      .catch(err => {
        logger.error(err);
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
    ballot.votes = data.votes;
    //ballot.voters = [];

    registry.add(ballot)
      .then(res => {
        logger.info(res);
        resolve(res);
      }).catch(err => {
        logger.error(err);
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
    logger.info(id + " deleted successufuly");
    resolve();  
  });  
}

getResults = async ballotId => {
  logger.debug('Get votes');

  let connection = composerClient.getConnection();
  let bRegistry = await connection.getAssetRegistry('org.vote.Ballot');
  let vRegistry = await connection.getAssetRegistry('org.vote.Vote');
  
  let ballot = await bRegistry.resolve(ballotId)
    .catch(e => {
      logger.error(e);
      throw e;
    });
  logger.debug(ballot);
  let selections = ballot.votes.map(async v => {
    let vote = await vRegistry.get(v.getIdentifier())
      .catch(e => {
        logger.error(e);
        throw e;
      });
    return vote.selection;
  });
  logger.debug("---- ----");
  logger.debug(ballot);
  logger.debug(await Promise.all(selections));

  return new Promise((resolve, reject) => {
    let query = connection.buildQuery(`
        SELECT org.vote.Vote 
        WHERE (ballot == _$ballot)
    `);
    let bId = encodeURI('resource:org.vote.Ballot#'+ballotId);
    logger.debug(bId);
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
        logger.debug(sorted);
        resolve(sorted);
      })
      .catch(err => {
        logger.error(err);
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