pragma solidity ^0.5.0;

import "./external/AddressListLib.sol";
import "./external/Owned.sol";
import "./Interfaces.sol";

contract TimeManager is ITimeManager, Owned {

    // Import the data structure AddressList from the AddressListLib contract
    using AddressListLib for AddressListLib.AddressList;

    struct Task {
        address task;
        uint time;
        uint lockedTimestamp;
        bool isLocked;
    }

    uint public blockInitialized;
    AddressListLib.AddressList tasks;
    mapping (address => Task) schedule;

    function initialize (address baseTask) public runOnce {
        register(baseTask);
        increase(schedule[baseTask], 16 hours);
    }

    function assign (address task, uint time) public onlyOwner {
        assign(task, time, tasks.index(0));
    }

    function assign (address taskA, uint time, address taskB) public onlyOwner {
        // Assign 'time' to 'taskA' from 'taskB'
        require(tasks.contains(taskB));
        register(taskA);

        decrease(schedule[taskB], time);
        increase(schedule[taskA], time);
    }

    function lock (address task) public onlyOwner {
        require(task != tasks.index(0));

        schedule[task].lockedTimestamp = now;
    }

    function unlock (address task) public onlyOwner {
        Task storage scheduled = schedule[task];
        uint elapsedSeconds = now - scheduled.lockedTimestamp;
        require(elapsedSeconds >= 30 days);
        scheduled.lockedTimestamp = 0;
    }

    function register (address task) internal {
        if(tasks.contains(task)) return;

        tasks.add(task);
        schedule[task] = Task(task, 0, 0, false);
    }

    function increase (Task storage task, uint time) internal {
        require(!task.isLocked);
        task.time += time;
    }

    function decrease (Task storage task, uint time) internal {
        require(task.time >= time);
        task.time -= time;
    }

    // Modifiers and Events

    modifier runOnce () {
        require(blockInitialized == 0);
        _;
        blockInitialized = block.number;
    }

}
