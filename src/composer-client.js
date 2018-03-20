const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;

var state = {
  bnDefinition: null,
}

exports.connect = (cardName, businessNetworkId, cb) => {
  console.log('Composer-client connect');
  if(state.bnDefinition)
    return cb();

  let bizNetworkConnection = new BusinessNetworkConnection();
  state.connection = bizNetworkConnection.connect(cardName)
    .then((result) => {
      state.bnDefinition = result;
      return cb();
    });
}
exports.getDefinition = () => {
  console.log('returning definition')
  console.log(state.bnDefinition);
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