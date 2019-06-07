module.exports = {
    networks: {
        main: {
            host: "",
            port: 8545,
            network_id: 1,
            from: '0x0',
            gas: 4700000,
            gasPrice: 10000000000
        },
        kovan: {
            host: "localhost",
            port: 8545,
            network_id: 42,
            from: '0x2e9c6a76199854298775a6bac408052d8775bb68',
            gas: 4700000,
            gasPrice: 10000000000
        },
    },
    mocha: {
        enableTimeouts: false
    }
};
