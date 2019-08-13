pragma solidity ^0.5.0;

import "./external/CloneFactory.sol";
import "./Interfaces.sol";

contract MoneyPool is Initialized, IMoneyPool {

    ERC20Token public reserveToken; // A reserve token to hold the value of a person
    MiniMeToken public shareToken;  // A cloneable token that represents a person
    uint public baseShareValue;     // Sets a base value for each token

    function setupMoneyPool (
        ERC20Token _reserveToken,
        MiniMeToken _shareToken,
        uint _maxTokenSupply,
        uint _baseShareValue
    ) public runOnce {
        reserveToken = _reserveToken;
        shareToken = _shareToken;
        maxTokenSupply = _maxTokenSupply;
        baseShareValue = _baseShareValue;
    }

    function calculateShareClaim (uint reserveTokens) public view returns (uint) {
        return reserveTokens * 1 ether / reserveToken.totalSupply();
    }

    function calculateReserveClaim (uint shareTokens) public view returns (uint) {
        return reserveToken.balanceOf(address(this)) * shareTokens / shareToken.totalSupply();
    }

    function deposit (uint reserveTokens) public returns (uint shareClaim) {
        //uint availableTokens = maxTokenSupply - shareToken.totalSupply();
        //shareClaim = calculateShareClaim(reserveTokens);
        //require(availableTokens >= shareClaim, "invalid reserve amount");
        //require(reserveToken.transferFrom(msg.sender, address(this), reserveTokens), "failed to transfer");
        //require(shareToken.generateTokens(msg.sender, shareClaim), "failed to generate tokens");
        //emit Deposit_event(msg.sender, reserveTokens, shareClaim);
    }

    function withdraw (uint shareTokens) public returns (uint reserveClaim) {
        reserveClaim = calculateReserveClaim(shareTokens);
        destroy(msg.sender, shareTokens);
        transfer(msg.sender, reserveClaim);
        emit Withdraw_event(msg.sender, shareTokens, reserveClaim);
    }

    function transfer (address account, uint reserveTokens) internal returns (bool) {
        require(reserveToken.transfer(account, reserveTokens), "failed to transfer");
        emit Transfer_event(account, reserveTokens);
        return true;
    }

    function issue (address account, uint shareTokens) internal returns (bool) {
        require(maxTokenSupply >= shareToken.totalSupply() + shareTokens, "invalid share amount");
        require(shareToken.generateTokens(account, shareTokens), "failed to generate tokens");
        maxTokenSupply += shareTokens;
        emit Issue_event(account, shareTokens);
        return true;
    }

    function destroy (address account, uint shareTokens) internal returns (bool) {
        require(shareToken.destroyTokens(account, shareTokens), "failed to destroy tokens");
        maxTokenSupply -= shareTokens;
        emit Destroy_event(account, shareTokens);
        return true;
    }

    event Collect_event (uint collectedAmount);
    event Deposit_event (address msgSender, uint reserveTokens, uint shareClaim);
    event Withdraw_event (address msgSender, uint shareTokens, uint reserveClaim);
    event Transfer_event (address account, uint reserveTokens);
    event Issue_event (address account, uint shareTokens);
    event Destroy_event (address account, uint shareTokens);

}

contract TimeRegulatedFundraiser is IFundraiser, MoneyPool {

    uint public collectedTimestamp; // The timestamp when funds were last collected
    uint public startTimestamp;
    uint public endTimestamp;
    uint public maxTokenSupply;
    uint public fundedTokenSupply;

    function setupFundraiser (
        uint _startTimestamp,    // 0 == now
        uint _endTimestamp,      // 0 == infinite
        uint _maxTokenSupply,    // 0 == infinite
        uint _fundedTokenSupply
    ) public onlyOwner {
        startTimestamp = _startTimestamp;
        endTimestamp = _endTimestamp;
        maxTokenSupply = _maxTokenSupply;
        fundedTokenSupply = _fundedTokenSupply;
    }

    function collectFunds () public returns (uint collectedFunds) {
        require(now >= startTimestamp);
        require(now < endTimestamp);

        //collectedFunds = availableFunds();
        transfer(owner, collectedFunds);
    }

    function getAvailableFunds () public view returns (uint availableFunds) {
        availableFunds = getFundedTime();
    }

    function getFundedTime () public view returns (uint) {
        uint elapsedSeconds = now - collectedTimestamp;
        uint workTime = elapsedSeconds * 1 ether * 40 / 168; // 40 hours per week
        (uint p, uint q) = getFundedPercent();
        if(p > q) {
            return workTime;
        }
        else {
            return workTime * p / q;
        }
    }

    function getFundedPercent () public view returns (uint p, uint q) {
        //return (shareToken.totalSupply(), maxTokenSupply);
        return (shareToken.totalSupply(), fundedTokenSupply);
    }

}
