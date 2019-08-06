pragma solidity ^0.5.0;

import "./external/CloneFactory.sol";
import "./MeDao.sol";
import "./TimeScheduler.sol";
import "./MoneyPool.sol";
import "./Interfaces.sol";

contract HumanCapital is Initialized, Owned {

    ERC20Token public Dai;

    MeDao public Dao;
    TimeScheduler public Scheduler;

    function initialize (
        ERC20Token _Dai,
        MeDao _Dao,
        TimeScheduler _Scheduler
    ) public runOnce {
        Dai = _Dai;
        Dao = _Dao;
        Scheduler = _Scheduler;
    }

    function collectPaycheck (IFundraiser[] memory fundraisers) public onlyOwner returns (uint payAmount) {
        uint totalCollectedFunds = 0;
        for(uint i = 0; i < fundraisers.length; i++) {
            IFundraiser fundraiser = fundraisers[i];
            uint collectedFunds = fundraiser.collectFunds();
            uint scheduledTime = Scheduler.getTime(address(fundraiser));
            if(scheduledTime > 8 hours) {
                scheduledTime = 8 hours;
            }

            uint earnedFunds = collectedFunds * scheduledTime / 8 hours;
            uint refund = collectedFunds - earnedFunds;
            require(Dai.transfer(address(fundraiser), refund));
            totalCollectedFunds += earnedFunds;
        }
    }

}

contract HumanCapitalFactory is CloneFactory {

    HumanCapital public blueprint;
    MeDaoFactory public MedaoFactory;
    TimeSchedulerFactory public SchedulerFactory;
    ERC20Token public Dai;

    function register (
        string memory name,
        uint maxTokenSupply,
        uint baseShareValue
    ) public returns (HumanCapital person){
        MeDao dao = MedaoFactory.create(
            Dai,
            name,
            maxTokenSupply,
            baseShareValue
        );

        TimeScheduler scheduler = SchedulerFactory.create(address(dao), 16 hours);
        person = HumanCapital(createClone(address(blueprint)));
        person.initialize(Dai, dao, scheduler);
        dao.transferOwnership(address(person));
        scheduler.transferOwnership(address(person));
    }

}


