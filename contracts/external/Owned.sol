pragma solidity ^0.5.0;

contract Owned {

    address public owner;

    constructor () public {
        owner = msg.sender;
    }

    modifier onlyOwner () {
        require(msg.sender == owner, "msg sender is not owner");
        _;
    }

    function transferOwnership(address newOwner) public onlyOwner {
        owner = newOwner;
    }
    
}
