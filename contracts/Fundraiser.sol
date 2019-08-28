pragma solidity ^0.5.0;

import "./external/BancorFormula.sol";
import "./external/MiniMeToken.sol";
import "./external/ERC20Token.sol";
import "./external/Owned.sol";
import "./utility/Initialized.sol";
import "./utility/SimpleTokenController.sol";
import ".//Interfaces.sol";


contract IFundraiserFactory {
    function create (uint wage) public returns (IFundraiser);
}

contract ITimeReleased {
    ITimeManager public Manager;
    uint public timestampLastReleased;
    function calculateElligibleTime () public view returns (uint);
}

contract IFundraiser is ITimeReleased {
    ERC20Token public ReserveToken;
    MiniMeToken public RewardToken;
    function pledge (uint reserveAmount, uint minRewardAmount) public;
    function unpledge (uint rewardAmount) public;
    function collect () public returns (uint reserveAmount);
}

contract Fundraiser is IFundraiser, Owned, Initialized, SimpleTokenController {

    BancorFormula public Formula;
    uint32 public connectorWeight;
    uint public derivedSupply;
    uint public maxAllottableTime;

    function initialize (
        BancorFormula _Formula,
        ITimeManager _Manager,
        uint _derivedSupply
    ) public runOnce {
        Formula = _Formula;
        Manager = _Manager;
        connectorWeight = 400000; // CW = 0.4
        maxAllottableTime = 40 hours;
        derivedSupply = _derivedSupply;
    }

    function pledge (uint reserveAmount, uint minRewardAmount) public {
        uint rewardAmount = Formula.calculatePurchaseReturn(
            derivedSupply,
            ReserveToken.balanceOf(address(this)),
            connectorWeight,
            reserveAmount
        );
        require(rewardAmount >= minRewardAmount);
        require(ReserveToken.transferFrom(msg.sender, address(this), reserveAmount));
        derivedSupply += rewardAmount;
    }

    function unpledge (uint rewardAmount) public {
        uint depositRefund = Formula.calculateSaleReturn(
            RewardToken.totalSupply(),
            ReserveToken.balanceOf(address(this)),
            connectorWeight,
            rewardAmount
        );

        /* ... */
        ReserveToken.transfer(owner, depositRefund);
        derivedSupply -= rewardAmount;
    }

    function collect (uint workedTime) public onlyOwner returns (uint reserveAmount) {
        uint allottedTime = Manager.Time().balanceOf(address(this));
        uint elligibleTime = calculateElligibleTime(allottedTime);
        require(workedTime <= elligibleTime);
        reserveAmount = Formula.calculateSaleReturn(
            derivedSupply,
            ReserveToken.balanceOf(address(this)),
            connectorWeight,
            workedTime
        );

        ReserveToken.transfer(owner, reserveAmount);
        timestampLastReleased = timestampLastReleased + workedTime * 604800 / allottedTime;
    }

    function calculateElligibleTime (uint allottedTime) public view returns (uint) {
        if(allottedTime > maxAllottableTime)
            allottedTime = maxAllottableTime;

        return (now - timestampLastReleased) * 1 ether * allottedTime / 604800;
    }

}

/*
contract Fundraiser is Owned, Initialized, SimpleTokenController {

    address public Factory;

    ERC20Token public ReserveToken;
    MiniMeToken public RewardToken;
    MiniMeToken public Time;

    uint public desiredWage;
    uint public fundingGoal;
    uint public currentWage;
    uint public timestampLastReleased;

    function initialize (
        ERC20Token _ReserveToken,
        MiniMeToken _RewardToken,
        MiniMeToken _Time,
        uint _desiredWage
    ) public runOnce {
        owner = msg.sender;
        ReserveToken = _ReserveToken;
        RewardToken = _RewardToken;
        Time = _Time;
        desiredWage = _desiredWage;
        currentWage = _desiredWage;
    }

    function collectFunds () public onlyOwner returns (uint collectedFunds) {
        uint reserveBalance = ReserveToken.balanceOf(address(this));
        uint workTime = calculateTime(Time.balanceOf(address(this)));
        collectedFunds = workTime * currentWage * reserveBalance / fundingGoal;
        require(ReserveToken.transfer(owner, collectedFunds));
        timestampLastReleased = now;
        emit Collect_event(collectedFunds);
    }

    function pledgeFunds (uint reserveTokens, uint minPledgeReward) public returns (uint pledgeReward){
        pledgeReward = calculatePledgeReward(reserveTokens);
        require(pledgeReward >= minPledgeReward, 'pledge reward does not meet minimum');
        require(RewardToken.generateTokens(msg.sender, pledgeReward), 'failed to generate tokens');
        emit Pledge_event(msg.sender, reserveTokens, pledgeReward);
    }

    function calculateTime (uint allotedTime) public view returns (uint) {
        uint elapsedSeconds = now - timestampLastReleased;
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
*/
