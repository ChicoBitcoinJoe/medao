pragma solidity ^0.5.0;

import "./external/CloneFactory.sol";
import "./MeDao.sol";

contract MeDaoFactory is CloneFactory {

    address public blueprint;

    constructor (
        address _blueprint
    ) public {
        blueprint = _blueprint;
    }

    mapping (address => bool) public created;

    function create (
        ERC20 reserveToken,
        string memory name,
        uint birthTimestamp,
        uint tokenClaim,
        uint reserveAmount
    ) public returns (MeDao medao) {
        address payable clone = address(uint160(createClone(blueprint)));
        medao = MeDao(clone);

        MiniMeToken timeToken = new MiniMeToken(
            address(this),
            address(0x0),
            0,
            name,
            18,
            'seconds',
            true
        );

        require(reserveToken.transferFrom(msg.sender, address(medao), reserveAmount), '');
        require(timeToken.generateTokens(msg.sender, tokenClaim), '');

        timeToken.changeController(address(clone));
        medao.initialize(timeToken, reserveToken, birthTimestamp);
        medao.transferOwnership(msg.sender);
        created[address(medao)] = true;
    }

}
