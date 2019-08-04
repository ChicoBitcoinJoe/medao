pragma solidity ^0.5.0;

import "./external/AddressListLib.sol";
import "./external/Owned.sol";
import "./Interfaces.sol";

contract TimeManager is ITimeManager, Owned {

    using AddressListLib for AddressListLib.AddressList;

    uint public blockInitialized;
    AddressListLib.AddressList tasks;
    mapping (address => uint) scheduledTime;

    function initialize (address baseTask, uint baseTime) public runOnce {
        tasks.add(baseTask);
        scheduledTime[baseTask] = baseTime;
    }

    function register (address task) public onlyOwner {
        tasks.add(task);
    }

    // Assign 'time' to 'taskA' from 'taskB'
    function assign (uint time, address taskA, address taskB) public onlyOwner {
        require(tasks.contains(taskA));
        require(tasks.contains(taskB));
        require(scheduledTime[taskB] >= time);
        scheduledTime[taskB] -= time;
        scheduledTime[taskA] += time;
    }

    function getTime (address task) public view returns (uint time) {
        return scheduledTime[task];
    }

    // Modifiers and Events

    modifier runOnce () {
        require(blockInitialized == 0);
        _;
        blockInitialized = block.number;
    }

}
