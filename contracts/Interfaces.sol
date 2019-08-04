pragma solidity ^0.5.0;

import "./external/ERC20Token.sol";
import "./external/MiniMeToken.sol";

contract ITimeManager {
    function register (address task) public;
    function assign (uint time, address taskA, address taskB) public;
    function getTime (address task) public view returns (uint time);
}

contract IFundraiser {
    ERC20Token public reserveToken;
    MiniMeToken public shareToken;
    function collect () public returns (uint collectedFunds);
    function calculateAvailableFunds () public view returns (uint);
}

contract IFundraiserFactory {
    function create (
        string memory name,
        uint fundraiserGoal,
        uint fundraiserDuration
    ) public returns (IFundraiser);
}

contract IPerson {
    IFundraiser public MeDao;       // The dao financially supporting this person
    ITimeManager public Schedule;   // Manages alloted time for projects
    address public identity;        // The account associated with this person
}
