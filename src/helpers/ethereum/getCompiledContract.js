const fs = require('fs');

const getCompiledContract = (contractPath) => {
    const compiledJson = fs.readFileSync(contractPath, 'utf-8');
    const compiledObj = JSON.parse(compiledJson);
    return compiledObj;
  };

module.exports = {
    getCompiledContract
};