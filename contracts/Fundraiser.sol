pragma solidity ^0.5.0;

import "./external/MiniMeToken.sol";
import "./external/ERC20.sol";
import "./external/Owned.sol";
import "./external/CloneFactory.sol";

contract Fundraiser is Owned, TokenController {

    address public factory;         // The factory that deployed this contract
    uint public blockInitialized;   // The block this contract was initialized

    ERC20 public reserveToken;      // A reserve token to hold the value of a person
    MiniMeToken public shareToken;  // A cloneable token that represents a share of a person
    uint public desiredWage;        // How much the owner desires to earn per second worked
    uint public maxTokenSupply;     // The maximum amount of shares that can be created
    uint public collectedTimestamp; // The timestamp when a paycheck was last collected

    constructor () public {
        blockInitialized = block.number;
    }

    function initialize (
        address _owner,
        ERC20 _reserveToken,
        MiniMeToken _shareToken,
        uint _startTimestamp,
        uint _fundraiserGoal,
        uint _fundraiserDuration
    ) public {
        require(blockInitialized == 0, "contract already initialized");

        blockInitialized = block.number;

        owner = _owner;
        reserveToken = _reserveToken;
        shareToken = _shareToken;
        collectedTimestamp = _startTimestamp;

        desiredWage = _fundraiserGoal / _fundraiserDuration;
        maxTokenSupply = _fundraiserDuration * 1 ether;
        collectedTimestamp = now;
    }

    function calculateShareClaim (uint reserveAmount) public view returns (uint) {
        return reserveAmount * 1 ether / desiredWage;
    }

    function calculateReserveClaim (uint shareAmount) public view returns (uint) {
        return reserveToken.balanceOf(address(this)) * shareAmount / shareToken.totalSupply();
    }

    function calculateWorkTime () public view returns (uint){
        uint elapsedSeconds = now - collectedTimestamp;
        return elapsedSeconds * 1 ether * 40 / 168;
    }

    function collect (uint claimedWorkTime) public onlyOwner returns (uint reserveClaim) {
        uint maxWorkTime = calculateWorkTime();
        require(maxWorkTime >= claimedWorkTime, "invalid work time");
        uint maxReserveClaim = claimedWorkTime * desiredWage / 1 ether;
        reserveClaim = maxReserveClaim * shareToken.totalSupply() / maxTokenSupply;
        require(reserveToken.transfer(owner, reserveClaim), 'failed to pay');
        emit Collect_event(workTime, reserveClaim);
    }

    function deposit (uint reserveAmount) public returns (uint shareClaim) {
        uint availableSeconds = maxTokenSupply - shareToken.totalSupply();
        shareClaim = calculateShareClaim(reserveAmount);
        require(availableSeconds >= shareClaim, "invalid reserve amount");
        require(reserveToken.transferFrom(msg.sender, address(this), reserveAmount), "failed to transfer");
        require(shareToken.generateTokens(msg.sender, shareClaim), "failed to generate tokens");
        emit Deposit_event(msg.sender, reserveAmount, shareClaim);
    }

    function withdraw (uint shareAmount) public returns (uint reserveClaim) {
        reserveClaim = calculateReserveClaim(shareAmount);
        require(shareToken.destroyTokens(msg.sender, shareAmount), "failed to destroy tokens");
        require(reserveToken.transfer(msg.sender, reserveClaim), "failed to transfer");
        emit Withdraw_event(msg.sender, shareAmount, reserveClaim);
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

    event Collect_event (uint workTime, uint reserveClaim);
    event Deposit_event (address msgSender, uint reserveAmount, uint shareClaim);
    event Withdraw_event (address msgSender, uint shareAmount, uint reserveClaim);

}

contract FundraiserFactory is CloneFactory {

    Fundraiser blueprint;
    ERC20 public Dai;
    MiniMeTokenFactory public TokenFactory;

    mapping (address => bool) public created;

    constructor (
        ERC20 _Dai,
        Fundraiser _blueprint,
        MiniMeTokenFactory _TokenFactory
    ) public {
        Dai = _Dai;
        blueprint = _blueprint;
        TokenFactory = _TokenFactory;
    }

    function create (
        string memory name,
        uint startTimestamp,
        uint fundraiserGoal,
        uint fundraiserDuration
    ) public returns (Fundraiser fundraiser) {
        require(fundraiserGoal > 0);
        require(fundraiserDuration > 0);

        MiniMeToken shareToken = TokenFactory.createCloneToken(
            address(0x0),
            0,
            name,
            18,
            'seconds',
            true
        );

        fundraiser = Fundraiser(createClone(address(blueprint)));
        fundraiser.initialize(
            msg.sender,
            Dai,
            shareToken,
            startTimestamp,
            fundraiserGoal,
            fundraiserDuration
        );

        created[address(fundraiser)] = true;
    }

}
