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

module.exports = {
  publishTokens: publishTokens,
  publishVote: publishVote
}