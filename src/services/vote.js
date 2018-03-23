const request = require('request');
const uuidv4 = require('uuid/v4');
const crypto = require('crypto');
const composerClient = require('../composer-client')

publishTokens = (ballot, tokens) => {
  console.log('PublishTokens');

  let serializer = composerClient.getDefinition().getSerializer();
  
  let hashes = [];
  tokens.forEach(thash => {
    console.log("Hashing");
    let sha = crypto.createHash('sha256');
    hashes.push(sha.update(thash).digest('hex'));
  });
  
  console.log(hashes);
  let resource = serializer.fromJSON({
    '$class': 'org.vote.PublishTokens',
    'ballot': ballot,
    'hashedTokens': hashes
  });
  console.log("resource");
  console.log(resource);
  return new Promise((resolve, reject) => {
    composerClient.getConnection().submitTransaction(resource)
      .then(res => {
        console.log("Transaction submitted")
        console.log(res);
        resolve(res);
      }).catch(err => {
        console.log(err);
        reject(err);
      });
  });
}

publishVote = (ballot, token, option) => {
  console.log('PublishVote');

  let serializer = composerClient.getDefinition().getSerializer();

  let resource = serializer.fromJSON({
    '$class': 'org.vote.PublishVote',
    'token': token,
    'selection': option
  });

  return new Promise((resolve, reject) => {
    composerClient.getConnection().submitTransaction(resource)
      .then(res => {
        console.log("Vote published successfully")
        resolve(res);
      }).catch(err => {
        console.log(err);
        reject(err);
      });
  });
}
  // console.log("createVotes")
  // console.log(this);
  // let bizNetworkConnection = new BusinessNetworkConnection();
  // let cardName = 'BNadmin-org1@voting-network';
  // let businessNetworkIdentifier = 'voting-network';
  // bizNetworkConnection.connect(cardName)
  //   .then((result) => {
  //     console.log("Success!")
  //     console.log(process);
  //     businessNetworkDefinition = result;
  //     let serializer = businessNetworkDefinition.getSerializer();
  //     console.log(serializer);

  //     let resource = serializer.fromJSON({
  //       '$class': 'org.vote.PublishToken',
  //       'title': 'LID:1148'
  //     });
  //     console.log(resource);

  //     bizNetworkConnection.submitTransaction(resource);

  //     // bizNetworkConnection.getAssetRegistry('org.vote.PublishToken')
  //     //   .then((registry) => {
  //     //     return registry.get('LID:1148');
  //     //   })
  //   });


  // return new Promise(function(resolve, reject) {
    
  //   data = {
  //     "$class": "org.vote.Vote",
  //     hashedToken: 
  //     ballot:
  //   };
  //   console.log(data);

  //   request.post({
  //       url: 'http://172.16.67.238:3000/api/org.vote.Vote/',
  //       json: data
  //     },
  //     function (err, response, body) {       
  //       console.log(response);
  //       console.log(response.statusCode);
        
  //       if (!err && response.statusCode == 204) {
  //         console.log("BallotController deleted successufuly");
  //         resolve(response.statusMessage);
  //       } else {
  //         reject(err)
  //       }
  //     }

  //   );
  // });

module.exports = {
  publishTokens: publishTokens,
  publishVote: publishVote
}