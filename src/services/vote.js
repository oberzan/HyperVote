const uuidv4 = require('uuid/v4');
const crypto = require('crypto');

const composerClient = require('../composer-client');
const logger = require('../../log.js')(module);

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
    'ballot': ballot,
    'hashedTokens': hashes
  });
  logger.debug(resource);
  return new Promise((resolve, reject) => {
    composerClient.getConnection().submitTransaction(resource)
      .then(() => {
        logger.info("PublishTokens transaction submitted")
        resolve(res);
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
  publishTokens: publishTokens,
  publishVote: publishVote
}