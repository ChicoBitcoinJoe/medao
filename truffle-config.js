import hosts from "hosts";
import addresses from "addresses";

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
            host: hosts[0],
            port: 8545,
            network_id: 42,
            from: addresses[0],
            gas: 6000000,
            gasPrice: 1000000000
        }
    },
    mocha: {
        enableTimeouts: false
    }
};
