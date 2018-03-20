const request = require('request');
const uuidv4 = require('uuid/v4');
const crypto = require('crypto');
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;

function createVotes() {
  console.log("createVotes")
  console.log(this);
  let bizNetworkConnection = new BusinessNetworkConnection();
  let cardName = 'BNadmin-org1@voting-network';
  let businessNetworkIdentifier = 'voting-network';
  bizNetworkConnection.connect(cardName)
    .then((result) => {
      console.log("Success!")
      businessNetworkDefinition = result;
      let serializer = this.businessNetworkDefinition.getSerializer();
      console.log(serializer);

      let resource = serializer.fromJSON({
        '$class': 'org.vote.PublishToken',
        'title': 'LID:1148'
      });
      console.log(resource);

      bizNetworkConnection.submitTransaction(resource);

      // bizNetworkConnection.getAssetRegistry('org.vote.PublishToken')
      //   .then((registry) => {
      //     return registry.get('LID:1148');
      //   })
    });


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
}

module.exports = {
  createVotes: createVotes
}