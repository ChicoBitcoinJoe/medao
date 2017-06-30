pragma solidity ^0.4.11;

import "MiniMeToken.sol";

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
/// @dev The MeDao platform enables any person to find a free market value for 
///     their own time as well as allow anyone in the world to gain exposure to 
///     the value of that person's time. This is acheived by auctioning up to 40 
///     hours each week, 1 hour at a time, to the highest bidder. Intrinsically,
///     1 hours worth of tokens can be used to claim 1 hour of the Founder's 
///     time or it can be held on to if the holder believes this person's time 
///     might be more valuable in the future. A burn function is provided for 
///     people to make payments to the MeDao thus showing proof of work done by
///     the MeDao Founder.


contract MeDaoFactory is Owned {
    
    MiniMeToken public Token;
    
    function register (string name);
    function update (address oldMeDaoAddress, string name);
    function forwardPermissions (address auction, address newFactory);
}

contract MeDaoRegistry is Owned {
    
    uint public total_factories;
    mapping (uint => address) public factoryIndex;
    mapping (address => Factory) public factories;
    
    uint public total_medaos;
    mapping (uint => address) public founders;
    mapping (address => address) public medaos;
    
    function register (address founder, address newMeDao) onlyFactory {
        if(medaos[founder] == address(0x0)) {
            total_medaos++;
            uint next_id = total_medaos;
            founders[next_id] = founder;
            medaos[founder] = newMeDao;
            
            MeDaoRegistered_event(newMeDao);
        } else {
            address oldMeDao = medaos[founder];
            medaos[founder] = newMeDao;
            
            MeDaoUpdated_event(oldMeDao,newMeDao);
        }
    }
    
    function claimOwnership (
        address auction, 
        address oldFactory, 
        address newFactory
    ) onlyFactory {
        if(factories[newFactory].deprecated) throw;
        
        MeDaoFactory(oldFactory).forwardPermissions(auction, newFactory);
    }
    
    function addFactory (address newFactory) onlyOwner {
        if(factories[newFactory].added) throw;
        
        total_factories++;
        uint next_id = total_factories;
        factoryIndex[next_id] = newFactory;
        factories[newFactory] = Factory(true,false,false);
    }
    
    function deprecateFactory (address factory, bool unsafe) onlyOwner {
        factories[factory].deprecated = true;
        factories[factory].unsafe = unsafe;
    }
    
    struct Factory {
        bool added;
        bool deprecated;
        bool unsafe;
    }
    
    modifier onlyFactory () {
        if(!factories[msg.sender].added) throw;
        if(factories[msg.sender].deprecated) throw;
        if(factories[msg.sender].unsafe) throw;
        _;
    }
    
    event MeDaoRegistered_event(address medao);
    event MeDaoUpdated_event(address oldMeDao, address updatedMeDao);
}


contract Curated is Owned {
    address public curator;
    
    function setCurator (address newCurator) onlyOwner {
        curator = newCurator;
    }
    
    modifier onlyCurator () {
        if(msg.sender != curator) throw;
        _;
    }
}

