const MeDaoBlueprint = artifacts.require("MeDao");
const MeDaoFactory = artifacts.require("MeDaoFactory");
const ReserveCurrency = artifacts.require("MiniMeToken");
const MiniMeTokenFactory = artifacts.require("MiniMeTokenFactory");

var Dai = {
    'live': "0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359",
    'kovan': "0xc4375b7de8af5a38a93548eb8453a498222c4ff2"
}

module.exports = function(deployer, network, accounts) {

    if(network == "live"){
        console.log("Live network not supported yet")
    }
    else if(network == "kovan"){
        return deployer.deploy(MiniMeTokenFactory, {overwrite: false})
        .then(() => deployer.deploy(MeDaoBlueprint))
        .then(() => deployer.deploy(MeDaoFactory, MeDaoBlueprint.address, Dai[network], MiniMeTokenFactory.address))
    }
    else if(network == "test" || network == "develop"){
        return deployer.deploy(MiniMeTokenFactory)
        .then(() => deployer.deploy(MeDaoBlueprint))
        .then(() => deployer.deploy(ReserveCurrency, MiniMeTokenFactory.address, '0x0000000000000000000000000000000000000000', 0, 'Reserve Currency', 18, 'res', true))
        .then(() => deployer.deploy(MeDaoFactory, MeDaoBlueprint.address, ReserveCurrency.address, MiniMeTokenFactory.address))
    }

};
