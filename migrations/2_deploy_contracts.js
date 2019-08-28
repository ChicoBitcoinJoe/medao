const ListLib = artifacts.require("ListLib");

// Blueprints
const MeDaoBlueprint = artifacts.require("MeDao");
const FundraiserBlueprint = artifacts.require("Fundraiser");
const MiniMeTokenBlueprint = artifacts.require("MiniMeToken");

// Factories
const MeDaoFactory = artifacts.require("MeDaoFactory");
const MiniMeTokenFactory = artifacts.require("MiniMeTokenFactory");
const FundraiserFactory = artifacts.require("FundraiserFactory");

// Utility
const BancorFormula = artifacts.require("BancorFormula");

module.exports = function(deployer, network, accounts) {
    deployer.deploy(ListLib, {overwrite: false})
    .then(() => {
        deployer.link(ListLib, [MeDaoBlueprint]);

        return Promise.all([
            deployer.deploy(BancorFormula),
            deployer.deploy(MeDaoBlueprint, {overwrite: false}),
            deployer.deploy(FundraiserBlueprint, {overwrite: false}),
            deployer.deploy(MiniMeTokenBlueprint, {overwrite: false}),
        ])
    })
    .then(() => {
        return deployer.deploy(MiniMeTokenFactory, MiniMeTokenBlueprint.address);
    })
    .then(() => {
        return deployer.deploy(FundraiserFactory, FundraiserBlueprint.address, BancorFormula.address, ReserveToken.address, MiniMeTokenFactory.address);
    })
    .then(() => {
        return deployer.deploy(MeDaoFactory, MeDaoBlueprint.address, MiniMeTokenFactory.address);
    })
    .then(() => {
        console.log("")
        console.log("Finished deploying contracts!")
        console.log("")
    })

};
