// Blueprints
const MeDaoArtifact = artifacts.require("MeDao");
const FundraiserArtifact = artifacts.require("TimeReleasedFundraiser");
const MiniMeTokenArtifact = artifacts.require("MiniMeToken");

// Factories
const MeDaoFactoryArtifact = artifacts.require("MeDaoFactory");
const MiniMeTokenFactoryArtifact = artifacts.require("MiniMeTokenFactory");
const FundraiserFactoryArtifact = artifacts.require("TimeReleasedFundraiserFactory");

contract("OldMeDao", async (accounts) => {

/*
    let MeDaoFactory;
    let FundraiserFactory;
    let ReserveToken;
    let desiredWage = dollars(10);

    async function setup () {
        ReserveToken = await MiniMeTokenArtifact.new();
        await ReserveToken.initialize(
            MiniMeTokenFactoryArtifact.address,
            '0x0000000000000000000000000000000000000000',
            0,
            "Reserve Token",
            18,
            "tkn",
            true
        );
        await ReserveToken.generateTokens(accounts[0], dollars(1000000));
        await ReserveToken.generateTokens(accounts[1], dollars(1000000));

        MeDaoFactory = await MeDaoFactoryArtifact.new(MeDaoArtifact.address, MiniMeTokenFactoryArtifact.address);
        FundraiserFactory = await FundraiserFactoryArtifact.new(FundraiserArtifact.address, ReserveToken.address, MiniMeTokenFactoryArtifact.address);
    }

    async function newMeDao (wage) {
        RegisterTx = await MeDaoFactory.register("John Doe", wage, FundraiserFactory.address);
        return MeDaoArtifact.at(RegisterTx.logs[0].args.medao);
    }

    it("deploy a medao", async () => {
        await setup();
        MeDao = await newMeDao(desiredWage);
        Fundraiser = await FundraiserArtifact.at(await MeDao.getFundraiserAtIndex(0));
        RewardToken = await MiniMeTokenArtifact.at(await Fundraiser.RewardToken());
        await ReserveToken.approve(Fundraiser.address, dollars(1000000));
        let R0 = await ReserveToken.balanceOf(Fundraiser.address);
        let S0 = await Fundraiser.derivedSupply();
        let expectedS0 = hours(2922 * 1000000 / await FundraiserFactory.connectorWeight());
        assert (R0 == 0, 'incorrect reserve amount');
        assert (S0 == expectedS0, 'incorrect derived supply');
    });

    it("pledge reserve tokens to nonfunded fundraiser", async () => {
        MeDao = await newMeDao(desiredWage);
        Fundraiser = await FundraiserArtifact.at(await MeDao.getFundraiserAtIndex(0));
        RewardToken = await MiniMeTokenArtifact.at(await Fundraiser.RewardToken());
        await ReserveToken.approve(Fundraiser.address, dollars(1000000));

        let tx = await Fundraiser.pledge(dollars(10));
        let reserveAmount = tx.logs[0].args.reserveAmount.toString();
        let rewardAmount = tx.logs[0].args.rewardAmount.toString();
        let expectedReward = hours(1).toString();
        assert(rewardAmount == expectedReward, 'incorrect reward balance');

        let R0 = await ReserveToken.balanceOf(Fundraiser.address);
        let S0 = await Fundraiser.derivedSupply();
        let expectedR0 = dollars(10).toString();
        let expectedS0 = hours(2922 * 1000000 / await FundraiserFactory.connectorWeight()).toString();
        assert (R0 == expectedR0, 'incorrect reserve amount');
        assert (S0 == expectedS0, 'incorrect derived supply');
    });

    it("pledge reserve tokens to a partially funded fundraiser", async () => {
        MeDao = await newMeDao(desiredWage);
        Fundraiser = await FundraiserArtifact.at(await MeDao.getFundraiserAtIndex(0));
        RewardToken = await MiniMeTokenArtifact.at(await Fundraiser.RewardToken());
        await ReserveToken.approve(Fundraiser.address, dollars(1000000));
        await ReserveToken.approve(Fundraiser.address, dollars(1000000), {from: accounts[1]});
        await Fundraiser.pledge(dollars(10), {from: accounts[1]});

        let tx = await Fundraiser.pledge(dollars(10));
        let reserveAmount = tx.logs[0].args.reserveAmount.toString();
        let rewardAmount = tx.logs[0].args.rewardAmount.toString();
        let expectedReward = hours(1).toString();
        assert(rewardAmount == expectedReward, 'incorrect reward balance');

        let R0 = await ReserveToken.balanceOf(Fundraiser.address);
        let S0 = await Fundraiser.derivedSupply();
        let expectedR0 = dollars(20).toString();
        let expectedS0 = hours(2922 * 1000000 / await FundraiserFactory.connectorWeight()).toString();
        assert (R0 == expectedR0, 'incorrect reserve amount');
        assert (S0 == expectedS0, 'incorrect derived supply');
    });

    it("pledge reserve tokens to a fully funded fundraiser", async () => {
        MeDao = await newMeDao(desiredWage);
        Fundraiser = await FundraiserArtifact.at(await MeDao.getFundraiserAtIndex(0));
        RewardToken = await MiniMeTokenArtifact.at(await Fundraiser.RewardToken());
        await ReserveToken.approve(Fundraiser.address, dollars(1000000));
        await Fundraiser.pledge(dollars(29221));

        let reserveAmount = await Fundraiser.calculatePledgeCost(hours(1));
        console.log('E ' + reserveAmount.toString());
        console.log('$ ' + await Fundraiser.calculatePledgeReward(reserveAmount));
        console.log('$ ' + await calculatePledgeReward(
            await Fundraiser.derivedSupply(),
            await ReserveToken.balanceOf(Fundraiser.address),
            await FundraiserFactory.connectorWeight(),
            reserveAmount
        ));

        assert(reserveAmount.gt(dollars(10)), 'incorrect reserve amount')
        let tx = await Fundraiser.pledge(reserveAmount);
        let rewardAmount = tx.logs[0].args.rewardAmount;
        let spentReserve = tx.logs[0].args.reserveAmount;

        console.log('T ' + rewardAmount.toString())
        console.log('H ' + spentReserve.toString())
        console.log(rewardAmount.lte(hours(1)));
        assert(rewardAmount == await Fundraiser.calculatePledgeCost(hours(1)), 'incorrect reward balance');

        // let expectedR0 = dollars(10).toString();
        // let expectedS0 = hours(2922 * 1000000 / await FundraiserFactory.connectorWeight()).toString();
        // assert (R0 == expectedR0, 'incorrect reserve amount');
        // assert (S0 == expectedS0, 'incorrect derived supply');
    });

    it("unpledge reward tokens", async () => {

    });

    it("burn reward tokens", async () => {

    });

    function dollars (amount) {
        return web3.utils.toWei(amount.toString(), 'ether')
    }

    function hours (amount) {
        return web3.utils.toWei((amount*60*60).toString(), 'ether')
    }
*/
});
