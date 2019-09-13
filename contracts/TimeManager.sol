pragma solidity ^0.5.0;

import "./external/ListLib.sol";
import "./external/Owned.sol";
import "./utility/SimpleTokenController.sol";
import "./Interfaces.sol";

contract TimeManager is ITimeManager, Owned, SimpleTokenController {

    using ListLib for ListLib.AddressList;

    MiniMeToken public Time;
    ListLib.AddressList Tasks;

    function addTask (address task) public onlyOwner returns (bool success) {
        require(task != address(0x0));
        success = Tasks.add(task);
        if(success)
            emit NewTask_event(task);
    }

    function schedule (
        uint time,
        address toTask,
        address fromTask
    ) public onlyOwner returns (bool success) {
        success = Time.transferFrom(fromTask, toTask, time);
    }

    function getScheduledTime (address task) public view returns (uint) {
        return Time.balanceOf(task);
    }

    function getTotalTasks () public view returns (uint) {
        return Tasks.getLength();
    }

    function getTaskAtIndex (uint i) public view returns (address) {
        return Tasks.index(i);
    }

    function getTaskList () public view returns (address[] memory) {
        return Tasks.get();
    }

    event NewTask_event (address task);

}
