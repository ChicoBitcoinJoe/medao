pragma solidity ^0.5.0;

import "./external/BancorFormula.sol";
import "./external/CloneFactory.sol";
import "./Interfaces.sol";

contract TimeReleasedFundraiser is ITimeReleasedFundraiser, Initialized, Cloned, SimpleTokenController {

    IBancorFormula public Formula;
    uint32 public connectorWeight;

    ERC20Token public ReserveToken;
    MiniMeToken public RewardToken;
    uint public collectedTimestamp;
    uint public fullyFunded;
    uint public derivedSupply;
    uint public desiredWage;
    uint public maxScheduledTime;

    function initialize (
        IBancorFormula _Formula,
        MiniMeToken _RewardToken,
        uint _desiredWage,
        uint32 _connectorWeight
    ) public runOnce {
        owner = msg.sender;
        factory = msg.sender;

        Formula = _Formula;
        RewardToken = _RewardToken;
        desiredWage = _desiredWage;
        fullyFunded = desiredWage * 2922; // 1 year in hours
        derivedSupply = 2922 * 3600 * 1 ether * 1000000 / connectorWeight;
        connectorWeight = _connectorWeight;
        maxScheduledTime = 8 hours;
    }

    function pledge (uint reserveAmount) public returns (uint rewardAmount){
        uint reserveBalance = ReserveToken.balanceOf(address(this));
        uint remainingReserves = reserveAmount;
        uint spentReserves = 0;
        if (reserveBalance < fullyFunded) {
            uint availableReserves = fullyFunded - reserveBalance;
            if(remainingReserves > availableReserves) {
                spentReserves = availableReserves;
            }
            else {
                spentReserves = remainingReserves;
            }

            remainingReserves -= spentReserves;
            rewardAmount = spentReserves * 3600 * 1 ether / desiredWage;
        }

        if (remainingReserves > 0) {
            uint derivedRewardAmount = Formula.calculatePurchaseReturn(
                derivedSupply,
                reserveBalance + spentReserves,
                connectorWeight,
                remainingReserves
            );

            rewardAmount = derivedRewardAmount;
            derivedSupply += derivedRewardAmount;
        }

        reserveAmount = calculatePledgeCost(rewardAmount);
        require(ReserveToken.transferFrom(msg.sender, address(this), reserveAmount), "failed to transfer reserve amount");
        require(RewardToken.generateTokens(msg.sender, rewardAmount), "failed to generate reward amount");
        emit Pledge_event(msg.sender, reserveAmount, rewardAmount);
    }

    function refund (uint rewardAmount) public returns (uint reserveAmount){
        reserveAmount = calculateRefundAmount(rewardAmount);
        ReserveToken.transfer(owner, reserveAmount);
        derivedSupply -= rewardAmount;
        emit Refund_event(msg.sender, reserveAmount, rewardAmount);
    }

    function burn (uint rewardAmount) public {
        require(RewardToken.destroyTokens(msg.sender, rewardAmount));
        if (RewardToken.totalSupply() < derivedSupply)
            derivedSupply = RewardToken.totalSupply();

        emit Burn_event(msg.sender, rewardAmount);
    }

    function collectFunds (uint scheduledTime) public onlyOwner returns (uint reserveAmount) {
        reserveAmount = calculateElligibleFunds(scheduledTime);
        ReserveToken.transfer(owner, reserveAmount);
        collectedTimestamp += reserveAmount;
    }

    function calculateElligibleTime (uint scheduledTime) public view returns (uint) {
        if(scheduledTime > maxScheduledTime)
            scheduledTime = maxScheduledTime;

        return (now - collectedTimestamp) * 1 ether * scheduledTime / 24 hours;
    }

    function calculatePledgeReward (uint reserveAmount) public view returns (uint rewardAmount) {
        uint reserveBalance = ReserveToken.balanceOf(address(this));
        uint remainingReserves = reserveAmount;
        uint spentReserves = 0;
        if (reserveBalance < fullyFunded) {
            uint availableReserves = fullyFunded - reserveBalance;
            if(remainingReserves > availableReserves) {
                spentReserves = availableReserves;
            }
            else {
                spentReserves = remainingReserves;
            }

            remainingReserves -= spentReserves;
            rewardAmount = spentReserves * 3600 * 1 ether / desiredWage;
        }

        if (remainingReserves > 0) {
            uint derivedRewardAmount = Formula.calculatePurchaseReturn(
                derivedSupply,
                reserveBalance + spentReserves,
                connectorWeight,
                remainingReserves
            );

            rewardAmount += derivedRewardAmount;
        }
    }

    function calculateRefundAmount (uint rewardAmount) public view returns (uint reserveAmount) {
        if (active()) {
            reserveAmount = rewardAmount * ReserveToken.balanceOf(address(this)) / RewardToken.totalSupply();
        }
        else {
            reserveAmount = Formula.calculateSaleReturn(
                derivedSupply,
                ReserveToken.balanceOf(address(this)),
                connectorWeight,
                rewardAmount
            );
        }
    }

    function calculatePledgeCost (uint rewardAmount) public view returns (uint reserveAmount) {
        uint reserveBalance = ReserveToken.balanceOf(address(this));
        uint remainingReward = rewardAmount;
        if (reserveBalance >= fullyFunded) {
            uint excessReward = reserveBalance - fullyFunded;
            uint rewardTokens = rewardAmount;
            if (excessReward <= rewardAmount)
                rewardTokens = excessReward;

            remainingReward -= rewardTokens;
            reserveAmount = Formula.calculateSaleReturn(
                derivedSupply,
                reserveBalance,
                connectorWeight,
                rewardTokens
            );
        }

        if (remainingReward > 0) {
            reserveAmount += remainingReward * desiredWage / (3600 * 1 ether);
        }
    }

    function calculateElligibleFunds (uint scheduledTime) public view returns (uint) {
        uint elligibleTime = calculateElligibleTime(scheduledTime);
        return Formula.calculateSaleReturn(
            derivedSupply,
            ReserveToken.balanceOf(address(this)),
            connectorWeight,
            elligibleTime
        );
    }

    function active () public view returns (bool) {
        return (now - 90 days) < collectedTimestamp;
    }

    event Pledge_event(address indexed msgSender, uint reserveAmount, uint rewardAmount);
    event Refund_event(address indexed msgSender, uint rewardAmount, uint reserveAmount);
    event Burn_event(address indexed msgSender, uint rewardAmount);
    event Collect_event(uint reserveAmount);

}

