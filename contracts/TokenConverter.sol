pragma solidity ^0.5.0;

import "./external/ERC20.sol";
import "./Interfaces.sol";

contract WethToDai is TokenConverter {

    DEX public exchange;
    WETH public payToken;
    ERC20 public buyToken;

    constructor (
        DEX _exchange,
        WETH _payToken,
        ERC20 _buyToken
    ) public {
        exchange = _exchange;
        payToken = _payToken;
        buyToken = _buyToken;
    }

    function convert (uint tokenAmount, uint minFillAmount) public returns (uint fillAmount) {
        payToken.transferFrom(msg.sender, address(this), tokenAmount);
        payToken.approve(address(exchange), tokenAmount);
        fillAmount = exchange.sellAllAmount(payToken, tokenAmount, buyToken, minFillAmount);
        payToken.transfer(msg.sender, payToken.balanceOf(address(this)));
        buyToken.transfer(msg.sender, buyToken.balanceOf(address(this)));
    }

}
