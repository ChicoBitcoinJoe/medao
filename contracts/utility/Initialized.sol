pragma solidity ^0.5.0;

contract Initialized {

    uint public blockInitialized;

    modifier runOnce () {
        require(blockInitialized == 0);
        _;
        blockInitialized = block.number;
    }

}
