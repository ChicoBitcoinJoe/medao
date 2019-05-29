pragma solidity ^0.5.0;

import "./external/CloneFactory.sol";
import "./MeDao.sol";

contract MeDaoFactory is CloneFactory {

    address public blueprint;
    MiniMeTokenFactory factory;
    mapping (address => bool) public created;

    constructor (
        address _blueprint,
        MiniMeTokenFactory _factory
    ) public {
        blueprint = _blueprint;
        factory = _factory;
    }

    function create (
        address owner,
        ERC20 reserveToken,
        string memory name,
        int birthTimestamp,
        uint tokenClaim,
        uint initialReserve
    ) public returns (address medao) {
        medao = createClone(blueprint);

        MiniMeToken timeToken = factory.createCloneToken(
            address(0x0),
            0,
            name,
            18,
            'seconds',
            true
        );

        timeToken.changeController(medao);
        require(reserveToken.transferFrom(msg.sender, medao, initialReserve));
        MeDao(medao).initialize(owner, timeToken, reserveToken, birthTimestamp, tokenClaim);
        created[medao] = true;
        emit Create_event(medao, owner, timeToken, reserveToken, birthTimestamp);
    }

    event Create_event (address medao, address owner, MiniMeToken timeToken, ERC20 reserveToken, int birthTimestamp);
}
