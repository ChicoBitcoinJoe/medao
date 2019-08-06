pragma solidity ^0.5.0;

import "./external/ERC20Token.sol";
import "./external/Owned.sol";
import "./helpers/Initialized.sol";
import "./helpers/SimpleTokenController.sol";

contract ITimeScheduler {
    function register (address task) public;
    function assign (uint time, address taskA, address taskB) public;
    function getTime (address task) public view returns (uint time);
}

contract IFundraiser {
    function collectFunds () public returns (uint collectedFunds);
}

contract IMeDao is IFundraiser {
    uint public burnedTokenSupply;  // The maximum amount of shares that can be created
}

contract IFundraiserFactory {
    function create (
        string memory name,
        uint fundraiserGoal,
        uint fundraiserDuration
    ) public returns (IFundraiser);
}

contract IIdentity {
    IFundraiser public Dao;         // The dao financially supporting this person
    ITimeScheduler public Schedule; // Manages alloted time for projects
    address public identity;        // The account associated with this person
}
