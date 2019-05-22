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
            host: "ec2-18-217-171-10.us-east-2.compute.amazonaws.com",
            port: 8545,
            network_id: 42,
            from: '0xced49a637559c504807d7805ccf522b03cb585e0',
            gas: 4700000,
            gasPrice: 10000000000
        },
    },
    mocha: {
        enableTimeouts: false
    }
};
