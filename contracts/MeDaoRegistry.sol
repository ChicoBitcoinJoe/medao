pragma solidity ^0.5.0;

import "./Interfaces.sol";
import "./MeDaoFactory.sol";

contract MeDaoRegistry {

    MeDaoFactory public factory;
    ERC20 public dai;
    mapping (address => MeDao) public registry;

    constructor (
        MeDaoFactory _factory,
        ERC20 _dai
    ) public {
        factory = _factory;
        dai = _dai;
    }

    function create (
        string memory name,
        int birthTimestamp,
        uint tokenClaim,
        uint initialReserve
    ) public returns (MeDao medao) {
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

        register(medao);
    }

    function create (
        string memory name,
        int birthTimestamp,
        uint tokenClaim,
        TokenConverter converter,
        uint convertAmount,
        uint minFillAmount
    ) public payable returns (MeDao medao) {
        if(msg.value > 0)
            converter.deposit.value(msg.value)();

        require(converter.payToken().approve(address(converter), convertAmount));
        uint initialReserve = converter.convert(convertAmount, minFillAmount);
        uint change = converter.payToken().balanceOf(address(this));
        require(converter.payToken().transfer(msg.sender, change));
        require(dai.approve(address(factory), initialReserve));

        medao = MeDao(factory.create(
            msg.sender,
            dai,
            name,
            birthTimestamp,
            tokenClaim,
            initialReserve
        ));

        register(medao);
    }

    function register (MeDao medao) public {
        require(factory.created(address(medao)));

        registry[msg.sender] = medao;
        emit Register_event(msg.sender, medao);
    }

    event Register_event (address owner, MeDao medao);

}
