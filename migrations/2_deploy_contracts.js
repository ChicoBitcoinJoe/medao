const ListLib = artifacts.require("ListLib");

// Blueprints
const MeDaoBlueprint = artifacts.require("MeDao");
const FundraiserBlueprint = artifacts.require("Fundraiser");
const MiniMeTokenBlueprint = artifacts.require("MiniMeToken");

// Factories
const MeDaoFactory = artifacts.require("MeDaoFactory");
const FundraiserFactory = artifacts.require("FundraiserFactory");
const MiniMeTokenFactory = artifacts.require("MiniMeTokenFactory");

module.exports = function(deployer) {
    deployer.deploy(ListLib, {overwrite: false})
    .then(() => {
        deployer.link(ListLib, [MeDaoBlueprint]);

        return Promise.all([
            deployer.deploy(MeDaoBlueprint, {overwrite: false}),
            deployer.deploy(FundraiserBlueprint, {overwrite: false}),
            deployer.deploy(MiniMeTokenBlueprint, {overwrite: false}),
        ])
    })
    .then(() => {
        return Promise.all([
            deployer.deploy(FundraiserFactory, FundraiserBlueprint.address, {overwrite: false}),
            deployer.deploy(MiniMeTokenFactory, MiniMeTokenBlueprint.address, {overwrite: false}),
        ])
    })
    .then(() => {
        return deployer.deploy(MeDaoFactory, FundraiserFactory.address, MiniMeTokenFactory.address);
    })
    .then(() => {
        console.log("")
        console.log("finished deploying contracts!")
        console.log("")
    })

};
