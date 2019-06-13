pragma solidity ^0.5.0;

import "./external/MiniMeToken.sol";
import "./external/ERC20.sol";
import "./external/Owned.sol";

contract MeDao is Owned, TokenController {

    address public factory;
    uint public blockInitialized;

    MiniMeToken public timeToken;
    ERC20 public reserveToken;
    int public birthTimestamp;
    uint public maxTokenSupply;
    uint public lastPayTimestamp;
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
        timeToken = _timeToken;
        reserveToken = _reserveToken;
        birthTimestamp = _birthTimestamp;
        maxTokenSupply = uint(int(now) - birthTimestamp) / 3;
        lastPayTimestamp = now;

        require(timeToken.generateTokens(owner, _tokenClaim), "failed to generate tokens");
    }

    function calculateTokenClaim (uint reserveAmount) public view returns (uint) {
        return timeToken.totalSupply() * reserveAmount / reserveToken.balanceOf(address(this));
    }

    function calculateReserveClaim (uint tokenAmount) public view returns (uint) {
        return reserveToken.balanceOf(address(this)) * tokenAmount / timeToken.totalSupply();
    }

    function pay () public onlyOwner {
        uint elapsedSeconds = (now - lastPayTimestamp) / 3;
        uint fundedTime = elapsedSeconds * timeToken.totalSupply() / (maxTokenSupply * 10^18);
        maxTokenSupply += elapsedSeconds;
        lastPayTimestamp = now;
        require(timeToken.generateTokens(owner, fundedTime), "failed to generate tokens");
        emit Pay_event(fundedTime);
    }

    function invest (uint reserveAmount) public {
        uint availableSeconds = (maxTokenSupply * 10^18) - timeToken.totalSupply();
        uint claimedTokens = calculateTokenClaim(reserveAmount);
        require(availableSeconds >= claimedTokens, "invalid reserve amount");
        require(reserveToken.transferFrom(msg.sender, address(this), reserveAmount), "failed to transfer");
        require(timeToken.generateTokens(msg.sender, claimedTokens), "failed to generate tokens");
        emit Invest_event(msg.sender, reserveAmount, claimedTokens);
    }

    function divest (uint tokenAmount) public {
        uint reserveClaim = calculateReserveClaim(tokenAmount);
        require(timeToken.destroyTokens(msg.sender, tokenAmount), "failed to destroy tokens");
        require(reserveToken.transfer(msg.sender, reserveClaim), "failed to transfer");
        emit Divest_event(msg.sender, tokenAmount, reserveClaim);
    }

    function burn (uint tokenAmount) public {
        require(timeToken.destroyTokens(msg.sender, tokenAmount), "failed to burn tokens");
    }

    function setHash (string memory newHash) public onlyOwner {
        hash = newHash;
        emit Update_event(newHash);
    }

    event Pay_event (uint tokenAmount);
    event Update_event (string newHash);
    event Invest_event (address msgSender, uint reserveAmount, uint tokenAmount);
    event Divest_event (address msgSender, uint tokenAmount, uint reserveAmount);

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
