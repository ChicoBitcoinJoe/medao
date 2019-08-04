pragma solidity ^0.5.0;

contract NameRegistry {

    struct Account {
        string name;
        uint id;
    }

    mapping (string => address[]) registry;
    mapping (address => Account) reverseLookup;

    function register (string memory name) public returns (uint id) {
        Account memory account = reverseLookup[msg.sender];
        require(account.id == 0);

        registry[name].push(msg.sender);
        id = registry[name].length;
        reverseLookup[msg.sender] = Account(name, id);
    }

    function lookup (string memory name, uint id) public view returns (address){
        return registry[name][id];
    }

    function from (address _address) public view returns (string memory, uint) {
        Account memory account = reverseLookup[_address];
        return (account.name, account.id);
    }

    function transfer (string memory name, uint id, address _address) public {
        require(registry[name][id] == msg.sender);
        reverseLookup[_address] = Account(name, id);
        registry[name][id] = _address;
    }

}