contract OngoingAuction is Curated {
    
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
    
    function acceptHighestBid (address deposit_address) onlyCurator 
    returns (uint) {
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
                if(new_teir > teir_above) {
                    //To Do: create search function to find nearest teir on a 
                    //       best effort basis
                    throw;
                }
            } else if(new_teir < adjacent_teir) {
                teir_above = adjacent_teir;
                teir_below = teirs[adjacent_teir].teir_below;
                if(new_teir < teir_below) {
                    //To Do: create search function to find nearest teir on a 
                    //       best effort basis
                    throw;
                }
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
// Structs, Modifiers, and Events
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
    
    address public Factory;
    
    address public Founder;
    MiniMeToken public Token;
    OngoingAuction public Auction;
    
    address public Vault;
    string public url;
    
    uint public weekly_auction_reward;
    uint public auction_timestamp;
    uint public auction_period;
    uint public total_proof_of_work;
     
////////////////
// MeDao Setup
////////////////

    function MeDao (
        address factory, 
        address founder, 
        MiniMeToken token, 
        address auction,
        uint previousProofOfWork
    ) {
        Factory = factory;
        Founder = founder;
        Vault = founder;
        Token = token;
        Auction = OngoingAuction(auction);
        total_proof_of_work = previousProofOfWork;
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
    
    function burn (uint amount, string comment) {
        Token.destroyTokens(msg.sender,amount);
        total_proof_of_work += amount;
        
        ProofOfWork_event(msg.sender,amount,comment);
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
    
    function setWeeklyAuctionReward (uint8 reward) onlyOwner {
        if(reward > 40 hours || reward == 0) throw;
        
        weekly_auction_reward = reward;
        
        //Mainnet:
        //auction_period = 7 days / weekly_auction_reward;
        //Testnet:
        auction_period = 5 minutes;  
        
        auction_timestamp = now + auction_period;
        
        AuctionRewardChange_event(weekly_auction_reward);
    }
    
    function enableTransfers (bool enabled) onlyOwner {
        Token.enableTransfers(enabled);
    }
    
////////////////
// Lost Token Retreival
////////////////

    function sweepToVault (ERC20Token Token) onlyOwner {
        if(Token == address(0x0))
            Vault.transfer(this.balance);
        else
            Token.transfer(Vault,Token.balanceOf(this));
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
        
        return (Auction.curator() == address(this));
    }

    function onApprove(address _owner, address _spender, uint _amount)
    returns(bool) {
        _owner = _owner; //Mist refuses to compile with unused variables...
        _spender = _spender; //Mist refuses to compile with unused variables...
        _amount = _amount; //Mist refuses to compile with unused variables...
        
        return (Auction.curator() == address(this));   
    }
        
////////////////
// Events and Modifiers
////////////////
    
    modifier isScheduled () {
        if (auction_timestamp == 0) throw;
        if (now < auction_timestamp) throw;
        
        if(now < auction_timestamp + auction_period)
            auction_timestamp += auction_period;
        else
            auction_timestamp = now + auction_period;
        
        _;
    }
    
    event AuctionWinner_event (address winner, uint ether_bid);
    event ProofOfWork_event(address sender, uint amount, string metadataHash);
    event AuctionRewardChange_event(uint new_auction_reward);
}


contract MeDaoBase {
    address Factory;
    address public Founder;
    MiniMeToken public Token;
    address public Auction;
    uint public total_proof_of_work;
}

contract Factory is MeDaoFactory {
    
    string public version =  "0.0.1";
    
    function Factory (MiniMeToken token) {
        Token = token;
    }
    
    function register (string name) {
        address medao = MeDaoRegistry(owner).medaos(msg.sender);
        if(medao != address(0x0)) throw;
        
        address token = Token.createCloneToken(name,0,'meether',block.number,true);
        OngoingAuction Auction = new OngoingAuction();
        MeDao Medao = new MeDao(this,msg.sender,MiniMeToken(token),Auction,0);
        Medao.transferOwnership(msg.sender);
        MiniMeToken(token).changeController(Medao);
        Auction.setCurator(Medao);
        
        MeDaoRegistry(owner).register(msg.sender, Medao);
    }
    
    function update (address oldMeDaoAddress, string name) {
        if(msg.sender != Owned(oldMeDaoAddress).owner()) throw;
        
        address oldFactory = MeDao(oldMeDaoAddress).Factory();
        address Founder =  MeDao(oldMeDaoAddress).Founder();
        MiniMeToken OldToken = MeDaoBase(oldMeDaoAddress).Token();
        uint proofOfWork = MeDaoBase(oldMeDaoAddress).total_proof_of_work();
        address Auction = MeDaoBase(oldMeDaoAddress).Auction();
        
        MiniMeToken NewToken = MiniMeToken(
        OldToken.createCloneToken(
            name,
            0,
            'seconds',
            block.number,
            true
        ));
        
        MeDao Medao = new MeDao(this,Founder,NewToken,Auction,proofOfWork);
        
        Medao.transferOwnership(msg.sender);
        NewToken.changeController(Medao);
        
        MeDaoRegistry(owner).claimOwnership(Auction,oldFactory,this);
        Curated(Auction).setCurator(Medao);
        
        MeDaoRegistry(owner).register(msg.sender, Medao);
    }
    
    function forwardPermissions (address auction, address newFactory) onlyOwner {
        Owned(auction).transferOwnership(newFactory);
    }
}

