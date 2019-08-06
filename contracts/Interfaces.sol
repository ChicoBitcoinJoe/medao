pragma solidity ^0.5.0;

import "./external/ERC20Token.sol";
import "./external/Owned.sol";
import "./helpers/Initialized.sol";
import "./helpers/SimpleTokenController.sol";

contract ITimeScheduler is Owned {
    function assign (uint time, address taskA, address taskB) public;
    function getTime (address task) public view returns (uint time);
    function getSchedule () public view returns (address[] memory, uint[] memory);
}

contract IMoneyPool is SimpleTokenController{
    ERC20Token public reserveToken; // A reserve token to hold the value of a person
    MiniMeToken public shareToken;  // A cloneable token that represents a person
    uint public maxTokenSupply;     // The maximum amount of shares that can be created
    uint public baseShareValue;     // Sets a base value for each sold token at
    bool public useBaseValue;       // Determines which formula is used when depositing
    function calculateShareClaim (uint reserveAmount) public view returns (uint);
    function calculateReserveClaim (uint shareAmount) public view returns (uint);
    function deposit (uint reserveAmount) public returns (uint shareClaim);
    function withdraw (uint shareAmount) public returns (uint reserveClaim);
    function transfer (address account, uint reserveAmount) internal;
    function issue (address account, uint shareAmount) internal;
    function destroy (address account, uint shareAmount) internal;
}

contract IFundraiser is Owned, IMoneyPool {
    function collectFunds () public returns (uint collectedFunds);
}

contract IMeDao is IFundraiser {
    uint public collectedTimestamp;
    function calculateWorkTime (uint elapsedSeconds) public pure returns (uint);
}

contract IHumanCapital {
    address public identity;
    ERC20Token public ReserveToken;
    IMeDao public Dao;
    ITimeScheduler public Scheduler;
    mapping (address => bool) public factories;
    function scheduleFundraiser (IFundraiser fundraiser) public returns (IFundraiser);
    function collectPaycheck (IFundraiser[] memory fundraisers) public returns (uint paycheckAmount);
    function reschedule (uint time, address taskA, address taskB) public;
    function allowFactory (address factory, bool allowed) public;
}

contract IHumanCapitalFactory {

}

contract ITimeSchedulerFactory {
    function create (
        address baseTask,
        uint baseTime
    ) public returns (ITimeScheduler Scheduler);
}

contract IMeDaoFactory {
    function create (
        ERC20Token reserveToken,
        string memory name,
        uint maxTokenSupply,
        uint baseShareValue
    ) public returns (IMeDao medao);
}
