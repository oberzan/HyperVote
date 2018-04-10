import { BusinessNetworkConnection } from 'composer-client';

import logger from '../log.js';

var state = {
  bnDefinition: null,
  bnConnection: null
}

export const connect = (cardName, businessNetworkId, cb) => {
  logger.info('Composer-client connect');
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

export const getConnection = () => {
  logger.info('returning connection')
  // console.log(state.bnConnection);
  return state.bnConnection;
}

export const getDefinition = () => {
  logger.info('returning definition')
  // console.log(state.bnDefinition);
  return state.bnDefinition;
}