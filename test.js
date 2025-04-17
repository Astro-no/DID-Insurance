const Web3 = require('web3');

const web3 = new Web3('https://base-sepolia.g.alchemy.com/v2/SNVcG0i9XM5vuyDSOhHKJndEuJDiSJZY');

async function testConnection() {
  try {
    const blockNumber = await web3.eth.getBlockNumber();
    console.log("Connected to Base Sepolia! Current block number:", blockNumber);
  } catch (error) {
    console.error("Error connecting to Base Sepolia:", error);
  }
}

testConnection();

