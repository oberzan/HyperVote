const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;

const logger = require('../log.js')(module);

var state = {
  bnDefinition: null,
  bnConnection: null
}

exports.connect = (cardName, businessNetworkId, cb) => {
  logger.info('Composer-client connect with card: ' + cardName);
  if(state.bnDefinition)
    return cb();

  state.bnConnection = new BusinessNetworkConnection();
  state.bnConnection.connect(cardName)
    .then((result) => {
      state.bnDefinition = result;
      return cb();
    }).catch((err) => {
      logger.error("Composer-client connection has failed")
      logger.error(err);
    });
}

exports.getConnection = () => {
  logger.info('returning connection')
  //logger.debug(state.bnConnection);
  return state.bnConnection;
}

exports.getDefinition = () => {
  logger.info('returning definition')
  //logger.debug(state.bnDefinition);
  return state.bnDefinition;
}