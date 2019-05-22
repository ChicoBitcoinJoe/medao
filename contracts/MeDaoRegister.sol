pragma solidity ^0.5.0;

import "./MeDaoFactory.sol";

contract TokenConverter {
    function convert (address token, uint amount, address returnToken, uint minReturnAmount) public payable returns (uint returnAmount);
}

contract EthToDai is TokenConverter {

    // function convert (address token, uint amount, address returnToken, uint minReturnAmount) public payable returns (uint returnAmount) {
    //
    // }

}

contract MeDaoRegistry {

    address constant ETHER = address(0x0);
    address constant NULL = address(0x0);
    MeDaoFactory public factory;
    ERC20 public reserveToken;

    mapping (address => MeDao) public registry;
    mapping (address => address) public transferRegistry;

    constructor (
        MeDaoFactory _factory,
        ERC20 _reserveToken
    ) public {
        factory = _factory;
        reserveToken = _reserveToken;
    }

    function create (
        string memory name,
        uint birthTimestamp,
        uint tokenClaim,
        uint seedFunds
    ) public returns (MeDao medao) {
        require(address(registry[msg.sender]) == NULL);

        medao = factory.create(
            reserveToken,
            name,
            birthTimestamp,
            tokenClaim
        );

        require(reserveToken.transfer(address(medao), seedFunds));
        medao.transferOwnership(msg.sender);
        registry[msg.sender] = medao;
    }

    function create (
        string memory name,
        uint birthTimestamp,
        uint tokenClaim,
        TokenConverter converter,
        ERC20 convertToken,
        uint convertAmount,
        uint minReturnAmount
    ) public payable returns (MeDao medao) {
        require(address(registry[msg.sender]) == NULL);

        uint seedFunds = 0;
        if(msg.value > 0) {
            seedFunds = converter.convert.value(msg.value)(ETHER, msg.value, address(reserveToken), minReturnAmount);
        }
        else {
            require(convertToken.transferFrom(msg.sender, address(this), convertAmount));
            require(convertToken.approve(address(converter), convertAmount));
            seedFunds = converter.convert(address(convertToken), convertAmount, address(reserveToken), minReturnAmount);
        }

        medao = factory.create(
            reserveToken,
            name,
            birthTimestamp,
            tokenClaim
        );

        require(reserveToken.transfer(address(medao), seedFunds));
        medao.transferOwnership(msg.sender);
        registry[msg.sender] = medao;
    }

    function transfer (address newOwner) public {
        transferRegistry[msg.sender] = newOwner;
    }

    function claimTransfer (address oldOwner) public {
        require(address(registry[msg.sender]) == address(0x0));
        require(transferRegistry[oldOwner] == msg.sender);

        registry[msg.sender] = registry[oldOwner];
        delete transferRegistry[oldOwner];
        delete registry[oldOwner];
    }

}
