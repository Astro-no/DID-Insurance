const HDWalletProvider = require('@truffle/hdwallet-provider');
const fs = require('fs');
const path = require('path');

// Load .env if needed
require('dotenv').config({ path: path.resolve(__dirname, 'backend', '.env') });

// Load secrets from a local file
let secrets;
try {
  secrets = JSON.parse(fs.readFileSync('./secrets.json', 'utf8'));
} catch (err) {
  console.log('No secrets.json file found. Using environment variables.');
  secrets = { 
    privateKey: process.env.ADMIN_PRIVATE_KEY,
    alchemyApiKey: process.env.RPC_URL ? process.env.RPC_URL.split('/').pop() : ''
  };
}

const privateKey = secrets.privateKey || process.env.ADMIN_PRIVATE_KEY;
const alchemyProjectId = secrets.alchemyApiKey || process.env.RPC_URL?.split('/').pop();

// RPCs
const SEPOLIA_RPC_URL = `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;
//const BASE_SEPOLIA_RPC_URL = `https://base-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;
const BASE_SEPOLIA_RPC_URL = 'https://base-sepolia.g.alchemy.com/v2/SNVcG0i9XM5vuyDSOhHKJndEuJDiSJZY';

console.log("Base Sepolia RPC:", BASE_SEPOLIA_RPC_URL);
console.log("Private key defined:", privateKey ? "Yes" : "No");

module.exports = {
  networks: {
    sepolia: {
      provider: () =>
        new HDWalletProvider({
          privateKeys: [privateKey],
          providerOrUrl: SEPOLIA_RPC_URL,
          pollingInterval: 15000,
        }),
      network_id: 11155111,
      gas: 5500000,
      gasPrice: 30000000000,
      confirmations: 1,
      timeoutBlocks: 500,
      skipDryRun: true,
    },

    base_sepolia: {
      provider: () =>
        new HDWalletProvider({
          privateKeys: [privateKey],
          providerOrUrl: BASE_SEPOLIA_RPC_URL,
          pollingInterval: 15000,
        }),
      network_id: 84532, // ✅ Required for Base Sepolia
      gas: 3000000,
      gasPrice: 1000000000000,
      confirmations: 1,
      timeoutBlocks: 50000,
      skipDryRun: true,
      networkCheckTimeout: 200000,
    },
  },

  contracts_directory: './contracts',
  contracts_build_directory: './build/contracts',

  compilers: {
    solc: {
      version: "0.8.20",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
        evmVersion: "london",
      },
    },
  },
};
