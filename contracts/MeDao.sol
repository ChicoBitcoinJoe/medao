pragma solidity ^0.5.0;

import "./external/MiniMeToken.sol";
import "./external/ERC20.sol";
import "./external/Owned.sol";

contract MeDao is Owned {

    uint public blockInitialized;

    uint public lastPaycheck;
    uint public maxTokenSupply;
    MiniMeToken public token;
    ERC20 public reserve;

    constructor () public {
        blockInitialized = block.number;
    }

    function initialize (
        MiniMeToken _token,
        ERC20 _reserve,
        uint _maxTokenSupply,
        uint _tokenClaim
    ) public {
        blockInitialized = block.number;

        lastPaycheck = now;
        maxTokenSupply = _maxTokenSupply;
        token = _token;
        reserve = _reserve;

        token.generateTokens(owner, _tokenClaim);
    }

    function collectPaycheck () public {
        uint elapsedSeconds = (now - lastPaycheck) / 3;
        maxTokenSupply += elapsedSeconds;
        lastPaycheck = now;
        require(token.generateTokens(owner, elapsedSeconds));
    }

    function calculateTokenClaim (uint reserveAmount) public view returns (uint) {
        return token.totalSupply() * reserveAmount / reserve.balanceOf(address(this));
    }

    function calculateReserveClaim (uint tokenAmount) public view returns (uint) {
        return reserve.balanceOf(address(this)) * tokenAmount / token.totalSupply();
    }

    function invest (uint reserveAmount) public {
        uint availableSeconds = maxTokenSupply - token.totalSupply();
        uint claimedSeconds = calculateTokenClaim(reserveAmount);
        require(availableSeconds >= claimedSeconds);
        require(reserve.transferFrom(msg.sender, address(this), reserveAmount));
        require(token.generateTokens(msg.sender, claimedSeconds));
    }

    function divest (uint tokenAmount) public {
        uint reserveClaim = calculateReserveClaim(tokenAmount);
        require(token.destroyTokens(msg.sender, tokenAmount));
        require(reserve.transfer(msg.sender, reserveClaim));
    }

}
