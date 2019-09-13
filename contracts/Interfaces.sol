pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import "./external/ERC20Token.sol";
import "./external/Owned.sol";
import "./utility/Initialized.sol";
import "./utility/SimpleTokenController.sol";

contract Cloned {
    address public factory;
}

contract IPublicNameRegistry {
    function register (string memory name) public returns (uint id);
    function lookup (string memory name, uint id) public view returns (address);
    function getNameAtIndex (address account, uint i) public view returns (string memory, uint);
    function getAccount (address account) public view returns (string[] memory, uint[] memory);
    function getTotalNames (address account) public view returns (uint);
}

contract ITimeManager {
    function addTask (address task) public returns (bool success);
    function schedule (uint time, address toTask, address fromTask) public returns (bool success);
    function getScheduledTime (address task) public view returns (uint);
    function getTotalTasks () public view returns (uint);
    function getTaskAtIndex (uint i) public view returns (address);
    function getTaskList () public view returns (address[] memory);
}

contract ITimeReleasedFundraiser is Owned {
    ITimeManager public Manager;
    ERC20Token public ReserveToken;
    ERC20Token public RewardToken;
    uint public collectedTimestamp;
    uint public maxUsableTime;
    function pledge (uint reserveAmount) public returns (uint rewardAmount);
    function refund (uint rewardAmount) public returns (uint reserveAmount);
    function burn (uint rewardAmount) public;
    function collectFunds (uint scheduledTime) public returns (uint reserveAmount);
    function calculateElligibleFunds (uint scheduledTime) public view returns (uint);
    function calculatePledgeReward (uint reserveAmount) public view returns (uint rewardAmount);
    function calculateRefundAmount (uint rewardAmount) public view returns (uint reserveAmount);
    function calculatePledgeCost (uint rewardAmount) public view returns (uint reserveAmount);
    function active () public view returns (bool);
}

contract ITimeReleasedFundraiserFactory {
    mapping (address => bool) public created;
    function startFundraiser (ITimeManager Manager, string memory name, uint desiredWage) public returns (ITimeReleasedFundraiser);
}
