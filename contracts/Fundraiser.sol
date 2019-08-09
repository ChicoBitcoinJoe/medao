pragma solidity ^0.5.0;

import "./external/AddressListLib.sol";
import "./external/CloneFactory.sol";
import "./MoneyPool.sol";
import "./Interfaces.sol";

contract Fundraiser is Owned, MoneyPool, CloneFactory {

    using AddressListLib for AddressListLib.AddressList;

    Pledge public blueprint;
    AddressListLib.AddressList pledges;
    mapping (address => AddressListLib.AddressList) pledgesFor;

    uint public baseShareValue;
    uint public totalFundsCollected;
    uint public lastCollectedTimestamp;

    function availableFunds () public view returns (uint) {
        uint elapsedSeconds = now - lastCollectedTimestamp;
        return elapsedSeconds * 1 ether * 40 / 168;
    }

    function collectFunds (uint reserveTokens) public onlyOwner {
        require(availableFunds() >= reserveTokens, "invalid amount of reserve tokens");
        require(transfer(owner, reserveTokens), "failed to transfer reserve tokens");
        totalFundsCollected += reserveTokens;
        lastCollectedTimestamp = now;
    }

    function createPledge (uint reserveTokens) public returns (Pledge pledge) {
        require(reserveToken.transferFrom(msg.sender, address(this), reserveTokens), "failed to transfer reserve tokens");
        uint shareClaim = calculateShareClaim(reserveTokens);
        require(issue(msg.sender, shareClaim), "failed to issue share tokens");
        pledge = Pledge(createClone(address(blueprint)));
        pledge.initialize(reserveTokens, shareClaim);
        require(pledges.add(address(pledge)), "failed to add pledge to pledge list");
        require(pledgesFor[msg.sender].add(address(pledge)), "failed to add pledge to account list");
    }

    function totalPledgesCreated () public view returns (uint) {
        return pledges.getLength();
    }

    function getPledgesFor (address account) public view returns (address[] memory) {
        return pledgesFor[account].get();
    }

}

contract Pledge is Initialized, Owned {

    uint constant ONE_YEAR = 11486966400; // 365.25 days
    Fundraiser public fundraiser;
    uint public claimedShareTokens;
    uint public pledgedReserveTokens;

    function initialize (uint _pledgedReserveTokens, uint _claimedShareTokens) public runOnce {
        fundraiser = Fundraiser(msg.sender);
        pledgedReserveTokens = _pledgedReserveTokens;
        claimedShareTokens = _claimedShareTokens;
    }

    function pledgeReserveTokens (uint reserveTokens) public returns (uint shareClaim) {


        /*
        require(reserveToken.transferFrom(msg.sender, address(this), reserveTokens), "failed to transfer reserve tokens");
        require(reserveToken.approve(address(fundraiser), reserveTokens), "failed to approve transfer of reserve tokens");
        shareClaim = fundraiser.deposit(reserveTokens);
        claimedShareTokens += shareClaim;
        require(fundraiser.shareToken().transfer(owner, shareClaim));
        */
    }

    function reclaimReserveTokens (uint shareTokens) public returns (uint reserveClaim){

    }

    event Deposit_event (address msgSender, uint reserveTokens, uint shareClaim);
    event Withdraw_event (address msgSender, uint shareTokens, uint reserveClaim);

}
