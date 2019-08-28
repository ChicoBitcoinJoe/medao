pragma solidity ^0.5.0;

import "./external/BancorFormula.sol";
import "./external/Owned.sol";
import "./external/CloneFactory.sol";
import "./utility/Initialized.sol";
import "./utility/SimpleTokenController.sol";
import "./Interfaces.sol";

contract Fundraiser is IFundraiser, ITimeReleased, Owned, Initialized, SimpleTokenController {

    FundraiserFactory public Factory;
    BancorFormula public Formula;
    uint32 public connectorWeight;
    uint public derivedSupply;
    uint public expirationTimestamp;

    function initialize (
        ITimeManager _Manager,
        BancorFormula _Formula,
        ERC20Token _ReserveToken,
        MiniMeToken _RewardToken,
        uint _derivedSupply,
        uint _maxAllottableTime,
        uint32 _connectorWeight
    ) public runOnce {
        owner = msg.sender;
        Factory = FundraiserFactory(msg.sender);
        Formula = _Formula;
        Manager = _Manager;
        ReserveToken = _ReserveToken;
        RewardToken = _RewardToken;
        connectorWeight = _connectorWeight;
        derivedSupply = _derivedSupply;
        maxAllottableTime = _maxAllottableTime;
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

    function refund (uint rewardAmount) public {
        uint depositRefund = Formula.calculateSaleReturn(
            RewardToken.totalSupply(),
            ReserveToken.balanceOf(address(this)),
            connectorWeight,
            rewardAmount
        );

        ReserveToken.transfer(owner, depositRefund);
        derivedSupply -= rewardAmount;
    }

    function burn (uint rewardAmount) public {
        require(RewardToken.destroyTokens(msg.sender, rewardAmount));
    }

    function collect () public onlyOwner returns (uint reserveAmount) {
        uint allottedTime = Manager.Time().balanceOf(address(this));
        uint elligibleTime = calculateElligibleTime(allottedTime);
        reserveAmount = Formula.calculateSaleReturn(
            derivedSupply,
            ReserveToken.balanceOf(address(this)),
            connectorWeight,
            elligibleTime
        );

        ReserveToken.transfer(owner, reserveAmount);
        timestampLastReleased += reserveAmount;
    }

    function collect (uint reserveAmount) public onlyOwner returns (bool success) {
        uint allottedTime = Manager.Time().balanceOf(address(this));
        uint elligibleTime = calculateElligibleTime(allottedTime);
        uint collectibleReserves = Formula.calculateSaleReturn(
            derivedSupply,
            ReserveToken.balanceOf(address(this)),
            connectorWeight,
            elligibleTime
        );

        if (reserveAmount <= collectibleReserves) {
            ReserveToken.transfer(owner, reserveAmount);
            timestampLastReleased += (elligibleTime * reserveAmount / collectibleReserves);
            success = true;
        }
        else {
            success = false;
        }
    }

    function calculateElligibleTime (uint allottedTime) public view returns (uint) {
        if(allottedTime > maxAllottableTime)
            allottedTime = maxAllottableTime;

        return (now - timestampLastReleased) * 1 ether * allottedTime / 604800;
    }

    function setExpirationDate (uint _expirationTimestamp) public onlyOwner {
        expirationTimestamp = _expirationTimestamp;
    }

}

contract FundraiserFactory is IFundraiserFactory, CloneFactory {

    Fundraiser public blueprint;
    BancorFormula public Formula;
    ERC20Token public ReserveToken;
    MiniMeTokenFactory public TokenFactory;
    uint public defaultAllottableTime = 40 hours * 1 ether;
    uint32 public defaultConnectorWeight = 400000; // == 0.4
    mapping (address => bool) public created;

    constructor (
        Fundraiser _blueprint,
        BancorFormula _Formula,
        ERC20Token _ReserveToken,
        MiniMeTokenFactory _TokenFactory
    ) public {
        blueprint = _blueprint;
        Formula = _Formula;
        ReserveToken = _ReserveToken;
        TokenFactory = _TokenFactory;
    }

    function createFundraiser (
        string memory fundraiserName,
        uint desiredWage
    ) public returns (IFundraiser) {
        MiniMeToken RewardToken = TokenFactory.createCloneToken(
            address(0x0),
            0,
            fundraiserName,
            18,
            'seconds',
            true
        );

        Fundraiser fundraiser = Fundraiser(createClone(address(blueprint)));
        fundraiser.initialize(
            ITimeManager(msg.sender),
            Formula,
            ReserveToken,
            RewardToken,
            desiredWage * 2080 * 1000000 / defaultConnectorWeight,
            defaultAllottableTime,
            defaultConnectorWeight
        );

        require(address(fundraiser) != address(0x0));
        created[address(fundraiser)] = true;
        fundraiser.transferOwnership(msg.sender);
        return fundraiser;
    }

}
