pragma solidity ^0.5.0;

import "./external/ERC20Token.sol";
import "./external/MiniMeToken.sol";


contract ITimeManager {
    MiniMeToken public Time;
    function assign (uint time, address toTask, address fromTask) public;
}

contract ITimeReleased {
    ITimeManager public Manager;
    uint public timestampLastReleased;
    uint public maxAllottableTime;
    function calculateElligibleTime (uint allottedTime) public view returns (uint);
}

contract IFundraiser {
    ERC20Token public ReserveToken;
    MiniMeToken public RewardToken;
    function pledge (uint reserveAmount, uint minRewardAmount) public;
    function refund (uint rewardAmount) public;
    function collect () public returns (uint reserveAmount);
    function collect (uint reserveAmount) public returns (bool);
}

contract IFundraiserFactory {
    mapping (address => bool) public created;
    function createFundraiser (string memory name, uint desiredWage) public returns (IFundraiser);
}
