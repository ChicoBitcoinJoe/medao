pragma solidity ^0.5.0;

import "./external/ERC20Token.sol";
import "./external/MiniMeToken.sol";

contract ITimeManager {
    function assign (address task, uint time) public;
    function assign (address taskA, uint time, address taskB) public;
    function lock (address task) public;
    function unlock (address task) public;
}

contract IFundraiser {

}

contract IFundraiserFactory {
    function create (
        string memory name,
        uint fundraiserGoal,
        uint fundraiserDuration
    ) public returns (IFundraiser);
}

contract IPerson {
    ITimeManager public manager;
    IMeDao public dao;
    address public identity;
}

contract IMeDao {
    ERC20Token public reserveToken;
    MiniMeToken public shareToken;
}
