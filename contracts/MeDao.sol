pragma solidity ^0.5.0;

import "./external/MiniMeToken.sol";
import "./external/ERC20.sol";
import "./external/Owned.sol";

contract MeDao is Owned {

    uint public blockInitialized;
    address public factory;

    MiniMeToken public timeToken;
    ERC20 public reserveToken;
    uint public birthTimestamp;
    uint public maxTokenSupply;
    uint public lastPaycheck;

    constructor () public {
        blockInitialized = block.number;
    }

    function initialize (
        MiniMeToken _timeToken,
        ERC20 _reserveToken,
        uint _birthTimestamp
    ) public {
        require(blockInitialized == 0, 'contract already initialized');

        blockInitialized = block.number;
        factory = msg.sender;

        timeToken = _timeToken;
        reserveToken = _reserveToken;
        birthTimestamp = _birthTimestamp;
        maxTokenSupply = (now - birthTimestamp) / 3;
        lastPaycheck = now;
    }

    function collectPaycheck () public {
        uint elapsedSeconds = (now - lastPaycheck) / 3;
        maxTokenSupply += elapsedSeconds;
        lastPaycheck = now;
        require(timeToken.generateTokens(owner, elapsedSeconds));
    }

    function calculateTokenClaim (uint reserveAmount) public view returns (uint) {
        return timeToken.totalSupply() * reserveAmount / reserveToken.balanceOf(address(this));
    }

    function calculateReserveClaim (uint tokenAmount) public view returns (uint) {
        return reserveToken.balanceOf(address(this)) * tokenAmount / timeToken.totalSupply();
    }

    function invest (uint reserveAmount) public {
        uint availableSeconds = maxTokenSupply - timeToken.totalSupply();
        uint claimedSeconds = calculateTokenClaim(reserveAmount);
        require(availableSeconds >= claimedSeconds);
        require(reserveToken.transferFrom(msg.sender, address(this), reserveAmount));
        require(timeToken.generateTokens(msg.sender, claimedSeconds));
    }

    function divest (uint tokenAmount) public {
        uint reserveClaim = calculateReserveClaim(tokenAmount);
        require(timeToken.destroyTokens(msg.sender, tokenAmount));
        require(reserveToken.transfer(msg.sender, reserveClaim));
    }

}
