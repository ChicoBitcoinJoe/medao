pragma solidity ^0.5.0;

import "./external/MiniMeToken.sol";

contract ITimeManager {
    MiniMeToken public Time;
    function assign (uint time, address toTask, address fromTask) public;
}
