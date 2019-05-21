pragma solidity ^0.5.0;

import "./external/CloneFactory.sol";
import "./MeDao.sol";

contract MeDaoFactory is CloneFactory {

    address public blueprint;
    ERC20 public reserve;

    constructor (
        address _blueprint,
        ERC20 _reserve
    ) public {
        blueprint = _blueprint;
        reserve = _reserve;
    }

    function create (
        string memory name,
        uint birthTimestamp,
        uint tokenClaim,
        uint reserveAmount
    ) public returns (MeDao medao) {
        address payable clone = address(uint160(createClone(blueprint)));
        medao = MeDao(clone);
        MiniMeToken token = new MiniMeToken(
            address(this),
            address(0x0),
            0,
            name,
            18,
            'seconds',
            true
        );

        uint maxTokenSupply = (now - birthTimestamp) / 3;
        reserve.transferFrom(msg.sender, address(medao), reserveAmount);
        token.generateTokens(msg.sender, tokenClaim);
        token.changeController(clone);

        medao.initialize(
            token,
            reserve,
            maxTokenSupply
        );
    }

}
