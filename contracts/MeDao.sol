pragma solidity ^0.5.0;

import "./external/CloneFactory.sol";
import "./MoneyPool.sol";
import "./Interfaces.sol";

contract MeDao is IFundraiser, MoneyPool {

    uint public collectedTimestamp; // The timestamp when a paycheck was last collected

    function initialize (
        ERC20Token _reserveToken,
        MiniMeToken _shareToken,
        uint _maxTokenSupply,
        uint _baseShareValue
    ) public runOnce {
        collectedTimestamp = now;
        _reserveToken;
        _shareToken;
        _maxTokenSupply;
        _baseShareValue;
        /*
        setupMoneyPool (
            _reserveToken,
            _shareToken,
            _maxTokenSupply,
            _baseShareValue
        );
        */
    }

    function calculateWorkTime (uint elapsedSeconds) public pure returns (uint) {
        return elapsedSeconds * 1 ether * 40 / 168;
    }

    function collectFunds () public onlyOwner returns (uint collectedFunds){
        uint elapsedSeconds = now - collectedTimestamp;
        uint workTime = calculateWorkTime(elapsedSeconds);
        collectedFunds = workTime * shareToken.totalSupply() / maxTokenSupply;
        issue(owner, collectedFunds);
        emit Collect_event(collectedFunds);
    }

}

contract MeDaoFactory is CloneFactory {

    MeDao public blueprint;
    MiniMeTokenFactory factory;

    mapping (address => bool) public created;

    function create (
        ERC20Token reserveToken,
        string memory name,
        uint maxTokenSupply,
        uint baseShareValue
    ) public returns (MeDao medao) {
        MiniMeToken shareToken = factory.createCloneToken(
            address(0x0),
            0,
            name,
            18,
            'seconds',
            true
        );

        medao = MeDao(createClone(address(blueprint)));
        medao.initialize(
            reserveToken,
            shareToken,
            maxTokenSupply,
            baseShareValue
        );

        created[address(medao)] = true;
    }

}
