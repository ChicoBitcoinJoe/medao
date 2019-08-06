pragma solidity ^0.5.0;

import "./external/AddressListLib.sol";
import "./external/CloneFactory.sol";
import "./Interfaces.sol";

contract TimeScheduler is ITimeScheduler, Owned {

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

    function getSchedule () public view returns (address[] memory, uint[] memory) {
        address[] memory currentTasks = new address[](tasks.getLength());
        uint[] memory currentTimes = new uint[](tasks.getLength());
        for(uint i = 0; i < tasks.getLength(); i++) {
            address task = tasks.index(i);
            currentTasks[i] = task;
            currentTimes[i] = scheduledTime[task];
        }

        return (currentTasks, currentTimes);
    }

    // Modifiers and Events

    modifier runOnce () {
        require(blockInitialized == 0);
        _;
        blockInitialized = block.number;
    }

}

contract TimeSchedulerFactory is CloneFactory {

    TimeScheduler public blueprint;

    function create (
        address baseTask,
        uint baseTime
    ) public returns (TimeScheduler Scheduler) {
        Scheduler = TimeScheduler(createClone(address(blueprint)));
        Scheduler.initialize(baseTask, baseTime);
    }

}
