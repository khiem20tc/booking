const Web3 = require('web3');
const FULL_NODE =
  'https://ropsten.infura.io/v3/2ee8969fa00742efb10051fc923552e1';
const web3 = new Web3(new Web3.providers.HttpProvider(FULL_NODE));

const PRIVATE_KEY =
  '7cfb5f2ceccd2aee144b676384689f0bce5812e32ba2d7126ea49ba38199a187';
const MY_ADDRESS = '0x29a2886aA7fF449fe1C7b23086Ed63844C0E6985';

module.exports = {
  web3,
  FULL_NODE,
  PRIVATE_KEY,
  MY_ADDRESS
};
