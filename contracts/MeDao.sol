pragma solidity ^0.5.0;

import "./external/ListLib.sol";
import "./helpers/Initialized.sol";
import "./Fundraiser.sol";

contract MeDao is Owned, Initialized {

    using ListLib for ListLib.AddressList;

    FundraiserFactory public Factory;
    ListLib.AddressList fundraisers;
    MiniMeToken public Time;
    Fundraiser public freeTime;

    uint public minimumWage;

    function _MeDao (
        MiniMeToken _Time,
        Fundraiser _freeTime
    ) public runOnce {
        Time = _Time;
        freeTime = _freeTime;
        Time.generateTokens(address(freeTime), convertHoursToTime(60));
    }

    function startFundraiser (uint allotedTime) public onlyOwner returns (Fundraiser fundraiser) {
        fundraiser = Factory.create();
        fundraisers.add(address(fundraiser));
        require(Time.transferFrom(address(freeTime), address(fundraiser), allotedTime));
        emit Fundraiser_event(fundraiser);
    }

    function reschedule (uint time, Fundraiser from, Fundraiser to) public onlyOwner {
        from.collectFunds(Time.balanceOf(address(from)));
        to.collectFunds(Time.balanceOf(address(to)));
        require(Time.transferFrom(address(from), address(to), time));
    }

    function setMinimumWage (uint _minimumWage) public onlyOwner {
        minimumWage = _minimumWage;
    }

    function convertHoursToTime (uint _hours) internal pure returns (uint time) {
        return _hours * 60 * 60 * 10^18;
    }

/*
    function getFundraisers () public view returns (address[] memory) {
        address[] memory allTasks = new address[](fundraisers.getLength());
        for(uint i = 0; i < fundraisers.getLength(); i++) {
            allTasks[i] = fundraisers.index(i);
        }
    }

    function getTimeSchedule () public view returns (address[] memory, uint[] memory) {
        uint[] memory times = new uint[](fundraisers.getLength());
        for(uint i = 0; i < fundraisers.getLength(); i++) {
            times[i] = Fundraiser(fundraisers.index(i)).time();
        }

        return (getFundraisers(), times);
    }
*/

    event Fundraiser_event (Fundraiser fundraiser);

}
