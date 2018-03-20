const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;

var state = {
  bnDefinition: null,
}

exports.connect = (cardName, businessNetworkId, cb) => {
  if(state.db)
    return cb();

  let bizNetworkConnection = new BusinessNetworkConnection();
  state.connection = bizNetworkConnection.connect(cardName)
    .then((result) => {
      state.bnDefinition = result;
      return cb();
    });
}
exports.getDefinition = () => {
  return state.bnDefinition;
}

// let bizNetworkConnection = new BusinessNetworkConnection();
// let cardName = 'BNadmin-org1@voting-network';
// let businessNetworkId = 'voting-network';


// let connection = bizNetworkConnection.connect(cardName)
//   .then((result) => {
//     return result;
//   });

// module.exports = {
//   connection = connection
// }
// expor