/*
contract Identity is IIdentity, Owned {

    uint public blockInitialized;

    struct Project {
        IFundraiser fundraiser;
        uint startTimestamp;
        uint endTimestamp;
        uint fundraiserDuration;
        uint fundraiserGoal;
    }

    mapping (address => bool) allowedFactories; // This flag allows a factory to schedule a project
    IFundraiser public Dao;         // The dao financially supporting this person
    ITimeScheduler public Schedule; // Manages alloted time for projects
    address public identity;        // The account associated with this person

    function initialize (
        IFundraiser _Dao,
        ITimeScheduler _Schedule
    ) public runOnce {
        Dao = _Dao;
        Schedule = _Schedule;
        owner = msg.sender;
        identity = msg.sender;
    }

    function scheduleProject (
        IFundraiser fundraiser,
        uint expectedWorkTime
    ) public onlyAllowedFactories  {
        Schedule.register(address(fundraiser));
        Schedule.assign(expectedWorkTime, address(fundraiser), address(Dao));
    }

    function reschedule (uint time, address projectA, address projectB) public onlyOwner {
        Schedule.assign(time, projectA, projectB);
    }

    function collectPay (IFundraiser[] memory fundraisers) public onlyOwner {
        uint totalCollectedFunds = 0;
        for(uint i = 0; i < fundraisers.length; i++) {
            IFundraiser fundraiser = fundraisers[i];
            uint collectedFunds = fundraiser.collectFunds();
            uint scheduledTime = Schedule.getTime(address(fundraiser));
            if(scheduledTime > 8 hours) {
                scheduledTime = 8 hours;
            }

            uint earnedFunds = collectedFunds * scheduledTime / 8 hours;
            uint refund = collectedFunds - earnedFunds;
            require(fundraiser.reserveToken().transfer(address(fundraiser), refund));
            totalCollectedFunds += earnedFunds;
        }
    }

    function allowFactory (address factory, bool allowed) public onlyOwner {
        allowedFactories[factory] = allowed;
    }

    // MeDao

    function setHash (string memory newHash) public onlyOwner {
        hash = newHash;
        emit NewHash_event(newHash);
    }

    function createCloneToken (
        MiniMeToken cloneableToken,
        string memory tokenName,
        string memory tokenSymbol,
        uint snapshotBlock
    ) public onlyOwner {
        address token = cloneableToken.createCloneToken(
            tokenName,
            18,
            tokenSymbol,
            snapshotBlock,
            true
        );

        clones.push(token);
        emit Clone_event(token);
    }
    function getClones () public view returns (address[] memory) {
        return clones;
    }

    function getTotalClones () public view returns (uint) {
        return clones.length;
    }

    // TimeScheduler

    function lock () public {}

    function unlock () public {}

    // Getters and Setters

    function setIdentity (address newIdentity) public onlyOwner {
        identity = newIdentity;
        emit NewIdentity_event(newIdentity);
    }

    // Modifiers and Events

    modifier onlyAllowedFactories () {
        require(allowedFactories[msg.sender]);
        _;
    }

    modifier runOnce () {
        require(blockInitialized == 0);
        _;
        blockInitialized = block.number;
    }

    event NewIdentity_event (address newIdentity);

}

contract EmployeeRegistry is CloneFactory {

    Employee Blueprint;
    ERC20 public Dai;
    MiniMeTokenFactory public Factory;

    mapping (address => bool) public created;
    mapping (address => Employee) public registry;

    constructor (
        Employee _Blueprint,
        ERC20 _Dai,
        MiniMeTokenFactory _Factory
    ) public {
        Blueprint = _Blueprint;
        Dai = _Dai;
        Factory = _Factory;
    }

    function register (
        string memory name,
        uint maxTokenSupply,
        uint initialShares,
        uint initialReserves
    ) public returns (Employee employee){
        require(!isRegistered(msg.sender));
        require(maxTokenSupply > 0);
        require(maxTokenSupply >= initialShares);
        require(Dai.transferFrom(msg.sender, address(this), initialReserves));

        MiniMeToken shareToken = Factory.createCloneToken(
            address(0x0),
            0,
            name,
            18,
            'seconds',
            true
        );

        employee = Employee(createClone(address(Blueprint)));
        employee.initialize(
            msg.sender,
            Dai,
            shareToken,
            maxTokenSupply,
            initialShares,
            initialReserves
        );

        registry[msg.sender] = employee;
        created[address(employee)] = true;
    }

    function register (Employee employee) public {
        require(created[address(employee)]);
        require(!isRegistered(msg.sender));
        require(employee.identity() == address(employee));
        registry[msg.sender] = employee;
    }

    function isRegistered (address identity) public view returns (bool) {
        return address(registry[identity]) != address(0x0);
    }

}
*/
/**
    The goal of this contract is to allow anyone in the world to invest directly in the value of a person.
    Similar to a crowdfund, many people deposit into a pool of currency. The employee then collects a
    salary over time from the pool. Unlike traditional crowdfunds, funds are secured by a smart contract
    with certain gaurantees. In addition, as an Employee adds utility to their token, investors have the
    potential of making a profit if extra currency is payed the pool or if shares are burned through use.

    1. Investors convert a reserve token into a share token up to a maximum
    2. The reserve token provides a price floor on the value of the person
    3. The owner can withdraw reserve currency over time as compensation for work done
    4. At any point, an investor can convert their share tokens back into an equal portion of the reserve tokens.
    5. The employee can give back to investors by increasing the reserve token backing or decreasing the total supply of shares
    6. Additionally, the employee can create snapshot tokens with an equivalent distribution of their share token.

    Whitepaper: https://docs.google.com/document/d/1A8fjq-fONbSUo_zS8ac7Qs3hqog2Ap78eWHjDGHI5_s/edit#heading=h.m1cmgqsdjew5
**/
/*
contract EmployeeOld is Owned, TokenController {

    address public factory;         // The factory that deployed this contract
    uint public blockInitialized;   // The block this contract was initialized

    ERC20 public reserveToken;      // A reserve token to hold the value of a person
    MiniMeToken public shareToken;  // A cloneable token that represents a share of a person
    uint public maxTokenSupply;     // The maximum amount of tokens that can be created
    uint public burnedTokenSupply;  // The total amount of time burned by this contract

    address public identity;        // The account associated with this medao
    uint public paycheckTimestamp;  // The timestamp a paycheck was last collected
    string public hash;             // The hash of any relevant data about this medao
    address[] public tokens;        // A list of tokens associated with the employee

    constructor () public {
        blockInitialized = block.number;
    }

    function initialize (
        address _owner,
        ERC20 _reserveToken,
        MiniMeToken _shareToken,
        uint _maxTokenSupply,
        uint _initialShares,
        uint _initialReserves
    ) public {
        require(blockInitialized == 0, 'contract already initialized');
        require(_maxTokenSupply >= _initialShares, 'initial shares invalid');

        blockInitialized = block.number;
        factory = msg.sender;
        paycheckTimestamp = now;

        owner = _owner;
        identity = _owner;
        shareToken = _shareToken;
        reserveToken = _reserveToken;
        maxTokenSupply = _maxTokenSupply;

        require(reserveToken.transferFrom(msg.sender, address(this), _initialReserves), "failed to transfer initial reserves");
        require(shareToken.generateTokens(owner, _initialShares), "failed to generate shares");
    }

    function calculateShareClaim (uint reserveAmount) public view returns (uint) {
        return shareToken.totalSupply() * reserveAmount / reserveToken.balanceOf(address(this));
    }

    function calculateReserveClaim (uint shareAmount) public view returns (uint) {
        return reserveToken.balanceOf(address(this)) * shareAmount / shareToken.totalSupply();
    }

    function calculateCurrentPaycheck () public view returns (uint) {
        uint elapsedSeconds = now - paycheckTimestamp;
        uint workTime = elapsedSeconds * 1 ether * 40 / 168;
        return workTime * shareToken.totalSupply() / maxTokenSupply;
    }

    function collectPaycheck () public onlyOwner returns (uint shareClaim) {
        shareClaim = calculateCurrentPaycheck();
        require(shareToken.generateTokens(owner, shareClaim), 'failed to pay');
        emit Pay_event(shareClaim);
    }

    function invest (uint reserveAmount) public {
        uint availableSeconds = maxTokenSupply - shareToken.totalSupply();
        uint claimedShares = calculateShareClaim(reserveAmount);
        require(availableSeconds >= claimedShares, "invalid reserve amount");
        require(reserveToken.transferFrom(msg.sender, address(this), reserveAmount), "failed to transfer");
        require(shareToken.generateTokens(msg.sender, claimedShares), "failed to generate tokens");
        emit Invest_event(msg.sender, reserveAmount, claimedShares);
    }

    function divest (uint shareAmount) public {
        uint reserveClaim = calculateReserveClaim(shareAmount);
        require(shareToken.destroyTokens(msg.sender, shareAmount), "failed to destroy tokens");
        require(reserveToken.transfer(msg.sender, reserveClaim), "failed to transfer");
        emit Divest_event(msg.sender, shareAmount, reserveClaim);
    }

    function burn (uint shareAmount) public {
        require(shareToken.destroyTokens(msg.sender, shareAmount), "failed to burn shares");
        maxTokenSupply -= shareAmount;
        burnedTokenSupply += shareAmount;
        emit Burn_event(msg.sender, shareAmount);
    }

    function addToken (ERC20 token) public onlyOwner {
        tokens.push(address(token));
        emit Token_event(token);
    }

    function getTokens () public view returns (address[] memory) {
        return tokens;
    }

    function getTotalTokens () public view returns (uint) {
        return tokens.length;
    }

    /// Token Controller Functions

    function proxyPayment (address _owner) public payable returns(bool) {
        _owner;
        return false;
    }

    function onTransfer (address _from, address _to, uint _amount) public returns(bool) {
        _from; _to; _amount;
        return true;
    }

    function onApprove (address _owner, address _spender, uint _amount) public returns(bool) {
        _owner; _spender; _amount;
        return true;
    }

    /// Events

    event Invest_event (address msgSender, uint reserveAmount, uint shareClaim);
    event Divest_event (address msgSender, uint shareAmount, uint reserveClaim);
    event Burn_event (address msgSender, uint shareAmount);
    event Pay_event (uint shareClaim);
    event Token_event (ERC20 token);

}

*/
