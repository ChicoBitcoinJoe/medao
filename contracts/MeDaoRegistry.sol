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
        int birthTimestamp,
        uint tokenClaim,
        uint initialReserve
    ) public returns (MeDao medao) {
        require(address(registry[msg.sender]) == NULL);

        require(dai.transferFrom(msg.sender, address(this), initialReserve));
        require(dai.approve(address(factory), initialReserve));

        medao = MeDao(factory.create(
            msg.sender,
            dai,
            name,
            birthTimestamp,
            tokenClaim,
            initialReserve
        ));

        medao.transferOwnership(msg.sender);
        registry[msg.sender] = medao;
    }

    function create (
        string memory name,
        int birthTimestamp,
        uint tokenClaim,
        TokenConverter converter,
        uint minFillAmount
    ) public payable returns (MeDao medao) {
        require(address(registry[msg.sender]) == NULL);

        weth.deposit.value(msg.value)();
        require(weth.approve(address(converter), msg.value));
        uint initialReserve = converter.convert(msg.value, minFillAmount);
        require(dai.approve(address(factory), initialReserve));

        medao = MeDao(factory.create(
            msg.sender,
            dai,
            name,
            birthTimestamp,
            tokenClaim,
            initialReserve
        ));

        medao.transferOwnership(msg.sender);
        registry[msg.sender] = medao;
    }

    function create (
        string memory name,
        int birthTimestamp,
        uint tokenClaim,
        TokenConverter converter,
        uint convertAmount,
        uint minFillAmount
    ) public returns (MeDao medao) {
        require(address(registry[msg.sender]) == NULL);

        require(converter.payToken().transferFrom(msg.sender, address(this), convertAmount));
        require(converter.payToken().approve(address(converter), convertAmount));

        uint initialReserve = converter.convert(convertAmount, minFillAmount);
        require(dai.approve(address(factory), initialReserve));

        medao = MeDao(factory.create(
            msg.sender,
            dai,
            name,
            birthTimestamp,
            tokenClaim,
            initialReserve
        ));

        medao.transferOwnership(msg.sender);
        registry[msg.sender] = medao;
    }

    function transfer (address newOwner) public {
        require(address(registry[newOwner]) == address(0x0));

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
