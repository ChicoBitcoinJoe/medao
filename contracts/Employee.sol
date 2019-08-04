pragma solidity ^0.5.0;

import "./external/Owned.sol";
import "./Fundraiser.sol";
import "./Interfaces.sol";

contract Person is IPerson, Owned {

    uint public blockInitialized;

    struct Project {
        IFundraiser fundraiser;
        uint startTimestamp;
        uint endTimestamp;
        uint fundraiserDuration;
        uint fundraiserGoal;
    }

    IMeDao public Dao;              // The dao financially supporting this person
    address public identity;        // The account associated with this person
    ITimeManager public Schedule;   // Manages alloted time for projects

    function initialize (
        IMeDao _Dao,
        ITimeManager _Schedule
    ) public runOnce {
        Dao = _Dao;
        Schedule = _Schedule;
        owner = msg.sender;
        identity = msg.sender;
    }

    function startProject (
        IFundraiserFactory Factory,
        string memory projectName,
        uint startTimestamp,
        uint endTimestamp,
        uint fundraiserDuration,
        uint fundraiserGoal,
        uint expectedWorkTime
    ) public onlyOwner returns (IFundraiser fundraiser) {
        fundraiser = Factory.create(
            projectName,
            fundraiserGoal,
            fundraiserDuration
        );

        Schedule.assign(address(fundraiser), expectedWorkTime);

        return fundraiser;
    }

    function setIdentity (address newIdentity) public onlyOwner {
        identity = newIdentity;
        emit NewIdentity_event(newIdentity);
    }

    // Modifiers and Events

    modifier runOnce () {
        require(blockInitialized == 0);
        _;
        blockInitialized = block.number;
    }

    event NewIdentity_event (address newIdentity);

}

/*
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
