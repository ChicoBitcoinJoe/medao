pragma solidity ^0.5.0;

import "./external/CloneFactory.sol";
import "./MeDao.sol";

contract MeDaoFactory is CloneFactory {

    address public blueprint;
    ERC20 public dai;
    MiniMeTokenFactory factory;

    mapping (address => bool) public created;
    mapping (address => MeDao) public registry;

    constructor (
        address _blueprint,
        ERC20 _dai,
        MiniMeTokenFactory _factory
    ) public {
        blueprint = _blueprint;
        dai = _dai;
        factory = _factory;
    }

    function create (
        string memory name,
        int birthTimestamp,
        uint tokenClaim,
        uint initialReserve
    ) public returns (MeDao medao) {
        require(initialReserve > 0);
        require(tokenClaim > 0);

        MiniMeToken timeToken = factory.createCloneToken(
            address(0x0),
            0,
            name,
            18,
            'seconds',
            true
        );

        medao = MeDao(createClone(blueprint));
        created[address(medao)] = true;
        timeToken.changeController(address(medao));
        require(dai.transferFrom(msg.sender, address(medao), initialReserve));
        medao.initialize(msg.sender, timeToken, dai, birthTimestamp, tokenClaim);

        register(medao);
    }

    function register (MeDao medao) public {
        require(created[address(medao)], 'invalid medao');
        require(medao.identity() == msg.sender, 'invalid caller');

        registry[msg.sender] = medao;
        emit Register_event(msg.sender, medao);
    }

    event Register_event (address indexed owner, MeDao medao);
}
