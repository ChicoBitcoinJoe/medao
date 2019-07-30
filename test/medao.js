
const MeDaoArtifact = artifacts.require("MeDao");
const MeDaoFactoryArtifact = artifacts.require("MeDaoFactory");
const MiniMeTokenArtifact = artifacts.require("MiniMeToken");

contract('MeDao', (accounts) => {

    let nullAddress = '0x0000000000000000000000000000000000000000';

    let MeDaoFactory;
    let TokenFactory;

    let MeDao;
    let Time;
    let Dai;

    let name = 'Joseph Reed';
    let birthTimestamp = new Date('12/23/1989').getTime()/1000;
    let initialTokenBalance = web3.utils.toWei('0.001','ether');
    let initialReserveBalance = web3.utils.toWei('1','ether');

    let owner = accounts[1];
    let investor = accounts[2];
    let investor2 = accounts[3];

    it('should check if medao deployed correctly', async () => {
        MeDaoFactory = await MeDaoFactoryArtifact.deployed();
        Dai = new MiniMeTokenArtifact(await MeDaoFactory.dai());
        await Dai.generateTokens(owner, initialReserveBalance);
        await Dai.approve(MeDaoFactory.address, initialReserveBalance, {from: owner});
        let tx = await MeDaoFactory.create(
            name,
            birthTimestamp,
            initialTokenBalance,
            initialReserveBalance,
            {from: owner}
        );

        MeDao = await MeDaoArtifact.at(tx.logs[0].args.medao);
        Time = await MiniMeTokenArtifact.at(await MeDao.Time());

        let currentBlock = await web3.eth.getBlock('latest');
        let expectedMaxTokenSupplyInSeconds = (currentBlock.timestamp - birthTimestamp) * 40 / 168;
        let expectedMaxTokenSupply = web3.utils.toWei(expectedMaxTokenSupplyInSeconds.toString(), 'ether');
        let actualMaxTokenSupplyInWei = await MeDao.maxTokenSupply();
        let actualMaxTokenSupply = web3.utils.fromWei(actualMaxTokenSupplyInWei, 'ether').toString();

        assert(await MeDao.blockInitialized() == currentBlock.number, "blockInitialized incorrect");
        assert(await MeDao.factory() == MeDaoFactory.address, "factory address incorrect");
        assert(await MeDao.owner() == owner, "owner address incorrect");
        assert(await Time.totalSupply() == initialTokenBalance, "current token supply incorrect");
        assert(await Dai.balanceOf(MeDao.address) == initialReserveBalance, "reserve balance incorrect");
        assert(await Time.balanceOf(owner) == initialTokenBalance, "reserve balance incorrect");
        assert(await MeDao.lastPayTimestamp() == currentBlock.timestamp, "last paycheck timestamp incorrect");
        assert(actualMaxTokenSupply == expectedMaxTokenSupplyInSeconds, "max token supply incorrect");
        assert(await MeDao.calculateDaiClaim(initialTokenBalance) == initialReserveBalance, "reserve claim incorrect");
        assert(await MeDao.calculateTimeClaim(initialReserveBalance) == initialTokenBalance, "token claim incorrect");
    });

    it('should convert dai tokens into time tokens', async () => {
        let convertAmount = web3.utils.toBN(initialReserveBalance);
        await Dai.generateTokens(investor, convertAmount);
        await Dai.approve(MeDao.address, convertAmount, {from: investor});
        let tx = await MeDao.convertDai(convertAmount, {from: investor});
        let daiBalance = await Dai.balanceOf(MeDao.address);
        let expectedClaimAmount = await MeDao.calculateDaiClaim(initialTokenBalance);
        assert(daiBalance == convertAmount*2, "reserve balance incorrect");
        assert(await Time.balanceOf(investor) == initialTokenBalance, "reserve balance incorrect");
        assert(await Time.totalSupply() == initialTokenBalance * 2, "current token supply incorrect");
        assert(expectedClaimAmount.toString() == convertAmount.toString(), "reserve claim incorrect");
        assert(await MeDao.calculateTimeClaim(convertAmount) == initialTokenBalance, "token claim incorrect");
    });

    it('should convert time tokens into reserve tokens', async () => {
        let convertAmount = web3.utils.toBN(initialTokenBalance);
        let tx = await MeDao.convertTime(convertAmount, {from: investor});
        let daiBalance = await Dai.balanceOf(MeDao.address);
        assert(daiBalance.toString() == initialReserveBalance, "reserve balance incorrect");
        assert(await Time.balanceOf(investor) == '0', "token balance incorrect");
        assert(await Time.totalSupply() == initialTokenBalance, "current token supply incorrect");
        assert(await MeDao.calculateDaiClaim(initialTokenBalance) == initialReserveBalance, "reserve claim incorrect");
        assert(await MeDao.calculateTimeClaim(initialReserveBalance) == initialTokenBalance, "token claim incorrect");
    });

    it('should attempt to create time tokens over the allowed maximum', async () => {
        let allowedMaximum = await MeDao.maxTokenSupply();
        let neededDai = await MeDao.calculateDaiClaim(allowedMaximum);
        await Dai.generateTokens(investor, neededDai)
        MeDao.convertDai(neededDai, {from: investor})
        .then(tx => {
            assert(false, "time tokens created over maximum");
        })
        .catch(err => {
            // successfully reverted in VM
        });
    });

    it('should attempt to claim dai tokens over the allowed amount', async () => {
        let convertAmount = web3.utils.toBN(initialReserveBalance);
        let expectedTime = await MeDao.calculateTimeClaim(convertAmount);
        await Dai.generateTokens(investor2, convertAmount);
        await Dai.approve(MeDao.address, convertAmount, {from: investor2});
        await MeDao.convertDai(convertAmount, {from: investor2});

        MeDao.convertTime(expectedTime * 2, {from: investor2})
        .then(tx => {
            assert(false, "dai converted over allowed amount");
        })
        .catch(err => {
            // successfully reverted in VM
        });
    });

    it('should pay tokens to the owner', async () => {
        await seconds(5);
        let txReceipt = await MeDao.collectPaycheck({from: owner});
        //console.log(txReceipt.logs[0].args.tokenAmount.toString())
        assert(await Time.balanceOf(owner) > initialTokenBalance, "failed to collect pay");
        assert(await Dai.balanceOf(MeDao.address) == initialReserveBalance * 2, "reserve balance incorrect");
    });

    function seconds (s) {
        return new Promise((resolve, reject) => {
            let interval = setInterval(async () => {
                resolve();
                clearInterval(interval);
            }, s*1000);
        })
    }

});
