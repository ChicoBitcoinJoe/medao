pragma solidity ^0.4.11;

/*
    Copyright 2016, Jordi Baylina

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/// @title MiniMeToken Contract
/// @author Jordi Baylina
/// @dev This token contract's goal is to make it easy for anyone to clone this
///  token using the token distribution at a given block, this will allow DAO's
///  and DApps to upgrade their features in a decentralized manner without
///  affecting the original token
/// @dev It is ERC20 compliant, but still needs to under go further testing.


/// @dev The token controller contract must implement these functions
contract TokenController {
    /// @notice Called when `_owner` sends ether to the MiniMe Token contract
    /// @param _owner The address that sent the ether to create tokens
    /// @return True if the ether is accepted, false if it throws
    function proxyPayment(address _owner) payable returns(bool);

    /// @notice Notifies the controller about a token transfer allowing the
    ///  controller to react if desired
    /// @param _from The origin of the transfer
    /// @param _to The destination of the transfer
    /// @param _amount The amount of the transfer
    /// @return False if the controller does not authorize the transfer
    function onTransfer(address _from, address _to, uint _amount) returns(bool);

    /// @notice Notifies the controller about an approval allowing the
    ///  controller to react if desired
    /// @param _owner The address that calls `approve()`
    /// @param _spender The spender in the `approve()` call
    /// @param _amount The amount in the `approve()` call
    /// @return False if the controller does not authorize the approval
    function onApprove(address _owner, address _spender, uint _amount)
        returns(bool);
}

contract Controlled {
    /// @notice The address of the controller is the only address that can call
    ///  a function with this modifier
    modifier onlyController { if (msg.sender != controller) throw; _; }

    address public controller;

    function Controlled() { controller = msg.sender;}

    /// @notice Changes the controller of the contract
    /// @param _newController The new controller of the contract
    function changeController(address _newController) onlyController {
        controller = _newController;
    }
}

contract ApproveAndCallFallBack {
    function receiveApproval(address from, uint256 _amount, address _token, bytes _data);
}

/// @dev The actual token contract, the default controller is the msg.sender
///  that deploys the contract, so usually this token will be deployed by a
///  token controller contract, which Giveth will call a "Campaign"
contract MiniMeToken is Controlled {

    string public name;                //The Token's name: e.g. DigixDAO Tokens
    uint8 public decimals;             //Number of decimals of the smallest unit
    string public symbol;              //An identifier: e.g. REP
    string public version = 'MMT_0.1'; //An arbitrary versioning scheme


    /// @dev `Checkpoint` is the structure that attaches a block number to a
    ///  given value, the block number attached is the one that last changed the
    ///  value
    struct  Checkpoint {

        // `fromBlock` is the block number that the value was generated from
        uint128 fromBlock;

        // `value` is the amount of tokens at a specific block number
        uint128 value;
    }

    // `parentToken` is the Token address that was cloned to produce this token;
    //  it will be 0x0 for a token that was not cloned
    MiniMeToken public parentToken;

    // `parentSnapShotBlock` is the block number from the Parent Token that was
    //  used to determine the initial distribution of the Clone Token
    uint public parentSnapShotBlock;

    // `creationBlock` is the block number that the Clone Token was created
    uint public creationBlock;

    // `balances` is the map that tracks the balance of each address, in this
    //  contract when the balance changes the block number that the change
    //  occurred is also included in the map
    mapping (address => Checkpoint[]) balances;

    // `allowed` tracks any extra transfer rights as in all ERC20 tokens
    mapping (address => mapping (address => uint256)) allowed;

    // Tracks the history of the `totalSupply` of the token
    Checkpoint[] totalSupplyHistory;

    // Flag that determines if the token is transferable or not.
    bool public transfersEnabled;

    // The factory used to create new clone tokens
    MiniMeTokenFactory public tokenFactory;

////////////////
// Constructor
////////////////

    /// @notice Constructor to create a MiniMeToken
    /// @param _tokenFactory The address of the MiniMeTokenFactory contract that
    ///  will create the Clone token contracts, the token factory needs to be
    ///  deployed first
    /// @param _parentToken Address of the parent token, set to 0x0 if it is a
    ///  new token
    /// @param _parentSnapShotBlock Block of the parent token that will
    ///  determine the initial distribution of the clone token, set to 0 if it
    ///  is a new token
    /// @param _tokenName Name of the new token
    /// @param _decimalUnits Number of decimals of the new token
    /// @param _tokenSymbol Token Symbol for the new token
    /// @param _transfersEnabled If true, tokens will be able to be transferred
    function MiniMeToken(
        address _tokenFactory,
        address _parentToken,
        uint _parentSnapShotBlock,
        string _tokenName,
        uint8 _decimalUnits,
        string _tokenSymbol,
        bool _transfersEnabled
    ) {
        tokenFactory = MiniMeTokenFactory(_tokenFactory);
        name = _tokenName;                                 // Set the name
        decimals = _decimalUnits;                          // Set the decimals
        symbol = _tokenSymbol;                             // Set the symbol
        parentToken = MiniMeToken(_parentToken);
        parentSnapShotBlock = _parentSnapShotBlock;
        transfersEnabled = _transfersEnabled;
        creationBlock = block.number;
    }


///////////////////
// ERC20 Methods
///////////////////

    /// @notice Send `_amount` tokens to `_to` from `msg.sender`
    /// @param _to The address of the recipient
    /// @param _amount The amount of tokens to be transferred
    /// @return Whether the transfer was successful or not
    function transfer(address _to, uint256 _amount) returns (bool success) {
        if (!transfersEnabled) throw;
        return doTransfer(msg.sender, _to, _amount);
    }

    /// @notice Send `_amount` tokens to `_to` from `_from` on the condition it
    ///  is approved by `_from`
    /// @param _from The address holding the tokens being transferred
    /// @param _to The address of the recipient
    /// @param _amount The amount of tokens to be transferred
    /// @return True if the transfer was successful
    function transferFrom(address _from, address _to, uint256 _amount
    ) returns (bool success) {

        // The controller of this contract can move tokens around at will,
        //  this is important to recognize! Confirm that you trust the
        //  controller of this contract, which in most situations should be
        //  another open source smart contract or 0x0
        if (msg.sender != controller) {
            if (!transfersEnabled) throw;

            // The standard ERC 20 transferFrom functionality
            if (allowed[_from][msg.sender] < _amount) return false;
            allowed[_from][msg.sender] -= _amount;
        }
        return doTransfer(_from, _to, _amount);
    }

    /// @dev This is the actual transfer function in the token contract, it can
    ///  only be called by other functions in this contract.
    /// @param _from The address holding the tokens being transferred
    /// @param _to The address of the recipient
    /// @param _amount The amount of tokens to be transferred
    /// @return True if the transfer was successful
    function doTransfer(address _from, address _to, uint _amount
    ) internal returns(bool) {

           if (_amount == 0) {
               return true;
           }

           if (parentSnapShotBlock >= block.number) throw;

           // Do not allow transfer to 0x0 or the token contract itself
           if ((_to == 0) || (_to == address(this))) throw;

           // If the amount being transfered is more than the balance of the
           //  account the transfer returns false
           var previousBalanceFrom = balanceOfAt(_from, block.number);
           if (previousBalanceFrom < _amount) {
               return false;
           }

           // Alerts the token controller of the transfer
           if (isContract(controller)) {
               if (!TokenController(controller).onTransfer(_from, _to, _amount))
               throw;
           }

           // First update the balance array with the new value for the address
           //  sending the tokens
           updateValueAtNow(balances[_from], previousBalanceFrom - _amount);

           // Then update the balance array with the new value for the address
           //  receiving the tokens
           var previousBalanceTo = balanceOfAt(_to, block.number);
           if (previousBalanceTo + _amount < previousBalanceTo) throw; // Check for overflow
           updateValueAtNow(balances[_to], previousBalanceTo + _amount);

           // An event to make the transfer easy to find on the blockchain
           Transfer(_from, _to, _amount);

           return true;
    }

    /// @param _owner The address that's balance is being requested
    /// @return The balance of `_owner` at the current block
    function balanceOf(address _owner) constant returns (uint256 balance) {
        return balanceOfAt(_owner, block.number);
    }

    /// @notice `msg.sender` approves `_spender` to spend `_amount` tokens on
    ///  its behalf. This is a modified version of the ERC20 approve function
    ///  to be a little bit safer
    /// @param _spender The address of the account able to transfer the tokens
    /// @param _amount The amount of tokens to be approved for transfer
    /// @return True if the approval was successful
    function approve(address _spender, uint256 _amount) returns (bool success) {
        if (!transfersEnabled) throw;

        // To change the approve amount you first have to reduce the addresses`
        //  allowance to zero by calling `approve(_spender,0)` if it is not
        //  already 0 to mitigate the race condition described here:
        //  https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
        if ((_amount!=0) && (allowed[msg.sender][_spender] !=0)) throw;

        // Alerts the token controller of the approve function call
        if (isContract(controller)) {
            if (!TokenController(controller).onApprove(msg.sender, _spender, _amount))
                throw;
        }

        allowed[msg.sender][_spender] = _amount;
        Approval(msg.sender, _spender, _amount);
        return true;
    }

    /// @dev This function makes it easy to read the `allowed[]` map
    /// @param _owner The address of the account that owns the token
    /// @param _spender The address of the account able to transfer the tokens
    /// @return Amount of remaining tokens of _owner that _spender is allowed
    ///  to spend
    function allowance(address _owner, address _spender
    ) constant returns (uint256 remaining) {
        return allowed[_owner][_spender];
    }

    /// @notice `msg.sender` approves `_spender` to send `_amount` tokens on
    ///  its behalf, and then a function is triggered in the contract that is
    ///  being approved, `_spender`. This allows users to use their tokens to
    ///  interact with contracts in one function call instead of two
    /// @param _spender The address of the contract able to transfer the tokens
    /// @param _amount The amount of tokens to be approved for transfer
    /// @return True if the function call was successful
    function approveAndCall(address _spender, uint256 _amount, bytes _extraData
    ) returns (bool success) {
        if (!approve(_spender, _amount)) throw;

        ApproveAndCallFallBack(_spender).receiveApproval(
            msg.sender,
            _amount,
            this,
            _extraData
        );

        return true;
    }

    /// @dev This function makes it easy to get the total number of tokens
    /// @return The total number of tokens
    function totalSupply() constant returns (uint) {
        return totalSupplyAt(block.number);
    }


////////////////
// Query balance and totalSupply in History
////////////////

    /// @dev Queries the balance of `_owner` at a specific `_blockNumber`
    /// @param _owner The address from which the balance will be retrieved
    /// @param _blockNumber The block number when the balance is queried
    /// @return The balance at `_blockNumber`
    function balanceOfAt(address _owner, uint _blockNumber) constant
        returns (uint) {

        // These next few lines are used when the balance of the token is
        //  requested before a check point was ever created for this token, it
        //  requires that the `parentToken.balanceOfAt` be queried at the
        //  genesis block for that token as this contains initial balance of
        //  this token
        if ((balances[_owner].length == 0)
            || (balances[_owner][0].fromBlock > _blockNumber)) {
            if (address(parentToken) != 0) {
                return parentToken.balanceOfAt(_owner, min(_blockNumber, parentSnapShotBlock));
            } else {
                // Has no parent
                return 0;
            }

        // This will return the expected balance during normal situations
        } else {
            return getValueAt(balances[_owner], _blockNumber);
        }
    }

    /// @notice Total amount of tokens at a specific `_blockNumber`.
    /// @param _blockNumber The block number when the totalSupply is queried
    /// @return The total amount of tokens at `_blockNumber`
    function totalSupplyAt(uint _blockNumber) constant returns(uint) {

        // These next few lines are used when the totalSupply of the token is
        //  requested before a check point was ever created for this token, it
        //  requires that the `parentToken.totalSupplyAt` be queried at the
        //  genesis block for this token as that contains totalSupply of this
        //  token at this block number.
        if ((totalSupplyHistory.length == 0)
            || (totalSupplyHistory[0].fromBlock > _blockNumber)) {
            if (address(parentToken) != 0) {
                return parentToken.totalSupplyAt(min(_blockNumber, parentSnapShotBlock));
            } else {
                return 0;
            }

        // This will return the expected totalSupply during normal situations
        } else {
            return getValueAt(totalSupplyHistory, _blockNumber);
        }
    }

////////////////
// Clone Token Method
////////////////

    /// @notice Creates a new clone token with the initial distribution being
    ///  this token at `_snapshotBlock`
    /// @param _cloneTokenName Name of the clone token
    /// @param _cloneDecimalUnits Number of decimals of the smallest unit
    /// @param _cloneTokenSymbol Symbol of the clone token
    /// @param _snapshotBlock Block when the distribution of the parent token is
    ///  copied to set the initial distribution of the new clone token;
    ///  if the block is zero than the actual block, the current block is used
    /// @param _transfersEnabled True if transfers are allowed in the clone
    /// @return The address of the new MiniMeToken Contract
    function createCloneToken(
        string _cloneTokenName,
        uint8 _cloneDecimalUnits,
        string _cloneTokenSymbol,
        uint _snapshotBlock,
        bool _transfersEnabled
        ) returns(address) {
        if (_snapshotBlock == 0) _snapshotBlock = block.number;
        MiniMeToken cloneToken = tokenFactory.createCloneToken(
            this,
            _snapshotBlock,
            _cloneTokenName,
            _cloneDecimalUnits,
            _cloneTokenSymbol,
            _transfersEnabled
            );

        cloneToken.changeController(msg.sender);

        // An event to make the token easy to find on the blockchain
        NewCloneToken(address(cloneToken), _snapshotBlock);
        return address(cloneToken);
    }

////////////////
// Generate and destroy tokens
////////////////

    /// @notice Generates `_amount` tokens that are assigned to `_owner`
    /// @param _owner The address that will be assigned the new tokens
    /// @param _amount The quantity of tokens generated
    /// @return True if the tokens are generated correctly
    function generateTokens(address _owner, uint _amount
    ) onlyController returns (bool) {
        uint curTotalSupply = getValueAt(totalSupplyHistory, block.number);
        if (curTotalSupply + _amount < curTotalSupply) throw; // Check for overflow
        updateValueAtNow(totalSupplyHistory, curTotalSupply + _amount);
        var previousBalanceTo = balanceOf(_owner);
        if (previousBalanceTo + _amount < previousBalanceTo) throw; // Check for overflow
        updateValueAtNow(balances[_owner], previousBalanceTo + _amount);
        Transfer(0, _owner, _amount);
        return true;
    }


    /// @notice Burns `_amount` tokens from `_owner`
    /// @param _owner The address that will lose the tokens
    /// @param _amount The quantity of tokens to burn
    /// @return True if the tokens are burned correctly
    function destroyTokens(address _owner, uint _amount
    ) onlyController returns (bool) {
        uint curTotalSupply = getValueAt(totalSupplyHistory, block.number);
        if (curTotalSupply < _amount) throw;
        updateValueAtNow(totalSupplyHistory, curTotalSupply - _amount);
        var previousBalanceFrom = balanceOf(_owner);
        if (previousBalanceFrom < _amount) throw;
        updateValueAtNow(balances[_owner], previousBalanceFrom - _amount);
        Transfer(_owner, 0, _amount);
        return true;
    }

////////////////
// Enable tokens transfers
////////////////


    /// @notice Enables token holders to transfer their tokens freely if true
    /// @param _transfersEnabled True if transfers are allowed in the clone
    function enableTransfers(bool _transfersEnabled) onlyController {
        transfersEnabled = _transfersEnabled;
    }

////////////////
// Internal helper functions to query and set a value in a snapshot array
////////////////

    /// @dev `getValueAt` retrieves the number of tokens at a given block number
    /// @param checkpoints The history of values being queried
    /// @param _block The block number to retrieve the value at
    /// @return The number of tokens being queried
    function getValueAt(Checkpoint[] storage checkpoints, uint _block
    ) constant internal returns (uint) {
        if (checkpoints.length == 0) return 0;

        // Shortcut for the actual value
        if (_block >= checkpoints[checkpoints.length-1].fromBlock)
            return checkpoints[checkpoints.length-1].value;
        if (_block < checkpoints[0].fromBlock) return 0;

        // Binary search of the value in the array
        uint min = 0;
        uint max = checkpoints.length-1;
        while (max > min) {
            uint mid = (max + min + 1)/ 2;
            if (checkpoints[mid].fromBlock<=_block) {
                min = mid;
            } else {
                max = mid-1;
            }
        }
        return checkpoints[min].value;
    }

    /// @dev `updateValueAtNow` used to update the `balances` map and the
    ///  `totalSupplyHistory`
    /// @param checkpoints The history of data being updated
    /// @param _value The new number of tokens
    function updateValueAtNow(Checkpoint[] storage checkpoints, uint _value
    ) internal  {
        if ((checkpoints.length == 0)
        || (checkpoints[checkpoints.length -1].fromBlock < block.number)) {
               Checkpoint newCheckPoint = checkpoints[ checkpoints.length++ ];
               newCheckPoint.fromBlock =  uint128(block.number);
               newCheckPoint.value = uint128(_value);
           } else {
               Checkpoint oldCheckPoint = checkpoints[checkpoints.length-1];
               oldCheckPoint.value = uint128(_value);
           }
    }

    /// @dev Internal function to determine if an address is a contract
    /// @param _addr The address being queried
    /// @return True if `_addr` is a contract
    function isContract(address _addr) constant internal returns(bool) {
        uint size;
        if (_addr == 0) return false;
        assembly {
            size := extcodesize(_addr)
        }
        return size>0;
    }

    /// @dev Helper function to return a min betwen the two uints
    function min(uint a, uint b) internal returns (uint) {
        return a < b ? a : b;
    }

    /// @notice The fallback function: If the contract's controller has not been
    ///  set to 0, then the `proxyPayment` method is called which relays the
    ///  ether and creates tokens as described in the token controller contract
    function ()  payable {
        if (isContract(controller)) {
            if (! TokenController(controller).proxyPayment.value(msg.value)(msg.sender))
                throw;
        } else {
            throw;
        }
    }


////////////////
// Events
////////////////
    event Transfer(address indexed _from, address indexed _to, uint256 _amount);
    event NewCloneToken(address indexed _cloneToken, uint _snapshotBlock);
    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _amount
        );

}


////////////////
// MiniMeTokenFactory
////////////////

/// @dev This contract is used to generate clone contracts from a contract.
///  In solidity this is the way to create a contract from a contract of the
///  same class
contract MiniMeTokenFactory {

    /// @notice Update the DApp by creating a new token with new functionalities
    ///  the msg.sender becomes the controller of this clone token
    /// @param _parentToken Address of the token being cloned
    /// @param _snapshotBlock Block of the parent token that will
    ///  determine the initial distribution of the clone token
    /// @param _tokenName Name of the new token
    /// @param _decimalUnits Number of decimals of the new token
    /// @param _tokenSymbol Token Symbol for the new token
    /// @param _transfersEnabled If true, tokens will be able to be transferred
    /// @return The address of the new token contract
    function createCloneToken(
        address _parentToken,
        uint _snapshotBlock,
        string _tokenName,
        uint8 _decimalUnits,
        string _tokenSymbol,
        bool _transfersEnabled
    ) returns (MiniMeToken) {
        MiniMeToken newToken = new MiniMeToken(
            this,
            _parentToken,
            _snapshotBlock,
            _tokenName,
            _decimalUnits,
            _tokenSymbol,
            _transfersEnabled
            );

        newToken.changeController(msg.sender);
        return newToken;
    }
}

contract ERC20Token {
    function transfer(address _to, uint256 _value) returns (bool success);
    function balanceOf(address _owner) constant returns (uint256 balance);
}

contract Owned {
    address public owner;

    function Owned() {
        owner = msg.sender;
    }
    
    function transferOwnership (address _newOwner) onlyOwner {
        owner = _newOwner;
    }
    
    modifier onlyOwner() {
        if(msg.sender != owner) throw;
        _;
    }
}

/*
    Copyright 2017, Joseph Reed

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/// @title MeDao Contract
/// @author Joseph Reed
/// @dev A MeDao aims to let anyone issue time shares for themselves. The issuer
///      should talk to shareholders for advice on how to maximize value for 
///      themselves and for shareholders. Up to 40 hours worth of time are 
///      auctioned off each week. The Owner of the MeDao is expected to burn  
///      a certain amount of tokens each week negotiated between the Owner
///      and the Shareholders and thus will be diffrent for every MeDao. For 
///      more info go to https://github.com/ChicoBitcoinJoe/MeDao.

contract OngoingAuction is Owned {
    
    uint public current_bids_open;
    uint public total_bids_made;
    mapping (uint => Bid) public bids;
    mapping (address => Bidder) public bidders;
    
    uint public top_teir;
    uint public bottom_teir;
    uint public total_teirs;
    mapping (uint => Teir) public teirs; //DLL
    
////////////////
// Auction Functions
////////////////
    
    function placeBid (uint adjacentTeir) payable {
        if(msg.value == 0) throw;
        
        if(teirs[msg.value].line_length == 0)
            addNewTeir_internal(msg.value,adjacentTeir);
        
        addNewBid_internal();
    }
    
    function removeBid (uint bid_id) {
        if (msg.sender != bids[bid_id].owner) throw;
        
        removeBid_internal(bid_id);
        bids[bid_id].cancelled = true;
        
        bids[bid_id].owner.transfer(bids[bid_id].value);
    }
    
    function acceptHighestBid (address deposit_address) onlyOwner returns (uint) {
        if(top_teir == 0) throw;
        
        uint winning_bid_id = teirs[top_teir].front_of_line_id;
        removeBid_internal(winning_bid_id);
        bids[winning_bid_id].accepted = true;
        
        uint bidValue = bids[winning_bid_id].value;
        deposit_address.transfer(bidValue);
        
        return winning_bid_id;
    }
    
    function getBids (address bidder) constant returns (uint[]) {
        uint total_bids = bidders[bidder].total_bids_made;
        uint[] memory all_bids = new uint[](total_bids);
        
        for(uint i = 0; i < total_bids; i++)
            all_bids[i] = bidders[bidder].bids[i+1];
        
        return all_bids;
    }
    
    function getTeirs () constant returns (uint[]) {
        uint[] memory all_teirs = new uint[](total_teirs);
        uint current_teir = teirs[top_teir].value; 
        for (uint i = 0; i < total_teirs; i++) {
            all_teirs[i] = current_teir;
            current_teir = teirs[current_teir].teir_below;
        }
        
        return all_teirs;
    }
    
    function getBidOwner (uint bid_id) constant returns (address) {
        return bids[bid_id].owner;
    }
    
    function getBidValue (uint bid_id) constant returns (uint) {
        return bids[bid_id].value;
    }
    
////////////////
// Internal Functions
////////////////
    
    function addNewTeir_internal (uint new_teir, uint adjacent_teir) internal {
        if (top_teir == 0) {
            teirs[new_teir] = Teir(0,new_teir,0,0,0,0);
            top_teir = new_teir;
            bottom_teir = new_teir;
        } else if (new_teir > top_teir) {
            teirs[new_teir] = Teir(0,new_teir,top_teir,0,0,0);
            teirs[top_teir].teir_above = new_teir;
            top_teir = new_teir;
        } else if (new_teir < bottom_teir) {
            teirs[new_teir] = Teir(bottom_teir,new_teir,0,0,0,0);
            teirs[bottom_teir].teir_below = new_teir;
            bottom_teir = new_teir;
        } else {
            if(teirs[adjacent_teir].line_length == 0) throw;
            if(new_teir == adjacent_teir) throw;
            
            uint teir_above;
            uint teir_below;
            
            if(new_teir > adjacent_teir) {
                teir_above = teirs[adjacent_teir].teir_above;
                teir_below = adjacent_teir;
                if(new_teir > teir_above) throw;
            } else if(new_teir < adjacent_teir) {
                teir_above = adjacent_teir;
                teir_below = teirs[adjacent_teir].teir_below;
                if(new_teir < teir_below) throw;
            }
            
            teirs[new_teir] = Teir(teir_above,new_teir,teir_below,0,0,0);
            teirs[teir_above].teir_below = new_teir;
            teirs[teir_below].teir_above = new_teir;
        }
        
        total_teirs++;
    }
    
    function removeTeir_internal (uint value) internal {
        uint teir_below = teirs[value].teir_below;
        uint teir_above = teirs[value].teir_above;
        
        if (value == top_teir && value == bottom_teir) {
            top_teir = 0;
            bottom_teir = 0;
        } else if (value == top_teir) {
            teirs[teir_below].teir_above = 0;
            top_teir = teir_below;
        } else if (value == bottom_teir) {
            teirs[teir_above].teir_below = 0;
            bottom_teir = teir_above;
        } else {
            teirs[teir_above].teir_below = teir_below;
            teirs[teir_below].teir_above = teir_above;
        }
        
        delete teirs[value];
        total_teirs--;
    }
    
    function addNewBid_internal () internal {
        current_bids_open++;
        total_bids_made++;
        uint new_bid_id = total_bids_made;
        
        teirs[msg.value].line[new_bid_id] = SpotInLine(back_of_line_id,new_bid_id,0);
        
        if (teirs[msg.value].line_length == 0)
            teirs[msg.value].front_of_line_id = new_bid_id;
            
        uint back_of_line_id = teirs[msg.value].back_of_line_id;
        if (back_of_line_id != 0)
            teirs[msg.value].line[back_of_line_id].prev = new_bid_id;
        
        teirs[msg.value].back_of_line_id = new_bid_id;
        teirs[msg.value].line_length++;
        
        bids[new_bid_id] = Bid(new_bid_id,msg.sender,msg.value,false,false);
        bidders[msg.sender].current_bids_open++;
        bidders[msg.sender].total_bids_made++;
        uint total_bids = bidders[msg.sender].total_bids_made;
        bidders[msg.sender].bids[total_bids] = new_bid_id;
        
        NewBid_event(msg.sender,new_bid_id,msg.value);
    }
    
    function removeBid_internal (uint bid_id) internal {
        Bid bid = bids[bid_id];
        if(teirs[bid.value].line_length == 0) throw;
        if(bid.accepted || bid.cancelled) throw;
        
        uint front_of_line_id = teirs[bid.value].front_of_line_id;
        uint back_of_line_id = teirs[bid.value].back_of_line_id;
        if(teirs[bid.value].line_length == 1){
            removeTeir_internal(bid.value);
        } else {
            if (bid.id == front_of_line_id) {
                uint prev = teirs[bid.value].line[bid.id].prev;
                teirs[bid.value].front_of_line_id = prev;
                teirs[bid.value].line[prev].next = 0;
            } else if (bid.id == back_of_line_id) {
                uint next = teirs[bid.value].line[bid.id].next;
                teirs[bid.value].back_of_line_id = next;
                teirs[bid.value].line[next].prev = 0;
            } else {
                uint front_id = teirs[bid.value].line[bid.id].next;
                uint back_id = teirs[bid.value].line[bid.id].prev;
                teirs[bid.value].line[front_id].prev = back_id;
                teirs[bid.value].line[back_id].next = front_id;
            }
            
            teirs[bid.value].line_length--;
            delete teirs[bid.value].line[bid_id];
        }
        
        bidders[msg.sender].current_bids_open--;
        current_bids_open--;
    }
    
////////////////
// Structs and Events
////////////////
    
    struct SpotInLine {
        uint next;
        uint bid_id;
        uint prev;
    }
    
    struct Bidder {
        uint current_bids_open;
        uint total_bids_made;
        mapping (uint => uint) bids;
    }
    
    struct Bid {
        uint id;
        address owner;
        uint value;
        bool cancelled;
        bool accepted;
    }
    
    struct Teir {
        uint teir_above;
        uint value;
        uint teir_below;
        
        uint front_of_line_id;
        uint back_of_line_id;
        uint line_length;
        mapping (uint => SpotInLine) line; //FIFO DLL
    }
    
    event NewBid_event(address bidder, uint bid_id, uint value);
}

contract MeDao is Owned, TokenController {
    
    string public version = '0.0.2';
    
    address public Founder;
    address public Vault;
    
    string public url;
    
    MiniMeToken public Token;
    OngoingAuction public Auction;
    
    uint public weekly_auction_reward;
    uint public scheduled_auction_timestamp;
    uint public auction_period;
    uint public total_proof_of_work;
    uint public cooldown_timestamp;
    uint burn_minimum = 1;
     
////////////////
// MeDao Setup
////////////////

    function MeDao (address founder, MiniMeToken token, OngoingAuction auction) {
        Founder = founder;
        Vault = founder;
        Token = token;
        Auction = auction;
    }
    
////////////////
// MeDao Functions
////////////////
    
    function startAuction () isScheduled {
        uint winning_bid_id = Auction.acceptHighestBid(Vault);
        address winner = Auction.getBidOwner(winning_bid_id);
        uint winning_bid_value = Auction.getBidValue(winning_bid_id);
        
        Token.generateTokens(winner, 1 hours);
        
        AuctionWinner_event(winner,winning_bid_value);
    }
    
    function burn (uint burnAmount, string hash) 
    onlyTokenHolders (burn_minimum) {
        if(Token.balanceOf(msg.sender) < burnAmount) throw;
        
        Token.destroyTokens(msg.sender,burnAmount);
        total_proof_of_work += burnAmount;
        
        ProofOfWork_event(msg.sender,burnAmount,hash);
    }
    
////////////////
// Owner Only
////////////////
    
    function setUrl (string newUrl) onlyOwner {
        url = newUrl;
    }
    
    function setVault (address newVault) onlyOwner {
        Vault = newVault;
    }
    
    function setBurnMinimum (uint burnMinimum) onlyOwner {
        burn_minimum = burnMinimum;
    }
    
    function setWeeklyAuctionReward (uint8 reward) onlyOwner 
    hasCooldown(7 days) {
        if(reward > 40 hours || reward == 0) throw;
        
        weekly_auction_reward = reward;
        auction_period = 5 minutes; //set to 5 minutes for testing. Normally use
                                    //7 days / weekly_auction_reward;
        scheduled_auction_timestamp = now + auction_period;
        
        NewWeeklyAuctionReward_event(weekly_auction_reward);
    }
    
    function enableTransfers (bool allowed) onlyOwner {
        Token.enableTransfers(allowed);
    }
    
////////////////
// Lost Token Retreival
////////////////

    function transferToVault (ERC20Token Token) onlyOwner {
        if(Token != address(0x0)) {
            uint balance = Token.balanceOf(this);
            if(balance == 0) throw;
            
            Token.transfer(Vault,balance);
        } else {
            if(this.balance == 0) throw;
            
            Vault.transfer(this.balance);
        }
    }

////////////////
// Token Controller
////////////////  

    function proxyPayment(address _owner) payable returns(bool) {
        _owner = _owner; //Mist refuses to compile with unused variables...
        throw;
    }

    function onTransfer(address _from, address _to, uint _amount) returns(bool) {
        _from = _from; //Mist refuses to compile with unused variables...
        _to = _to; //Mist refuses to compile with unused variables...
        _amount = _amount; //Mist refuses to compile with unused variables...
        return true;
    }

    function onApprove(address _owner, address _spender, uint _amount)
    returns(bool) {
        _owner = _owner; //Mist refuses to compile with unused variables...
        _spender = _spender; //Mist refuses to compile with unused variables...
        _amount = _amount; //Mist refuses to compile with unused variables...
        return true;    
    }
        
////////////////
// Events and Modifiers
////////////////
    
    modifier onlyTokenHolders (uint _minimum_needed) {
        uint tokens = Token.balanceOf(msg.sender);
        if(tokens < _minimum_needed) throw;
        _;
    }
    
    modifier isScheduled () {
        if (scheduled_auction_timestamp == 0) throw;
        if (now < scheduled_auction_timestamp) throw;
        
        if(now < scheduled_auction_timestamp + auction_period)
            scheduled_auction_timestamp += auction_period;
        else
            scheduled_auction_timestamp = now + auction_period;
        
        _;
    }
    
    modifier hasCooldown (uint cooldown) {
        if(now < cooldown_timestamp) throw;
        
        cooldown_timestamp = now + cooldown;
        _;
    }
    
    event AuctionWinner_event (address winner, uint ether_bid);
    event ProofOfWork_event(address sender, uint amount, string metadataHash);
    event NewWeeklyAuctionReward_event(uint new_auction_reward);
}

contract MeDaoDeployer {
    
    string version = "0.0.1";
    
    MiniMeToken Prime;
    
    uint public total_medaos;
    mapping (uint => address) public founders;
    mapping (address => MeDao ) public medaos;
    
    function MeDaoDeployer (MiniMeToken Token) {
        Prime = Token;
    }
    
    function deploy (string name) {
        if(medaos[msg.sender] != address(0x0)) throw;
        
        uint next_id = total_medaos++;
        founders[next_id] = msg.sender;
        
        address token = Prime.createCloneToken(name,0,'meether',0,true);
        OngoingAuction Auction = new OngoingAuction();
        medaos[msg.sender] = new MeDao(msg.sender,MiniMeToken(token),Auction);
        medaos[msg.sender].transferOwnership(msg.sender);
        MiniMeToken(token).changeController(medaos[msg.sender]);
        Auction.transferOwnership(medaos[msg.sender]);
        
        NewMeDao_event(msg.sender, medaos[msg.sender]);
    }
    
    event NewMeDao_event(address founder, address medao);
}

