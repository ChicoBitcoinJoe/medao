pragma solidity ^0.5.0;

import "./external/CloneFactory.sol";
import "./external/ListLib.sol";
import "./external/BancorFormula.sol";
import "./utility/Initialized.sol";
import "./Fundraiser.sol";

contract NameRegistry {
    function register (string memory name) public returns (uint id);
}

contract Me is Owned {

    NameRegistry public registry;
    string public hash;

    function register (string memory name) public onlyOwner returns (uint id) {
        id = registry.register(name);
        emit Register_event(name,id);
    }

    function updateHash (string memory newHash) public onlyOwner {
        hash = newHash;
    }

    event Register_event (string name, uint id);
    event Update_event (string hash);

}

contract Dao {

    ERC20Token public Dai;
    MiniMeToken public Reward;

    function pledge (uint reserveAmount, uint minRewardAmount) public {

    }

    function unpledge (uint rewardAmount) public {

    }

}

contract IMeDao is Me, Dao {

    MeDaoFactory public Factory;
    ERC20Token public Dai;
    MiniMeToken public Reward;
    BancorFormula public Formula;

    uint public derivedSupply;
    uint32 public connectorWeight = 400000;

    function pledge (uint depositAmount, uint minReward) public {
        uint rewardAmount = Formula.calculatePurchaseReturn(
            derivedSupply,
            Dai.balanceOf(address(this)),
            connectorWeight,
            depositAmount
        );
        require(rewardAmount >= minReward);
        derivedSupply += rewardAmount;
        /* ... */
    }

    function refund (uint rewardAmount) public {
        uint depositRefund = Formula.calculateSaleReturn(
            Reward.totalSupply(),
            Dai.balanceOf(address(this)),
            connectorWeight,
            rewardAmount
        );
        /* ... */
    }

}

contract MeDao is Owned, Initialized {

    using ListLib for ListLib.AddressList;

    MeDaoFactory public Factory;
    MiniMeToken public Time;
    ListLib.AddressList fundraisers;
    uint public desiredWage;

    function initialize (
        Fundraiser _primary,
        MiniMeToken _Time
    ) public runOnce {
        owner = msg.sender;
        Time = _Time;
        fundraisers.add(address(_primary));
    }

    function startFundraiser (
        string memory name,
        uint allotedTime
    ) public onlyOwner returns (Fundraiser fundraiser) {
        fundraiser = Factory.startFundraiser(Time, name, desiredWage);
        fundraisers.add(address(fundraiser));
        require(Time.transferFrom(address(fundraisers.index(0)), address(fundraiser), allotedTime));
        emit Fundraiser_event(fundraiser);
    }

    function collectFunds (Fundraiser fundraiser) public onlyOwner returns (uint collectedFunds) {
        collectedFunds = fundraiser.collectFunds();
    }

    function collectFrom (Fundraiser[] memory list) public onlyOwner returns (uint collectedFunds) {
        for(uint i = 0; i < list.length; i++) {
            collectedFunds += collectFunds(list[i]);
        }

        Factory.ReserveToken().transfer(owner, collectedFunds);
    }

    function reschedule (uint time, Fundraiser from, Fundraiser to) public onlyOwner {
        uint collectedFunds = from.collectFunds();
        collectedFunds += to.collectFunds();
        require(Factory.ReserveToken().transfer(owner, collectedFunds));
        require(Time.transferFrom(address(from), address(to), time));
    }

    function setDesiredWage (uint _desiredWage) public onlyOwner {
        desiredWage = _desiredWage;
    }

    function getFundraiserList () public view returns (address[] memory list) {
        list = new address[](fundraisers.getLength());
        for(uint i = 0; i < fundraisers.getLength(); i++) {
            list[i] = fundraisers.index(i);
        }
    }

    function getFundraiserAt (uint i) public view returns (address) {
        return fundraisers.index(i);
    }

    event Fundraiser_event (Fundraiser fundraiser);

}

contract MeDaoFactory is CloneFactory {

    address public medaoBlueprint;
    address public fundraiserBlueprint;
    MiniMeTokenFactory public Factory;
    ERC20Token public ReserveToken;

    uint constant FORTY_HOURS = 40 * 60 * 60 * 10^18;

    mapping (address => MeDao) public registry;

    constructor (
        address _medaoBlueprint,
        address _fundraiserBlueprint,
        MiniMeTokenFactory _Factory
    ) public {
        medaoBlueprint = _medaoBlueprint;
        fundraiserBlueprint = _fundraiserBlueprint;
        Factory = _Factory;
    }

    function register (
        string memory name,
        uint desiredWage
    ) public returns (MeDao medao) {
        require(registry[msg.sender] == MeDao(0x0));

        MiniMeToken Time = Factory.createCloneToken(
            address(0x0),
            0,
            'Time',
            18,
            'hours',
            true
        );

        Fundraiser primaryFundraiser = startFundraiser(Time, name, desiredWage);
        require(Time.generateTokens(address(primaryFundraiser), FORTY_HOURS));
        Time.changeController(address(medao));

        medao = MeDao(createClone(medaoBlueprint));
        medao.initialize(primaryFundraiser, Time);
        medao.setDesiredWage(desiredWage);
        medao.transferOwnership(msg.sender);

        registry[msg.sender] = medao;
        emit Register_event(msg.sender, medao);
    }

    function startFundraiser (
        MiniMeToken Time,
        string memory name,
        uint desiredWage
    ) public returns (Fundraiser fundraiser){
        MiniMeToken RewardToken = Factory.createCloneToken(
            address(0x0),
            0,
            name,
            18,
            'seconds',
            true
        );

        fundraiser = Fundraiser(createClone(fundraiserBlueprint));
        fundraiser.initialize(ReserveToken, RewardToken, Time, desiredWage);
    }

    event Register_event (address creator, MeDao medao);
}
