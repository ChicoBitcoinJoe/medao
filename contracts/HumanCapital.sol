pragma solidity ^0.5.0;

import "./external/CloneFactory.sol";
import "./Interfaces.sol";

/**
    The goal of this contract is to allow anyone in the world to invest directly in the value of a person.
    Similar to a crowdfund, many people deposit into a pool of currency. The employee then collects a
    salary over time from the pool. Unlike traditional crowdfunds, funds are secured by a smart contract
    with certain gaurantees. In addition, as an Employee adds utility to their token, investors have the
    potential of making a profit if extra currency is payed the pool or if shares are burned through use.

    1. Investors convert a reserve token into a share token up to a maximum
    2. The reserve token provides a price floor on the value of the person
    3. The owner can withdraw reserve currency over time as compensation for work done
    4. At any point, an investor can convert their share tokens back into an equal portion of the reserve tokens.
    5. The employee can give back to investors by increasing the reserve token backing or decreasing the total supply of shares
    6. Additionally, the employee can create snapshot tokens with an equivalent distribution of their share token.

    Whitepaper: https://docs.google.com/document/d/1A8fjq-fONbSUo_zS8ac7Qs3hqog2Ap78eWHjDGHI5_s/edit#heading=h.m1cmgqsdjew5
**/
contract HumanCapital is Initialized, Owned {

    address public identity;
    ERC20Token public ReserveToken;
    IMeDao public Dao;
    ITimeScheduler public Scheduler;

    mapping (address => bool) public factories;  // This flag allows a factory to schedule a project

    function initialize (
        IMeDao _Dao,
        ITimeScheduler _Scheduler,
        ERC20Token _ReserveToken
    ) public runOnce {
        ReserveToken = _ReserveToken;
        Dao = _Dao;
        Scheduler = _Scheduler;
    }

    function scheduleFundraiser (
        uint expectedWorkTime,
        IFundraiser fundraiser
    ) public onlyAllowedFactories returns (IFundraiser) {
        Scheduler.assign(expectedWorkTime, address(fundraiser), address(Dao));
    }

    function collectPaycheck (IFundraiser[] memory fundraisers) public onlyOwner returns (uint paycheckAmount) {
        for(uint i = 0; i < fundraisers.length; i++) {
            IFundraiser fundraiser = fundraisers[i];
            uint collectedFunds = fundraiser.collectFunds();
            uint scheduledTime = Scheduler.getTime(address(fundraiser));
            if(scheduledTime > 8 hours) {
                scheduledTime = 8 hours;
            }

            uint earnedFunds = collectedFunds * scheduledTime / 8 hours;
            uint refund = collectedFunds - earnedFunds;
            require(ReserveToken.transfer(address(fundraiser), refund));
            paycheckAmount += earnedFunds;
        }

        require(ReserveToken.transfer(owner, paycheckAmount), "failed to transfer paycheck");
    }

    function reschedule (uint time, address taskA, address taskB) public onlyOwner {
        Scheduler.assign(time, taskA, taskB);
    }

    function allowFactory (address factory, bool allowed) public onlyOwner {
        factories[factory] = allowed;
    }

    /*
    function setHash (string memory newHash) public onlyOwner {
        hash = newHash;
        emit NewHash_event(newHash);
    }

    function createCloneToken (
        MiniMeToken cloneableToken,
        string memory tokenName,
        string memory tokenSymbol,
        uint snapshotBlock
    ) public onlyOwner {
        address token = cloneableToken.createCloneToken(
            tokenName,
            18,
            tokenSymbol,
            snapshotBlock,
            true
        );

        clones.push(token);
        emit Clone_event(token);
    }

    function getClones () public view returns (address[] memory) {
        return clones;
    }

    function getTotalClones () public view returns (uint) {
        return clones.length;
    }
    */

    function setIdentity (address newIdentity) public onlyOwner {
        identity = newIdentity;
        emit NewIdentity_event(newIdentity);
    }

    // Modifiers and Events

    modifier onlyAllowedFactories () {
        require(factories[msg.sender]);
        _;
    }

    event NewIdentity_event (address newIdentity);

}

contract HumanCapitalFactory is CloneFactory {

    HumanCapital public blueprint;
    IMeDaoFactory public MedaoFactory;
    ITimeSchedulerFactory public SchedulerFactory;

    function register (
        ERC20Token reserveToken,
        string memory name,
        uint maxTokenSupply,
        uint baseShareValue
    ) public returns (HumanCapital human){
        IMeDao dao = MedaoFactory.create(
            reserveToken,
            name,
            maxTokenSupply,
            baseShareValue
        );

        ITimeScheduler scheduler = SchedulerFactory.create(address(this), 16 hours);
        scheduler.assign(8 hours, address(dao), address(this));
        human = HumanCapital(createClone(address(blueprint)));
        human.initialize(dao, scheduler, reserveToken);
        dao.transferOwnership(address(human));
        scheduler.transferOwnership(address(human));
    }

}
