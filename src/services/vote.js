const uuidv4 = require('uuid/v4');
const crypto = require('crypto');

const composerClient = require('../configs/composer-client');
const logger = require('../../log.js')(module);

getVote = async hash => {
  // return new Promise(async (resolve, reject) => {
    let registry = await composerClient.getConnection().getAssetRegistry('org.vote.Vote');
    return registry.get(hash)
      .catch(err => {
        logger.error(err);
        return false;
      });
      // .then(data => {
      //   resolve(data);
      // })
      // .catch(err => {
      //   logger.error(err);
      //   reject(err);
      // });
  // });
}

publishTokens = (ballot, tokens) => {
  logger.info('PublishTokens');

  let serializer = composerClient.getDefinition().getSerializer();
  
  let hashes = [];
  tokens.forEach(thash => {
    let sha = crypto.createHash('sha256');
    hashes.push(sha.update(thash).digest('hex'));
  });
  
  logger.debug(hashes);
  let resource = serializer.fromJSON({
    '$class': 'org.vote.PublishTokens',
    'ballot': decodeURIComponent(ballot),
    'hashedTokens': hashes
  });
  logger.debug(resource);
  return new Promise((resolve, reject) => {
    composerClient.getConnection().submitTransaction(resource)
      .then(() => {
        logger.info("PublishTokens transaction submitted")
        resolve();
      }).catch(err => {
        logger.error(err);
        reject(err);
      });
  });
}

publishVote = (ballot, token, option) => {
  logger.info('PublishVote');

  let serializer = composerClient.getDefinition().getSerializer();

  let resource = serializer.fromJSON({
    '$class': 'org.vote.PublishVote',
    'token': token,
    'selection': option
  });

  return new Promise((resolve, reject) => {
    composerClient.getConnection().submitTransaction(resource)
      .then(res => {
        logger.info("Vote published successfully")
        resolve(res);
      }).catch(err => {
        logger.error(err);
        reject(err);
      });
  });
}

module.exports = {
  getVote: getVote,
  publishTokens: publishTokens,
  publishVote: publishVote
}