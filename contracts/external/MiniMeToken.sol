pragma solidity 0.5.0;

contract MiniMeToken {

    string public name;                //The Token's name: e.g. DigixDAO Tokens
    uint8 public decimals;             //Number of decimals of the smallest unit
    string public symbol;              //An identifier: e.g. REP

///////////////////
// ERC20 Methods
///////////////////

    function transfer(address _to, uint256 _amount) public returns (bool success);
    function transferFrom(address _from, address _to, uint256 _amount) public;
    function balanceOf(address _owner) public view returns (uint256 balance);
    function approve(address _spender, uint256 _amount) public returns (bool success);
    function allowance(address _owner, address _spender) public view returns (uint256 remaining);
    function totalSupply() public view returns (uint);

///////////////////
// MiniMe Methods
///////////////////

    function balanceOfAt(address _owner, uint _blockNumber) public view;
    function totalSupplyAt(uint _blockNumber) public view returns(uint);
    function generateTokens(address _owner, uint _amount) public returns (bool);
    function destroyTokens(address _owner, uint _amount) public returns (bool);

////////////////
// Events
////////////////

    event Transfer(address indexed _from, address indexed _to, uint256 _amount);
    event NewCloneToken(address indexed _cloneToken, uint _snapshotBlock);
    event Approval(address indexed _owner, address indexed _spender, uint256 _amount);

}
