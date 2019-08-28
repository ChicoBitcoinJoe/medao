pragma solidity ^0.5.0;

import "./external/CloneFactory.sol";
import "./external/ListLib.sol";
import "./utility/Initialized.sol";
import "./Fundraiser.sol";
import "./Interfaces.sol";
import "./NameRegistry.sol";

contract MeDao is ITimeManager, Owned, Initialized {

    using ListLib for ListLib.AddressList;

    MeDaoFactory public Factory;
    MiniMeToken public Time;
    ListLib.AddressList fundraisers;
    uint public defaultFundraiser;
    string public hash;

    function initialize (MiniMeToken _Time) public runOnce {
        owner = msg.sender;
        Factory = MeDaoFactory(msg.sender);
        Time = _Time;
    }

    function startFundraiser (
        IFundraiserFactory factory,
        string memory name,
        uint desiredWage,
        uint workHours
    ) public onlyOwner returns (IFundraiser fundraiser){
        fundraiser = factory.createFundraiser(name, desiredWage);
        require(address(fundraiser) != address(0x0));
        fundraisers.add(address(fundraiser));
        assign(workHours, address(fundraiser), address(fundraisers.index(defaultFundraiser)));
        emit Fundraiser_event(fundraiser);
    }

    function assign (uint time, address toTask, address fromTask) public onlyOwner {
        require(fundraisers.contains(toTask));
        require(fundraisers.contains(fromTask));
        assign(time, toTask, fromTask);
    }

    function setName (NameRegistry nameRegistry, string memory name) public onlyOwner {
        nameRegistry.register(name);
    }

    function setDefaultFundraiser (uint fundraiserIndex) public onlyOwner {
        require(fundraiserIndex < fundraisers.getLength());
        defaultFundraiser = fundraiserIndex;
    }

    function updateHash (string memory newHash) public onlyOwner {
        hash = newHash;
        emit UpdateHash_event(newHash);
    }

    function getTotalFundraisers () public view returns (uint) {
        return fundraisers.getLength();
    }

    function getFundraiserAtIndex (uint i) public view returns (address) {
        return fundraisers.index(i);
    }

    function getFundraiserList () public view returns (address[] memory) {
        return fundraisers.get();
    }

    event Fundraiser_event (IFundraiser fundraiser);
    event UpdateHash_event (string hash);

}

contract MeDaoFactory is CloneFactory {

    MeDao public blueprint;
    MiniMeTokenFactory public TokenFactory;

    constructor (
        MeDao _blueprint,
        MiniMeTokenFactory _TokenFactory
    ) public {
        blueprint = _blueprint;
        TokenFactory = _TokenFactory;
    }

    function register (
        string memory name,
        IFundraiserFactory factory,
        uint desiredWage
    ) public returns (MeDao medao) {
        MiniMeToken Time = TokenFactory.createCloneToken(
            address(0x0),
            0,
            'Time Manager',
            18,
            'seconds',
            true
        );

        medao = MeDao(createClone(address(blueprint)));
        medao.initialize(Time);
        medao.startFundraiser(factory, name, desiredWage, 16 hours)
        Time.generateTokens(address(_initialFundraiser), 80 hours);


        fundraisers.add(address(_initialFundraiser));
        defaultFundraiser = _initialFundraiser;

        Time.changeController(medao);
    }
}

/*
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
        uint allottedTime
    ) public onlyOwner returns (Fundraiser fundraiser) {
        fundraiser = Factory.startFundraiser(Time, name, desiredWage);
        fundraisers.add(address(fundraiser));
        require(Time.transferFrom(address(fundraisers.index(0)), address(fundraiser), allottedTime));
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
*/
