pragma solidity ^0.5.0;

import "./external/AddressListLib.sol";
import "./external/CloneFactory.sol";
import "./Interfaces.sol";

contract TimeScheduler is ITimeScheduler {

    using AddressListLib for AddressListLib.AddressList;

    uint public blockInitialized;
    AddressListLib.AddressList tasks;
    mapping (address => uint) scheduledTime;

    function initialize (address baseTask, uint baseTime) public runOnce {
        tasks.add(baseTask);
        scheduledTime[baseTask] = baseTime;
    }

    // Assign 'time' to 'taskA' from 'taskB'
    function assign (uint time, address taskA, address taskB) public onlyOwner {
        tasks.add(taskA);
        require(tasks.contains(taskB));
        require(scheduledTime[taskB] >= time);
        scheduledTime[taskB] -= time;
        scheduledTime[taskA] += time;
    }

    function getTime (address task) public view returns (uint time) {
        return scheduledTime[task];
    }

    function getTasks () public view returns (address[] memory) {
        address[] memory allTasks = new address[](tasks.getLength());
        for(uint i = 0; i < tasks.getLength(); i++) {
            allTasks[i] = tasks.index(i);
        }
    }

    function getSchedule () public view returns (address[] memory, uint[] memory) {
        uint[] memory taskTimes = new uint[](tasks.getLength());
        for(uint i = 0; i < tasks.getLength(); i++) {
            taskTimes[i] = scheduledTime[tasks.index(i)];
        }

        return (getTasks(), taskTimes);
    }

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
