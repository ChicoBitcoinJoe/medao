pragma solidity ^0.5.0;

import "./external/ERC20.sol";

contract DEX {
    function sellAllAmount(ERC20 pay_gem, uint pay_amt, ERC20 buy_gem, uint min_fill_amount) public returns (uint fill_amt);
    function buyAllAmount(ERC20 buy_gem, uint buy_amt, ERC20 pay_gem, uint max_fill_amount) public returns (uint fill_amt);
    function getBuyAmount(ERC20 buy_gem, ERC20 pay_gem, uint pay_amt) public view returns (uint fill_amt);
    function getPayAmount(ERC20 pay_gem, ERC20 buy_gem, uint buy_amt) public view returns (uint fill_amt);
}

contract TokenConverter {
    ERC20 public payToken;
    ERC20 public buyToken;
    function convert (uint tokenAmount, uint minFillAmount) public returns (uint fillAmount);
}
