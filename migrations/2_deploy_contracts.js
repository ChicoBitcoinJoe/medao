const MeDao = artifacts.require("MeDao");
const MeDaoFactory = artifacts.require("MeDaoFactory");
const MeDaoRegistry = artifacts.require("MeDaoRegistry");
const MiniMeTokenFactory = artifacts.require("MiniMeTokenFactory");

var Dex = {
    'live': "0x39755357759cE0d7f32dC8dC45414CCa409AE24e",
    'kovan': "0x4A6bC4e803c62081ffEbCc8d227B5a87a58f1F8F"
}

var Dai = {
    'live': "0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359",
    'kovan': "0xc4375b7de8af5a38a93548eb8453a498222c4ff2"
}

var Weth = {
    'live': "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    'kovan': "0xd0A1E359811322d97991E03f863a0C30C2cF029C"
}

module.exports = function(deployer, network, accounts) {

    if(network == "live"){
        console.log("Live network not supported yet")
    }
    else if(network == "kovan"){
        return deployer.deploy(MiniMeTokenFactory, {overwrite: false})
        //.then(() => deployer.deploy(MeDao))
        //.then(() => deployer.deploy(MeDaoFactory, MeDao.address, MiniMeTokenFactory.address))
        .then(() => deployer.deploy(MeDaoRegistry, MeDaoFactory.address, Dai[network], Weth[network]));
    }
    else if(network == "test" || network == "develop"){
        return deployer.deploy(MiniMeTokenFactory)
        .then(() => deployer.deploy(MeDao))
        .then(() => deployer.deploy(MeDaoFactory, MeDao.address, MiniMeTokenFactory.address))
    }

};
