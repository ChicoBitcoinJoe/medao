pragma solidity ^0.5.0;

import "./external/MiniMeToken.sol";
import "./external/ERC20.sol";
import "./external/Owned.sol";

contract MeDao is Owned {

    uint public blockInitialized;
    address public factory;

    MiniMeToken public timeToken;
    ERC20 public reserveToken;
    int public birthTimestamp;
    uint public maxTokenSupply;
    uint public lastPayTimestamp;

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

    function collectPay () public onlyOwner {
        uint elapsedSeconds = (now - lastPayTimestamp) / 3;
        uint fundedTime = elapsedSeconds * timeToken.totalSupply() / maxTokenSupply;
        maxTokenSupply += elapsedSeconds;
        lastPayTimestamp = now;
        require(timeToken.generateTokens(owner, fundedTime), "failed to generate tokens");
        emit Pay_eventAAAA(owner, fundedTime);
    }

    function invest (uint reserveAmount) public {
        uint availableSeconds = maxTokenSupply - timeToken.totalSupply();
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

    event Pay_eventAAAA (address owner, uint tokenAmount);
    event Invest_event (address msgSender, uint reserveAmount, uint tokenAmount);
    event Divest_event (address msgSender, uint tokenAmount, uint reserveAmount);
}
