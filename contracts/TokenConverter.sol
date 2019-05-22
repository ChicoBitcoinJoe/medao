pragma solidity ^0.5.0;

import "./external/ERC20.sol";
import "./Interfaces.sol";

contract EthToDai is TokenConverter {

    DEX exchange;
    WETH public payToken;
    ERC20 public buyToken;

    constructor (
        DEX _exchange,
        ERC20 _buyToken,
        WETH _payToken
    ) public {
        exchange = _exchange;
        payToken = _payToken;
        buyToken = _buyToken;
    }

    function convert (uint tokenAmount) public returns (uint fillAmount) {
        fillAmount = exchange.sellAllAmount(payToken, tokenAmount, buyToken, 0);
    }

    function predictFillAmount (uint tokenAmount) public view returns (uint) {
        return exchange.getBuyAmount(buyToken, payToken, tokenAmount);
    }

}
