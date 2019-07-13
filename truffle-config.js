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
            host: "ubuntu@ec2-18-218-112-231.us-east-2.compute.amazonaws.com",
            port: 8545,
            network_id: 42,
            from: '0x293b7c643e4c9a4362aac71f69862035819bc20e',
            gas: 6000000,
            gasPrice: 1000000000
        }
    },
    mocha: {
        enableTimeouts: false
    }
};
