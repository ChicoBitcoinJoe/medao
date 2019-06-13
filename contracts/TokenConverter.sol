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

    function deposit () public payable {
        payToken.deposit.value(msg.value)();
        payToken.transfer(msg.sender, msg.value);
    }

    function convert (uint maxPayAmount, uint minFillAmount) public returns (uint fillAmount) {
        uint currentPayAmount = exchange.getPayAmount(payToken, buyToken, minFillAmount);
        require(currentPayAmount <= maxPayAmount, "max pay amount too low");
        require(payToken.transferFrom(msg.sender, address(this), currentPayAmount));
        require(payToken.approve(address(exchange), currentPayAmount));
        fillAmount = exchange.sellAllAmount(payToken, currentPayAmount, buyToken, minFillAmount);
        require(buyToken.transfer(msg.sender, buyToken.balanceOf(address(this))));
        payToken.withdraw(payToken.balanceOf(address(this)));
        msg.sender.transfer(address(this).balance);
    }

}
