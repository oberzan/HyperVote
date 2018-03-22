const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;

var state = {
  bnDefinition: null,
  bnConnection: null
}

exports.connect = (cardName, businessNetworkId, cb) => {
  console.log('Composer-client connect');
  if(state.bnDefinition)
    return cb();

  state.bnConnection = new BusinessNetworkConnection();
  state.bnConnection.connect(cardName)
    .then((result) => {
      state.bnDefinition = result;
      return cb();
    }).catch((err) => {
      console.log("Composer-client connection has failed")
      console.log(err);
    });
}

exports.getConnection = () => {
  console.log('returning connection')
  console.log(state.bnConnection);
  return state.bnConnection;
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