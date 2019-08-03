pragma solidity ^0.5.0;

import "./external/MiniMeToken.sol";
import "./external/ERC20.sol";
import "./external/Owned.sol";
import "./external/CloneFactory.sol";

import "./Fundraiser.sol";

contract TimeManager is Owned {

    struct TimeAllotment {
        uint startTimestamp;
        uint workTime;
        Fundraiser fundraiser;
    }

    ERC20 public Dai;
    FundraiserFactory public Fundraisers;

    uint public freeTime;
    TimeAllotment[] public allotments;

    constructor () public  {
        freeTime = 24 hours;
    }

    function startFundraiser (
        string memory name,
        uint startTimestamp,
        uint fundraiserGoal,
        uint fundraiserDuration,
        uint seedFunds,
        uint expectedWorkTime
    ) public onlyOwner returns (Fundraiser fundraiser) {
        fundraiser = Fundraisers.create(
            name,
            startTimestamp,
            fundraiserGoal,
            fundraiserDuration
        );

        require(Dai.transferFrom(msg.sender, address(this), seedFunds));
        require(Dai.approve(address(fundraiser), seedFunds));
        uint initialShares = fundraiser.deposit(seedFunds);
        fundraiser.shareToken().transfer(owner, seedFunds);

        allotments.push(TimeAllotment(startTimestamp, expectedWorkTime, fundraiser));
    }

    function getTimeAllotment (uint index) public view returns (uint, uint, Fundraiser) {
        TimeAllotment memory allotment = allotments[index];
        return (allotment.startTimestamp, allotment.workTime, allotment.fundraiser);
    }

}
