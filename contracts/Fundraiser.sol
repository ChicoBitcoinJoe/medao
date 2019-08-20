pragma solidity ^0.5.0;

import "./external/ERC20Token.sol";
import "./external/MiniMeToken.sol";
import "./external/Owned.sol";
import "./helpers/Initialized.sol";
import "./helpers/SimpleTokenController.sol";

contract Fundraiser is Owned, Initialized, SimpleTokenController {

    ERC20Token public ReserveToken;
    MiniMeToken public RewardToken;

    uint public desiredWage;
    uint public fundingGoal;

    uint public currentWage;
    uint public timestampLastCollected;

    function _Fundraiser (uint _desiredWage) public runOnce {
        desiredWage = _desiredWage;
        currentWage = _desiredWage;
    }

    function collectFunds (uint allotedTime) public onlyOwner returns (uint collectedFunds) {
        uint reserveBalance = ReserveToken.balanceOf(address(this));
        uint workTime = calculateTime(allotedTime);
        collectedFunds = workTime * currentWage * reserveBalance / fundingGoal;
        require(ReserveToken.transfer(owner, collectedFunds));
        timestampLastCollected = now;
        emit Collect_event(collectedFunds);
    }

    function pledgeFunds (uint reserveTokens, uint minPledgeReward) public returns (uint pledgeReward){
        pledgeReward = calculatePledgeReward(reserveTokens);
        require(pledgeReward >= minPledgeReward, 'pledge reward does not meet minimum');
        require(RewardToken.generateTokens(msg.sender, pledgeReward), 'failed to generate tokens');
        emit Pledge_event(msg.sender, reserveTokens, pledgeReward);
    }

    function calculateTime (uint allotedTime) public view returns (uint) {
        uint elapsedSeconds = now - timestampLastCollected;
        return elapsedSeconds * allotedTime / 168;
    }

    function calculatePledgeReward (uint reserveTokens) public view returns (uint pledgeReward) {
        uint reserveBalance = ReserveToken.balanceOf(address(this));
        if(reserveBalance < fundingGoal) {
            // This medao is less than or equal to 100% funded
            uint availableTokens = fundingGoal - reserveBalance;
            if(reserveTokens <= availableTokens) {
                pledgeReward = reserveTokens * 1 ether / currentWage;
            }
            else {
                pledgeReward = availableTokens * 1 ether / currentWage;
                pledgeReward += calculateOverpledgeReward(reserveTokens - availableTokens);
            }
        }
        else {
            pledgeReward = calculateOverpledgeReward(reserveTokens);
        }
    }

    function calculateOverpledgeReward (uint reserveTokens) internal view returns (uint overpledgeReward){
        uint reserveBalance = ReserveToken.balanceOf(address(this));
        overpledgeReward = reserveTokens * 1 ether / (currentWage * reserveBalance / fundingGoal);
    }

    function burnRewardTokens (uint rewardTokens) public {
        require(RewardToken.destroyTokens(msg.sender, rewardTokens));
    }

    event Collect_event (uint collectedAmount);
    event Pledge_event (address indexed msgSender, uint reserveTokens, uint pledgeReward);

}

contract FundraiserFactory {

    function create () public view returns (Fundraiser fundraiser){

    }

}