pragma solidity ^0.5.0;

import "./external/CloneFactory.sol";
import "./utility/Initialized.sol";
import "./TimeReleasedFundraiser.sol";
import "./Interfaces.sol";
import "./PublicNameRegistry.sol";
import "./TimeManager.sol";

contract MeDaoController is Initialized, Owned, Cloned {

    PublicNameRegistry public NameRegistry;
    MeDao public Medao;

    function initialize (
        PublicNameRegistry _NameRegistry,
        MeDao _Medao
    ) public runOnce {
        factory = msg.sender;
        NameRegistry = _NameRegistry;
        Medao = _Medao;
    }

    // MeDao Functions

    function startFundraiser (
        ITimeReleasedFundraiserFactory FundraiserFactory,
        string memory fundraiserName,
        uint desiredWage,
        uint desiredHours
    ) public returns (ITimeReleasedFundraiser fundraiser) {
        fundraiser = FundraiserFactory.startFundraiser(
            Medao,
            fundraiserName,
            desiredWage
        );

        Medao.addTask(address(fundraiser));
        Medao.schedule(desiredHours, address(fundraiser), address(Medao));
        fundraiser.transferOwnership(address(Medao));
    }

    function collectFunds (ITimeReleasedFundraiser[] memory Fundraisers, address destination) public onlyOwner {
        for (uint i = 0; i < Fundraisers.length; i++) {
            ITimeReleasedFundraiser Fundraiser = Fundraisers[i];
            uint scheduledTime = Medao.getScheduledTime(address(Fundraiser));
            uint collectedFunds = Fundraiser.collectFunds(scheduledTime);
            bool success = Fundraiser.ReserveToken().transfer(destination, collectedFunds);
            emit Fund_event (Fundraiser, collectedFunds, success);
        }
    }

    function setName (string memory name) public onlyOwner {
        Medao.setName(NameRegistry, name);
    }

    function updateHash (string memory newHash) public onlyOwner {
        Medao.updateHash(newHash);
    }

    event Fund_event (ITimeReleasedFundraiser Fundraiser, uint collectedFunds, bool success);

    // Time Manager Functions

    function schedule (uint time, address toTask) public onlyOwner {
        Medao.schedule(time, toTask, address(Medao));
    }

    function unschedule (uint time, address fromTask) public onlyOwner {
        Medao.schedule(time, address(Medao), fromTask);
    }

    function reschedule (uint time, address toTask, address fromTask) public onlyOwner {
        Medao.schedule(time, toTask, fromTask);
    }

    // A secure two-step transfer of ownership of the Medao

    address public assignedOwner;

    function transferOwnership (address newOwner) public onlyOwner {
        assignedOwner = newOwner;
    }

    function claimOwnership () public {
        require(assignedOwner == msg.sender, "only the assigned owner can claim ownership");
        Medao.transferOwnership(msg.sender);
    }

}

contract MeDao is Initialized, Cloned, TimeManager {

    string public hash;

    function initialize (MiniMeToken _Time) public runOnce {
        owner = msg.sender;
        factory = msg.sender;
        Time = _Time;
        Time.generateTokens(address(this), 24 hours * 1 ether);
    }

    function collectFunds (ITimeReleasedFundraiser fundraiser) public onlyOwner returns (uint reserveAmount) {
        uint scheduledTime = getScheduledTime(address(fundraiser));
        reserveAmount = fundraiser.collectFunds(scheduledTime);
        fundraiser.ReserveToken().transfer(owner, reserveAmount);
    }

    function setName (PublicNameRegistry nameRegistry, string memory name) public onlyOwner {
        nameRegistry.register(name);
    }

    function updateHash (string memory newHash) public onlyOwner {
        hash = newHash;
        emit UpdateHash_event(newHash);
    }

    event UpdateHash_event (string hash);

}

contract MeDaoFactory is CloneFactory {

    address public medaoBlueprint;
    address public controllerBlueprint;
    MiniMeTokenFactory public TokenFactory;
    PublicNameRegistry public NameRegistry;

    mapping (address => bool) public created;
    mapping (address => MeDao) public registry;

    constructor (
        address _medaoBlueprint,
        address _controllerBlueprint,
        PublicNameRegistry _NameRegistry
    ) public {
        medaoBlueprint = _medaoBlueprint;
        controllerBlueprint = _controllerBlueprint;
        NameRegistry = _NameRegistry;
    }

    function register (
        ITimeReleasedFundraiserFactory FundraiserFactory,
        string memory name,
        uint desiredWage,
        uint desiredHours
    ) public isUnregistered returns (MeDao medao) {
        MiniMeToken Time = TokenFactory.createCloneToken(
            address(0x0),
            0,
            'Time',
            18,
            'hours',
            true
        );

        MeDaoController controller = MeDaoController(createClone(controllerBlueprint));
        medao = MeDao(createClone(medaoBlueprint));
        Time.changeController(address(medao));
        medao.initialize(Time);
        controller.initialize(NameRegistry, medao);

        ITimeReleasedFundraiser fundraiser = FundraiserFactory.startFundraiser(
            medao,
            name,
            desiredWage
        );

        medao.addTask(address(fundraiser));
        medao.schedule(desiredHours, address(fundraiser), address(medao));
        medao.transferOwnership(address(controller));
        registry[msg.sender] = medao;
        created[address(medao)] = true;

        emit Register_event(msg.sender, medao);
    }

    modifier isUnregistered () {
        require(registry[msg.sender] == MeDao(0x0));
        _;
    }

    event Register_event (address msgSender, MeDao medao);

}
