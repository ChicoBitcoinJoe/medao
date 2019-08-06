pragma solidity ^0.5.0;

import "./external/CloneFactory.sol";
import "./MoneyPool.sol";
import "./Interfaces.sol";

contract MeDao is MoneyPool {

    uint public collectedTimestamp; // The timestamp when a paycheck was last collected

    function initialize (
        ERC20Token _reserveToken,
        MiniMeToken _shareToken,
        uint _maxTokenSupply,
        uint _baseShareValue,
        bool _useBaseValue
    ) public runOnce {
        collectedTimestamp = now;

        setupMoneyPool (
            _reserveToken,
            _shareToken,
            _maxTokenSupply,
            _baseShareValue,
            false
        );
    }

    function calculateWorkTime (uint elapsedSeconds) public pure returns (uint) {
        return elapsedSeconds * 1 ether * 40 / 168;
    }

    function collect () public onlyOwner returns (uint collectedFunds){
        uint elapsedSeconds = now - collectedTimestamp;
        uint workTime = calculateWorkTime(elapsedSeconds);
        collectedFunds = workTime * shareToken.totalSupply() / maxTokenSupply;
        issue(owner, collectedFunds);
        emit Collect_event(collectedFunds);
    }

}

contract MeDaoFactory is CloneFactory {

    MeDao public blueprint;
    MiniMeTokenFactory factory;

    mapping (address => bool) public created;

    function create (
        ERC20Token reserveToken,
        string memory name,
        uint maxTokenSupply,
        uint baseShareValue
    ) public returns (MeDao medao){
        MiniMeToken shareToken = factory.createCloneToken(
            address(0x0),
            0,
            name,
            18,
            'seconds',
            true
        );

        medao = MeDao(createClone(address(blueprint)));
        medao.initialize(
            reserveToken,
            shareToken,
            maxTokenSupply,
            baseShareValue,
            false
        );

        created[address(medao)] = true;
    }

}

/*
contract MeDao is Owned, SimpleTokenController {

    address public factory;         // The factory that deployed this contract
    uint public blockInitialized;   // The block this contract was initialized

    ERC20Token public reserveToken; // A reserve token to hold the value of a person
    MiniMeToken public shareToken;  // A cloneable token that represents a share of a person
    uint public desiredWage;        // How much the owner desires to earn per second worked
    uint public maxTokenSupply;     // The maximum amount of shares that can be created
    uint public burnedTokenSupply;  // The maximum amount of shares that can be created
    uint public collectedTimestamp; // The timestamp when a paycheck was last collected

    constructor () public {
        blockInitialized = block.number;
    }

    function initialize (
        address _owner,
        ERC20Token _reserveToken,
        MiniMeToken _shareToken,
        uint _fundraiserGoal,
        uint _fundraiserDuration
    ) public {
        require(blockInitialized == 0, "contract already initialized");

        blockInitialized = block.number;

        owner = _owner;
        reserveToken = _reserveToken;
        shareToken = _shareToken;
        collectedTimestamp = now;

        desiredWage = _fundraiserGoal / _fundraiserDuration;
        maxTokenSupply = _fundraiserDuration * 1 ether;
        collectedTimestamp = now;
    }

    function calculateTimeClaim (uint daiAmount) public view returns (uint) {
        return shareToken.totalSupply() * daiAmount / reserveToken.balanceOf(address(this));
    }

    function calculateDaiClaim (uint timeAmount) public view returns (uint) {
        return reserveToken.balanceOf(address(this)) * timeAmount / shareToken.totalSupply();
    }

    function calculateWorkTime (uint elapsedSeconds) public pure returns (uint) {
        return elapsedSeconds * 1 ether * 40 / 168;
    }

    function collectFunds () public onlyOwner returns (uint collectedFunds){
        uint elapsedSeconds = now - collectedTimestamp;
        uint workTime = calculateWorkTime(elapsedSeconds);
        uint fundedTime = workTime * shareToken.totalSupply() / maxTokenSupply;
        collectedFunds = calculateDaiClaim(fundedTime);
        require(reserveToken.transfer(owner, collectedFunds), 'failed to transfer');
        collectedTimestamp = now;
        emit Pay_event(fundedTime, collectedFunds);
    }

    function deposit (uint daiAmount) public {
        uint availableSeconds = maxTokenSupply - shareToken.totalSupply();
        uint claimedTime = calculateTimeClaim(daiAmount);
        require(availableSeconds >= claimedTime, "invalid reserve amount");
        require(reserveToken.transferFrom(msg.sender, address(this), daiAmount), "failed to transfer");
        require(shareToken.generateTokens(msg.sender, claimedTime), "failed to generate tokens");
        emit ConvertDai_event(msg.sender, daiAmount, claimedTime);
    }

    function withdraw (uint timeAmount) public {
        uint daiClaim = calculateDaiClaim(timeAmount);
        require(shareToken.destroyTokens(msg.sender, timeAmount), "failed to destroy tokens");
        require(reserveToken.transfer(msg.sender, daiClaim), "failed to transfer");
        emit ConvertTime_event(msg.sender, timeAmount, daiClaim);
    }

    function burn (uint timeAmount) public {
        require(shareToken.destroyTokens(msg.sender, timeAmount), "failed to burn tokens");
        maxTokenSupply -= timeAmount;
        burnedTokenSupply += timeAmount;
        emit Burn_event(msg.sender, timeAmount);
    }

    event Pay_event (uint timeAmount, uint daiAmount);
    event ConvertDai_event (address msgSender, uint daiAmount, uint timeAmount);
    event ConvertTime_event (address msgSender, uint timeAmount, uint daiAmount);
    event Burn_event (address msgSender, uint timeAmount);
    event NewHash_event (string newHash);

}

contract MeDaoFactory is CloneFactory {

    address public blueprint;
    ERC20Token public dai;
    MiniMeTokenFactory factory;

    mapping (address => bool) public created;
    mapping (address => MeDao) public registry;

    constructor (
        address _blueprint,
        ERC20Token _dai,
        MiniMeTokenFactory _factory
    ) public {
        blueprint = _blueprint;
        dai = _dai;
        factory = _factory;
    }

    function create (
        string memory name,
        //int birthTimestamp,
        uint tokenClaim,
        uint initialReserve
    ) public returns (MeDao medao) {
        require(address(registry[msg.sender]) == address(0x0));
        require(initialReserve > 0);
        require(tokenClaim > 0);

        MiniMeToken timeToken = factory.createCloneToken(
            address(0x0),
            0,
            name,
            18,
            'seconds',
            true
        );

        medao = MeDao(createClone(blueprint));
        created[address(medao)] = true;
        timeToken.changeController(address(medao));
        require(dai.transferFrom(msg.sender, address(medao), initialReserve));
        //medao.initialize(msg.sender, dai, timeToken, birthTimestamp, tokenClaim);

        registry[msg.sender] = medao;
        emit Register_event(msg.sender, medao);
    }

    event Register_event (address indexed owner, MeDao medao);
}
*/
