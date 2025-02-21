module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,  // Changed to default Ganache GUI port
      network_id: "*",
      gas: 6721975,
      gasPrice: 20000000000,
    },
    cli: {        // Added separate configuration for CLI
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
      gas: 6721975,
      gasPrice: 20000000000,
    }
  },

  compilers: {
    solc: {
      version: "0.8.20",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
        evmVersion: "london"  // Added explicit EVM version
      },
    },
  },
};