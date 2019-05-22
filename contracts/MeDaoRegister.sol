pragma solidity ^0.5.0;

import "./Interfaces.sol";
import "./MeDaoFactory.sol";

contract MeDaoRegistry {

    address constant NULL = address(0x0);
    MeDaoFactory public factory;
    ERC20 public dai;
    WETH public weth;

    mapping (address => MeDao) public registry;
    mapping (address => address) public transferRegistry;

    constructor (
        MeDaoFactory _factory,
        ERC20 _dai,
        WETH _weth
    ) public {
        factory = _factory;
        dai = _dai;
        weth = _weth;
    }

    function create (
        string memory name,
        uint birthTimestamp,
        uint tokenClaim,
        uint seedFunds
    ) public returns (MeDao medao) {
        require(address(registry[msg.sender]) == NULL);

        medao = factory.create(
            dai,
            name,
            birthTimestamp,
            tokenClaim
        );

        require(dai.transfer(address(medao), seedFunds));
        medao.transferOwnership(msg.sender);
        registry[msg.sender] = medao;
    }

    function create (
        string memory name,
        uint birthTimestamp,
        uint tokenClaim,
        TokenConverter converter
    ) public payable returns (MeDao medao) {
        require(address(registry[msg.sender]) == NULL);

        medao = factory.create(
            dai,
            name,
            birthTimestamp,
            tokenClaim
        );

        weth.deposit.value(msg.value)();
        require(weth.approve(address(converter), msg.value));

        uint seedFunds = converter.convert(msg.value);
        require(dai.transfer(address(medao), seedFunds));
        medao.transferOwnership(msg.sender);
        registry[msg.sender] = medao;
    }

    function create (
        string memory name,
        uint birthTimestamp,
        uint tokenClaim,
        TokenConverter converter,
        uint convertAmount
    ) public returns (MeDao medao) {
        require(address(registry[msg.sender]) == NULL);

        medao = factory.create(
            dai,
            name,
            birthTimestamp,
            tokenClaim
        );

        require(converter.payToken().transferFrom(msg.sender, address(this), convertAmount));
        require(converter.payToken().approve(address(converter), convertAmount));

        uint seedFunds = converter.convert(convertAmount);
        require(dai.transfer(address(medao), seedFunds));
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
