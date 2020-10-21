const EthereumTX = require('ethereumjs-tx');

const signTx = (rawTx, privateKey) => {
    const privKeyToSign = Buffer.from(privateKey, 'hex');
  
    var tx = new EthereumTX(rawTx, { chain: 'ropsten' });
    tx.sign(privKeyToSign);
    var serializedTx = tx.serialize();
  
    return '0x' + serializedTx.toString('hex');
  };

module.exports = {
    signTx
};