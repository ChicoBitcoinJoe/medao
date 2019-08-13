pragma solidity ^0.5.0;

import "./external/AddressListLib.sol";
import "./MoneyPool.sol";
import "./Interfaces.sol";

contract Fundraiser is Owned, MoneyPool {

    using AddressListLib for AddressListLib.AddressList;

    uint public startingShareValue;
    uint public totalFundsCollected;
    uint public lastCollectedTimestamp;
    uint public minFundingGoal;
    uint public maxFundingGoal;

    function initialize (
    ) public runOnce {
        yearlySalary = convertTimeToShares(31557600); // 365.25 * 24 * 60 * 60 seconds
    }

    function availableFunds () public view returns (uint shareTokens) {
        uint elapsedSeconds = now - lastCollectedTimestamp;
        shareTokens = convertTimeToShares(elapsedSeconds);
        if(shareToken.totalSupply() < yearlySalary) {
            shareTokens = shareTokens * shareToken.totalSupply() / minFundingGoal;
        }
    }

    function collectFunds (uint shareTokens) public onlyOwner {
        require(availableFunds() >= shareTokens, "invalid amount of share tokens");
        require(issue(owner, shareTokens), "failed to issue share tokens");
        lastCollectedTimestamp = now;
    }

    function convertTimeToShares (uint seconds) internal returns (uint) {
        return seconds * 1 ether * 40 / 168
    }

}
