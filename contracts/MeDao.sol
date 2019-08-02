pragma solidity ^0.5.0;

import "./external/MiniMeToken.sol";
import "./external/ERC20.sol";
import "./external/Owned.sol";

/**
    The goal of this contract is to allow investing directly in the value of a person.
    1. Investors convert a reserve token into time tokens up to a maximum based on age
    2. The reserve token (dai) provides a price floor on the value of the person's time
    3. The owner can generate a set amount of tokens over time as compensation for work done
    4. At any point, a person can convert their time tokens back into what remains of their
        share of the reseerve tokens.
**/
contract MeDao is Owned, TokenController {

    address public factory;         // The factory that deployed this contract
    uint public blockInitialized;   // The block this contract was initialized

    ERC20 public Dai;               // A reserve currency to hold the value of a person
    MiniMeToken public Time;        // A cloneable token that represents the value of a person
    uint public maxTimeSupply;      // The maximum amount of time that can be created
    uint public burnedTimeSupply;   // The total amount of time burned by this contract

    address public identity;        // The account associated with this medao
    address[] public clones;        // A list of clones created by the owner
    int public birthTimestamp;      // The Unix timestamp of the birth date of
    uint public lastPayTimestamp;   // The last time the owner collected a paycheck

    string public hash;             // The hash of any relevant data about this medao

    constructor () public {
        // ensures the blueprint provided to the factory cannot be initialized
        blockInitialized = block.number;
    }

    function initialize (
        address _owner,
        MiniMeToken _Time,
        ERC20 _Dai,
        int _birthTimestamp,
        uint _initialTimeBalance
    ) public {
        require(blockInitialized == 0, 'contract already initialized');
        require(_birthTimestamp < int(now), 'invalid birth timestamp');

        blockInitialized = block.number;
        factory = msg.sender;

        owner = _owner;
        identity = _owner;
        Time = _Time;
        Dai = _Dai;
        birthTimestamp = _birthTimestamp;

        uint elapsedSeconds = uint(int(now) - birthTimestamp);
        maxTimeSupply = calculateWorkTime(elapsedSeconds);
        lastPayTimestamp = now;

        require(Time.generateTokens(owner, _initialTimeBalance), "failed to generate tokens");
    }

    function getClones () public view returns (address[] memory) {
        return clones;
    }

    function getTotalClones () public view returns (uint) {
        return clones.length;
    }

    function calculateTimeClaim (uint daiAmount) public view returns (uint) {
        return Time.totalSupply() * daiAmount / Dai.balanceOf(address(this));
    }

    function calculateDaiClaim (uint timeAmount) public view returns (uint) {
        return Dai.balanceOf(address(this)) * timeAmount / Time.totalSupply();
    }

    function calculateWorkTime (uint elapsedSeconds) public pure returns (uint) {
        return elapsedSeconds * 1 ether * 40 / 168;
    }

    function collectPaycheck () public onlyOwner {
        uint elapsedSeconds = now - lastPayTimestamp;
        uint workTime = calculateWorkTime(elapsedSeconds);
        uint fundedTime = workTime * Time.totalSupply() / maxTimeSupply;
        uint daiClaim = calculateDaiClaim(fundedTime);
        require(Dai.transfer(owner, daiClaim), 'failed to transfer');
        emit Pay_event(fundedTime, daiClaim);
    }

    function convertDai (uint daiAmount) public {
        uint availableSeconds = maxTimeSupply - Time.totalSupply();
        uint claimedTime = calculateTimeClaim(daiAmount);
        require(availableSeconds >= claimedTime, "invalid reserve amount");
        require(Dai.transferFrom(msg.sender, address(this), daiAmount), "failed to transfer");
        require(Time.generateTokens(msg.sender, claimedTime), "failed to generate tokens");
        emit ConvertDai_event(msg.sender, daiAmount, claimedTime);
    }

    function convertTime (uint timeAmount) public {
        uint daiClaim = calculateDaiClaim(timeAmount);
        require(Time.destroyTokens(msg.sender, timeAmount), "failed to destroy tokens");
        require(Dai.transfer(msg.sender, daiClaim), "failed to transfer");
        emit ConvertTime_event(msg.sender, timeAmount, daiClaim);
    }

    function burn (uint timeAmount) public {
        require(Time.destroyTokens(msg.sender, timeAmount), "failed to burn tokens");
        maxTimeSupply -= timeAmount;
        burnedTimeSupply += timeAmount;
        emit Burn_event(msg.sender, timeAmount);
    }

    function setHash (string memory newHash) public onlyOwner {
        hash = newHash;
        emit NewHash_event(newHash);
    }

    function setIdentity (address newIdentity) public onlyOwner {
        identity = newIdentity;
        emit NewIdentity_event(newIdentity);
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

    event Pay_event (uint timeAmount, uint daiAmount);
    event Clone_event (address token);
    event ConvertDai_event (address msgSender, uint daiAmount, uint timeAmount);
    event ConvertTime_event (address msgSender, uint timeAmount, uint daiAmount);
    event Burn_event (address msgSender, uint timeAmount);
    event NewHash_event (string newHash);
    event NewIdentity_event (address newIdentity);

/// Token Controller Functions

    function proxyPayment (address _owner) public payable returns(bool) {
        _owner;
        return false;
    }

    function onTransfer (address _from, address _to, uint _amount) public returns(bool) {
        _from; _amount;
        if(_to == address(this) || _to == address(0x0))
            return false;

        return true;
    }

    function onApprove (address _owner, address _spender, uint _amount) public returns(bool) {
        _owner; _spender; _amount;
        return true;
    }

}
