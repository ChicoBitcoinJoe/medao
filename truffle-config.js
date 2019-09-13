module.exports = {
    networks: {
        main: {
            host: "127.0.0.1",     // Localhost (default: none)
            port: 8545,
            network_id: 1,
        },
        kovan: {
            host: "127.0.0.1",     // Localhost (default: none)
            port: 8545,
            network_id: 42,
        },
        develop: {
          network_id: "*",       // Any network (default: none)
        },
    },
    mocha: {
        enableTimeouts: false
    },
    compilers: {
      // solc: {
        // version: "0.5.0",    // Fetch exact version from solc-bin (default: truffle's version)
        // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
        // settings: {          // See the solidity docs for advice about optimization and evmVersion
        //  optimizer: {
        //    enabled: false,
        //    runs: 200
        //  },
        //  evmVersion: "byzantium"
        // }
      // }
    }
};
