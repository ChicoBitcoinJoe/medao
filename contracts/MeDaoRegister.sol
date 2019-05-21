pragma solidity ^0.5.0;

import "./MeDaoFactory.sol";

contract TokenConverter {
    function convert (address token, uint amount, address returnToken, uint minReturnAmount) public payable returns (uint returnAmount);
}

contract EthToDai is TokenConverter {
    //function convert (address token, uint amount, address returnToken, uint minReturnAmount) public payable returns (uint returnAmount) {

    //}
}

contract MeDaoHelper {

    address constant ETHER = address(0x0);
    address constant NULL = address(0x0);
    MeDaoFactory public factory;

    mapping (address => MeDao) public registry;

    constructor (
        MeDaoFactory _factory
    ) public {
        factory = _factory;
    }

    function create (
        string memory name,
        uint birthTimestamp,
        ERC20 reserveToken,
        uint reserveAmount,
        uint tokenClaim
    ) public returns (MeDao medao) {
        require(address(registry[msg.sender]) == NULL);
        require(reserveToken.transferFrom(msg.sender, address(this), reserveAmount));
        require(reserveToken.approve(address(factory), reserveAmount));

        medao = factory.create(
            reserveToken,
            name,
            birthTimestamp,
            tokenClaim,
            reserveAmount
        );

        medao.transferOwnership(msg.sender);
        registry[msg.sender] = medao;
    }

    function create (
        string memory name,
        uint birthTimestamp,
        TokenConverter converter,
        ERC20 reserveToken,
        ERC20 convertToken,
        uint convertAmount,
        uint minReturnAmount,
        uint tokenClaim
    ) public payable returns (MeDao medao) {
        require(address(registry[msg.sender]) == NULL);

        uint reserveAmount = 0;
        if(msg.value > 0) {
            reserveAmount = converter.convert.value(msg.value)(ETHER, msg.value, address(reserveToken), minReturnAmount);
        }
        else {
            require(convertToken.transferFrom(msg.sender, address(this), convertAmount));
            require(convertToken.approve(address(converter), convertAmount));

            reserveAmount = converter.convert(address(convertToken), convertAmount, address(reserveToken), minReturnAmount);
        }

        require(reserveToken.approve(address(factory), reserveAmount));

        medao = factory.create(
            reserveToken,
            name,
            birthTimestamp,
            tokenClaim,
            reserveAmount
        );

        medao.transferOwnership(msg.sender);
        registry[msg.sender] = medao;
    }

}
