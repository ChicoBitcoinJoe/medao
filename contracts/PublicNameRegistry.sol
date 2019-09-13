pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import "./Interfaces.sol";

contract PublicNameRegistry is IPublicNameRegistry {

    struct Account {
        string[] names;
        uint[] ids;
    }

    mapping (string => address[]) registry;
    mapping (address => Account) reverseLookup;

    function register (string memory name) public returns (uint id) {
        registry[name].push(msg.sender);
        id = registry[name].length;
        reverseLookup[msg.sender].names.push(name);
        reverseLookup[msg.sender].ids.push(id);
        emit Register_event (msg.sender, name, id);
    }

    function lookup (string memory name, uint id) public view returns (address) {
        return registry[name][id];
    }

    function getNameAtIndex (address account, uint i) public view returns (string memory, uint) {
        return (reverseLookup[account].names[i], reverseLookup[account].ids[i]);
    }

    function getAccount (address account) public view returns (string[] memory, uint[] memory) {
        return (reverseLookup[account].names, reverseLookup[account].ids);
    }

    function getTotalNames (address account) public view returns (uint) {
        return reverseLookup[account].names.length;
    }

    event Register_event (address account, string name, uint id);
    
}
