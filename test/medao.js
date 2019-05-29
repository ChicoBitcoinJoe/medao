const MeDaoArtifact = artifacts.require("MeDao");
const MeDaoFactoryArtifact = artifacts.require("MeDaoFactory");
const MiniMeTokenArtifact = artifacts.require("MiniMeToken");
const MiniMeTokenFactoryArtifact = artifacts.require("MiniMeTokenFactory");

contract('MeDao', (accounts) => {

    let nullAddress = '0x0000000000000000000000000000000000000000';

    let MeDao;
    let MeDaoFactory;
    let TokenFactory;
    let TimeToken;
    let ReserveToken;

    let name = 'Joseph Reed';
    let birthTimestamp = new Date('07/07/1907').getTime()/1000;
    let initialTokens = '3600000000000000000000';
    let initialReserve = '10000000000000000000';

    let owner = accounts[1];
    let investor = accounts[2];

    it('should check if medao deployed correctly', async () => {
        MeDaoFactory = await MeDaoFactoryArtifact.deployed();
        TokenFactory = await MiniMeTokenFactoryArtifact.deployed();
        ReserveToken = await createToken('Dummy Reserve Token','drt');

        await ReserveToken.generateTokens(owner, initialReserve);
        await ReserveToken.approve(MeDaoFactory.address, initialReserve, {from: owner});
        let medaoTx = await MeDaoFactory.create(
            owner,
            ReserveToken.address,
            name,
            birthTimestamp,
            initialTokens,
            initialReserve,
            {from: owner}
        );

        MeDao = await MeDaoArtifact.at(medaoTx.logs[0].args.medao);
        TimeToken = await MiniMeTokenArtifact.at(await MeDao.timeToken());
        let currentBlock = await web3.eth.getBlock('latest');
        let expectedMaxTokenSupply = Math.floor((currentBlock.timestamp - birthTimestamp)/3);

        assert(await MeDao.blockInitialized() == currentBlock.number, "blockInitialized incorrect");
        assert(await MeDao.factory() == MeDaoFactory.address, "factory address incorrect");
        assert(await MeDao.owner() == owner, "owner address incorrect");
        assert(await TimeToken.totalSupply() == initialTokens, "current token supply incorrect");
        assert(await ReserveToken.balanceOf(MeDao.address) == initialReserve, "reserve balance incorrect");
        assert(await TimeToken.balanceOf(owner) == initialTokens, "reserve balance incorrect");
        assert(await MeDao.lastPayTimestamp() == currentBlock.timestamp, "last paycheck timestamp incorrect");
        assert(await MeDao.maxTokenSupply() == expectedMaxTokenSupply, "max token supply incorrect");
        assert(await MeDao.calculateReserveClaim(initialTokens) == initialReserve, "reserve claim incorrect");
        assert(await MeDao.calculateTokenClaim(initialReserve) == initialTokens, "token claim incorrect");
    });

    it('should invest in a medao', async () => {
        let investAmount = initialReserve;
        await ReserveToken.generateTokens(investor, investAmount);
        await ReserveToken.approve(MeDao.address, investAmount, {from: investor});
        let investTx = await MeDao.invest(investAmount, {from: investor});

        assert(await ReserveToken.balanceOf(MeDao.address) == initialReserve*2, "reserve balance incorrect");
        assert(await TimeToken.balanceOf(investor) == initialTokens, "reserve balance incorrect");
        assert(await TimeToken.totalSupply() == initialTokens*2, "current token supply incorrect");
        assert(await MeDao.calculateReserveClaim(initialTokens) == initialReserve, "reserve claim incorrect");
        assert(await MeDao.calculateTokenClaim(initialReserve) == initialTokens, "token claim incorrect");
    });

    it('should divest in a medao', async () => {
        let divestAmount = initialTokens;
        let divestTx = await MeDao.divest(divestAmount, {from: investor});

        assert(await ReserveToken.balanceOf(MeDao.address) == initialReserve, "reserve balance incorrect");
        assert(await TimeToken.balanceOf(investor) == '0', "token balance incorrect");
        assert(await TimeToken.totalSupply() == initialTokens, "current token supply incorrect");
        assert(await MeDao.calculateReserveClaim(initialTokens) == initialReserve, "reserve claim incorrect");
        assert(await MeDao.calculateTokenClaim(initialReserve) == initialTokens, "token claim incorrect");
    });

    it('should collect pay in a medao', async () => {
        await seconds(5);
        await MeDao.collectPay({from: owner});
        assert(await TimeToken.balanceOf(owner) > initialTokens, "failed to collect pay");
        assert(await ReserveToken.balanceOf(MeDao.address) == initialReserve, "reserve balance incorrect");
    });

    async function createToken (name, symbol) {
        let Token = await MiniMeTokenArtifact.new(
            TokenFactory.address,
            nullAddress,
            0,
            name,
            18,
            symbol,
            true
        );

        return Token;
    }

    function seconds (s) {
        return new Promise((resolve, reject) => {
            let interval = setInterval(async () => {
                resolve();
                clearInterval(interval);
            }, s*1000);
        })
    }

});
