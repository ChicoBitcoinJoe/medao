// External
const BancorFormulaArtifact = artifacts.require("BancorFormula");

// Blueprints
const MeDaoArtifact = artifacts.require("MeDao");
const FundraiserArtifact = artifacts.require("TimeReleasedFundraiser");
const MiniMeTokenArtifact = artifacts.require("MiniMeToken");

// Factories
const MeDaoFactoryArtifact = artifacts.require("MeDaoFactory");
const MiniMeTokenFactoryArtifact = artifacts.require("MiniMeTokenFactory");
const FundraiserFactoryArtifact = artifacts.require("TimeReleasedFundraiserFactory");

contract("TimeManager", async (accounts) => {

    it("test", async () => {

    });
    
/*
    function dollars (amount) {
        return web3.utils.toWei(amount.toString(), 'ether')
    }

    function hours (amount) {
        return web3.utils.toWei((amount*60*60).toString(), 'ether')
    }

    // Settings
    let desiredWage = dollars(10);

    it("check correctness of deployment", async () => {
        let MiniMeTokenBlueprint = await MiniMeTokenArtifact.new();
        let BancorFormula = await BancorFormulaArtifact.new();
        let MiniMeTokenFactory = await MiniMeTokenFactoryArtifact.new(MiniMeTokenBlueprint.address);
        let ReserveToken = await MiniMeTokenArtifact.new();
        await ReserveToken.initialize(
            MiniMeTokenFactoryArtifact.address,
            '0x0000000000000000000000000000000000000000',
            0,
            "Reserve Token",
            18,
            "tkn",
            true
        );

        let FundraiserBlueprint = await FundraiserArtifact.new();
        let FundraiserFactory = await FundraiserFactoryArtifact.new(
            FundraiserBlueprint.address,
            ReserveToken.address,
            MiniMeTokenFactory.address,
            BancorFormula.address
        );

        let MeDaoBlueprint = await MeDaoArtifact.new();
        let MeDaoFactory = await MeDaoFactoryArtifact.new(MeDaoBlueprint.address, MiniMeTokenFactory.address)
        let tx = await MeDaoFactory.createAndStartFundraiser(
            FundraiserFactory.address,
            "Fundraiser Name",
            desiredWage
        );

    });
*/

});
