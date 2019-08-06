pragma solidity ^0.5.0;

import "./external/CloneFactory.sol";
import "./Interfaces.sol";

contract MoneyPool is Initialized, Owned, SimpleTokenController {

    ERC20Token public reserveToken; // A reserve token to hold the value of a person
    MiniMeToken public shareToken;  // A cloneable token that represents a person
    uint public maxTokenSupply;     // The maximum amount of shares that can be created
    uint public baseShareValue;     // Sets a base value for each sold token at
    bool public useBaseValue;       // Determines which formula is used when depositing

    function setupMoneyPool (
        ERC20Token _reserveToken,
        MiniMeToken _shareToken,
        uint _maxTokenSupply,
        uint _baseShareValue,
        bool _useBaseValue
    ) public runOnce {
        reserveToken = _reserveToken;
        shareToken = _shareToken;
        maxTokenSupply = _maxTokenSupply;
        baseShareValue = _baseShareValue;
        useBaseValue = _useBaseValue;
    }

    function calculateShareClaim (uint reserveAmount) public view returns (uint) {
        if(useBaseValue || reserveToken.balanceOf(address(this)) == 0) {
            return reserveAmount * 1 ether / baseShareValue;
        }
        else {
            return shareToken.totalSupply() * reserveAmount / reserveToken.balanceOf(address(this));
        }
    }

    function calculateReserveClaim (uint shareAmount) public view returns (uint) {
        return reserveToken.balanceOf(address(this)) * shareAmount / shareToken.totalSupply();
    }

    function deposit (uint reserveAmount) public returns (uint shareClaim) {
        uint availableTokens = maxTokenSupply - shareToken.totalSupply();
        shareClaim = calculateShareClaim(reserveAmount);
        require(availableTokens >= shareClaim, "invalid reserve amount");
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

    function transfer (address account, uint reserveAmount) internal {
        require(reserveToken.transfer(account, reserveAmount));
        emit Transfer_event(account, reserveAmount);
    }

    function issue (address account, uint shareAmount) internal {
        require(shareToken.generateTokens(account, shareAmount));
        maxTokenSupply += shareAmount;
        emit Issue_event(account, shareAmount);
    }

    function destroy (address account, uint shareAmount) internal {
        require(shareToken.destroyTokens(account, shareAmount));
        maxTokenSupply -= shareAmount;
        emit Destroy_event(account, shareAmount);
    }

    function collect () public returns (uint collectedAmount);

    event Collect_event (uint collectedAmount);
    event Deposit_event (address msgSender, uint reserveAmount, uint shareClaim);
    event Withdraw_event (address msgSender, uint shareAmount, uint reserveClaim);
    event Transfer_event (address account, uint reserveAmount);
    event Issue_event (address account, uint shareAmount);
    event Destroy_event (address account, uint shareAmount);

}
