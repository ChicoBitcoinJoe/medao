pragma solidity ^0.5.0;

import "./external/ListLib.sol";
import "./helpers/Initialized.sol";
import "./Fundraiser.sol";

contract MeDao is Owned, Initialized {

    using ListLib for ListLib.AddressList;

    FundraiserFactory public Factory;
    ListLib.AddressList Fundraisers;
    ERC20Token public ReserveToken;
    MiniMeToken public Time;
    uint public minimumWage;

    function _MeDao (
        FundraiserFactory _Factory,
        ERC20Token _ReserveToken,
        MiniMeToken _Time
        Fundraiser _FreeTime,
    ) public runOnce {
        owner = msg.sender;
        Factory = _Factory;
        ReserveToken = _ReserveToken;
        Time = _Time;
        Fundraisers.add(address(_FreeTime));
        require(Time.generateTokens(address(_FreeTime), convertHoursToTime(40)));
    }

    function startFundraiser (uint allotedTime) public onlyOwner returns (Fundraiser fundraiser) {
        fundraiser = Factory.create(minimumWage);
        Fundraisers.add(address(fundraiser));
        require(Time.transferFrom(address(freeTime), address(fundraiser), allotedTime));
        emit Fundraiser_event(fundraiser);
    }

    function collectFunds (Fundraiser fundraiser) public onlyOwner returns (uint collectedFunds) {
        collectedFunds = fundraiser.collectFunds();
    }

    function collectFrom (Fundraiser[] memory fundraisers) public onlyOwner returns (uint collectedFunds) {
        for(uint i = 0; i < fundraisers.length; i++) {
            collectedFunds += collectFunds(fundraisers[i]);
        }

        ReserveToken.transfer(owner, collectedFunds);
    }

    function reschedule (uint time, Fundraiser from, Fundraiser to) public onlyOwner {
        collectFunds(from)
        colelctFunds(to);
        require(Time.transferFrom(address(from), address(to), time));
    }

    function setMinimumWage (uint _minimumWage) public onlyOwner {
        minimumWage = _minimumWage;
    }

    function convertHoursToTime (uint _hours) internal pure returns (uint time) {
        return _hours * 60 * 60 * 10^18;
    }

    function getFundraiserList () public view returns (address[] memory list) {
        list = new address[](Fundraisers.getLength());
        for(uint i = 0; i < Fundraisers.getLength(); i++) {
            list[i] = Fundraisers.index(i);
        }
    }

    function getFundraiserAt (uint index) public view returns (addres) {
        return fundraisers.index(i);
    }

    event Fundraiser_event (Fundraiser fundraiser);

}
