const {
  web3,
  PRIVATE_KEY,
  MY_ADDRESS,
  signTx,
  getCompiledContract
} = require('./helpers');

const compiledObj = getCompiledContract(__dirname + '/contracts/Storage.json');

/** ADD YOUR ACCOUNT TO WEB3 - so that it can use your account to sign transaction automatically */
web3.eth.accounts.wallet.add('0x' + PRIVATE_KEY);

const contract = new web3.eth.Contract(compiledObj.abi);

const callContractFunction = async (contractAddress, numberToStore) => {
  const contractInstance = new web3.eth.Contract(
    compiledObj.abi,
    contractAddress
  );

  contractInstance.methods
    .store(numberToStore)
    .send({ from: MY_ADDRESS, gas: 5000000, gasPrice: 100 * 1000000000 })
    .on('transactionHash', (hash) => {
      console.log('TX STORE:', hash);
    })
    .on('receipt', async (receipt) => {
      console.log('STORE DATA SUCCESS:', receipt);
      /** Now get the new value that we just store **/
      const storedNumber = await contractInstance.methods.get().call();
      console.log('STORED NUMBER:', storedNumber);
    });
};

const startApp = async (address,number) => {
    number = Number(number);
    callContractFunction(address, number);
};

//startApp();

module.exports = {
    startApp
}
