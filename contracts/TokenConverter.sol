pragma solidity ^0.5.0;

import "./external/ERC20.sol";
import "./Interfaces.sol";

contract EthToDai is TokenConverter {

    DEX public eth2dai;
    WETH public payToken;
    ERC20 public buyToken;

    constructor (
        DEX _eth2dai,
        WETH _payToken,
        ERC20 _buyToken
    ) public {
        eth2dai = _eth2dai;
        payToken = _payToken;
        buyToken = _buyToken;
    }

    function convert (uint tokenAmount, uint minFillAmount) public returns (uint fillAmount) {
        fillAmount = eth2dai.sellAllAmount(payToken, tokenAmount, buyToken, minFillAmount);
    }

}