contract TimeReleasedFundraiserFactory is ITimeReleasedFundraiserFactory, CloneFactory {

    TimeReleasedFundraiser public blueprint;
    ERC20Token public ReserveToken;
    MiniMeTokenFactory public TokenFactory;
    BancorFormula public Formula;

    uint32 public connectorWeight = 500000;
    mapping (address => bool) public created;

    constructor (
        TimeReleasedFundraiser _blueprint,
        ERC20Token _ReserveToken,
        MiniMeTokenFactory _TokenFactory,
        BancorFormula _Formula
    ) public {
        blueprint = _blueprint;
        ReserveToken = _ReserveToken;
        TokenFactory = _TokenFactory;
        Formula = _Formula;
    }

    function startFundraiser (
        string memory fundraiserName,
        uint desiredWage
    ) public returns (ITimeReleasedFundraiser) {
        MiniMeToken RewardToken = TokenFactory.createCloneToken(
            address(0x0),
            0,
            fundraiserName,
            18,
            'seconds',
            true
        );

        TimeReleasedFundraiser fundraiser = TimeReleasedFundraiser(createClone(address(blueprint)));
        fundraiser.initialize(
            Formula,
            RewardToken,
            desiredWage,
            connectorWeight
        );

        created[address(fundraiser)] = true;
        fundraiser.transferOwnership(msg.sender);
        RewardToken.changeController(address(fundraiser));
        return fundraiser;
    }
}
