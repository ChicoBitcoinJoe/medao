pragma solidity ^0.5.0;

import "./external/MiniMeToken.sol";
import "./external/ERC20.sol";
import "./external/Owned.sol";

/**
    The goal of this contract is to allow investing directly in the value of a person.
    1. Investors mint time tokens up to a maximum based on the user's age
    2. Each time token has a reserve backing to ensure a price floor on the value of the person's time
    3. The medao owner can generate a set amount of tokens over time as compensation for work done
**/
contract MeDao is Owned, TokenController {

    address public factory;
    uint public blockInitialized;

    MiniMeToken public timeToken;
    ERC20 public reserveToken;
    int public birthTimestamp;
    uint public maxTokenSupply;
    uint public lastPayTimestamp;

    address public identity;
    string public hash;

    constructor () public {
        blockInitialized = block.number;
    }

    function initialize (
        address _owner,
        MiniMeToken _timeToken,
        ERC20 _reserveToken,
        int _birthTimestamp,
        uint _tokenClaim
    ) public {
        require(blockInitialized == 0, 'contract already initialized');
        require(_birthTimestamp < int(now), 'invalid birth timestamp');

        blockInitialized = block.number;
        factory = msg.sender;

        owner = _owner;
        identity = _owner;
        timeToken = _timeToken;
        reserveToken = _reserveToken;
        birthTimestamp = _birthTimestamp;

        uint elapsedSeconds = uint(int(now) - birthTimestamp);
        maxTokenSupply = calculateWorkTime(elapsedSeconds);
        lastPayTimestamp = now;

        require(timeToken.generateTokens(owner, _tokenClaim), "failed to generate tokens");
    }

    function calculateTokenClaim (uint reserveAmount) public view returns (uint) {
        return timeToken.totalSupply() * reserveAmount / reserveToken.balanceOf(address(this));
    }

    function calculateReserveClaim (uint tokenAmount) public view returns (uint) {
        return reserveToken.balanceOf(address(this)) * tokenAmount / timeToken.totalSupply();
    }

    function calculateWorkTime (uint elapsedSeconds) public pure returns (uint) {
        return (elapsedSeconds * 1 ether) * 40 / 168;
    }

    function pay () public onlyOwner {
        uint elapsedSeconds = now - lastPayTimestamp;
        uint workTime = calculateWorkTime(elapsedSeconds);
        uint fundedTime = workTime * timeToken.totalSupply() / maxTokenSupply;
        maxTokenSupply += workTime;
        lastPayTimestamp = now;
        require(timeToken.generateTokens(owner, fundedTime), "failed to generate tokens");
        emit Pay_event(fundedTime);
    }

    function deposit (uint reserveAmount) public {
        uint availableSeconds = maxTokenSupply - timeToken.totalSupply();
        uint claimedTokens = calculateTokenClaim(reserveAmount);
        require(availableSeconds >= claimedTokens, "invalid reserve amount");
        require(reserveToken.transferFrom(msg.sender, address(this), reserveAmount), "failed to transfer");
        require(timeToken.generateTokens(msg.sender, claimedTokens), "failed to generate tokens");
        emit Deposit_event(msg.sender, reserveAmount, claimedTokens);
    }

    function withdraw (uint tokenAmount) public {
        uint reserveClaim = calculateReserveClaim(tokenAmount);
        require(timeToken.destroyTokens(msg.sender, tokenAmount), "failed to destroy tokens");
        require(reserveToken.transfer(msg.sender, reserveClaim), "failed to transfer");
        emit Withdraw_event(msg.sender, tokenAmount, reserveClaim);
    }

    function burn (uint tokenAmount) public {
        require(timeToken.destroyTokens(msg.sender, tokenAmount), "failed to burn tokens");
        emit Burn_event(msg.sender, tokenAmount);
    }

    function setHash (string memory newHash) public onlyOwner {
        hash = newHash;
        emit NewHash_event(newHash);
    }

    function setIdentity (address newIdentity) public onlyOwner {
        identity = newIdentity;
        emit NewIdentity_event(newIdentity);
    }

    event Pay_event (uint tokenAmount);
    event Deposit_event (address msgSender, uint reserveAmount, uint tokenAmount);
    event Withdraw_event (address msgSender, uint tokenAmount, uint reserveAmount);
    event Burn_event (address msgSender, uint tokenAmount);
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
