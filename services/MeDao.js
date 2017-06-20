app.service('MeDao', ['$q','Web3Service',
function ($q,Web3Service) {
    console.log('Loading MeDao Service');
    
    var version = '0.0.1';
    
    var platform = {
        registry:{
            address:'0xea60BAEe84D1019bad8ae63f42a4D08d9acE00bD',
            abi: [{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"medaos","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"total_medaos","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"name","type":"string"}],"name":"deploy","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"founders","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"inputs":[{"name":"Token","type":"address"}],"payable":false,"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"founder","type":"address"},{"indexed":false,"name":"medao","type":"address"}],"name":"NewMeDao_event","type":"event"}]
        },
        medao:{
            abi: [{"constant":true,"inputs":[],"name":"auction_period","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"cooldown_timestamp","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"newUrl","type":"string"}],"name":"setUrl","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"Vault","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"Founder","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"reward","type":"uint8"}],"name":"setWeeklyAuctionReward","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"version","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"url","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"Auction","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"newVault","type":"address"}],"name":"setVault","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"burnMinimum","type":"uint256"}],"name":"setBurnMinimum","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"startAuction","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"burnAmount","type":"uint256"},{"name":"metadataHash","type":"string"}],"name":"burn","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"total_proof_of_work","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"Token","type":"address"}],"name":"transferToVault","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"weekly_auction_reward","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"Token","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"scheduled_auction_timestamp","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"type":"function"},{"inputs":[{"name":"founder","type":"address"},{"name":"token","type":"address"},{"name":"auction","type":"address"}],"payable":false,"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"winner","type":"address"},{"indexed":false,"name":"ether_bid","type":"uint256"}],"name":"AuctionWinner_event","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"sender","type":"address"},{"indexed":false,"name":"amount","type":"uint256"},{"indexed":false,"name":"metadataHash","type":"string"}],"name":"ProofOfWork_event","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"new_auction_reward","type":"uint256"}],"name":"NewWeeklyAuctionReward_event","type":"event"}]
        },
        auction:{
            abi: [{"constant":false,"inputs":[{"name":"deposit_address","type":"address"}],"name":"acceptHighestBid","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"bid_id","type":"uint256"}],"name":"getBidValue","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"total_teirs","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"bottom_teir","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"bids","outputs":[{"name":"id","type":"uint256"},{"name":"owner","type":"address"},{"name":"value","type":"uint256"},{"name":"cancelled","type":"bool"},{"name":"accepted","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"getTeirs","outputs":[{"name":"","type":"uint256[]"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"current_bids_open","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"bid_id","type":"uint256"}],"name":"getBidOwner","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"top_teir","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"adjacentTeir","type":"uint256"}],"name":"placeBid","outputs":[],"payable":true,"type":"function"},{"constant":true,"inputs":[{"name":"bidder","type":"address"}],"name":"getBids","outputs":[{"name":"","type":"uint256[]"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"total_bids_made","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"bid_id","type":"uint256"}],"name":"removeBid","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"teirs","outputs":[{"name":"teir_above","type":"uint256"},{"name":"value","type":"uint256"},{"name":"teir_below","type":"uint256"},{"name":"front_of_line_id","type":"uint256"},{"name":"back_of_line_id","type":"uint256"},{"name":"line_length","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"bidders","outputs":[{"name":"current_bids_open","type":"uint256"},{"name":"total_bids_made","type":"uint256"}],"payable":false,"type":"function"},{"anonymous":false,"inputs":[{"indexed":false,"name":"bidder","type":"address"},{"indexed":false,"name":"bid_id","type":"uint256"},{"indexed":false,"name":"value","type":"uint256"}],"name":"NewBid_event","type":"event"}]
        },
        token:{
            abi:[{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_amount","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"creationBlock","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_amount","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_newController","type":"address"}],"name":"changeController","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_blockNumber","type":"uint256"}],"name":"balanceOfAt","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"version","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_cloneTokenName","type":"string"},{"name":"_cloneDecimalUnits","type":"uint8"},{"name":"_cloneTokenSymbol","type":"string"},{"name":"_snapshotBlock","type":"uint256"},{"name":"_transfersEnabled","type":"bool"}],"name":"createCloneToken","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"parentToken","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_owner","type":"address"},{"name":"_amount","type":"uint256"}],"name":"generateTokens","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_blockNumber","type":"uint256"}],"name":"totalSupplyAt","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_amount","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"transfersEnabled","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"parentSnapShotBlock","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_amount","type":"uint256"},{"name":"_extraData","type":"bytes"}],"name":"approveAndCall","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_owner","type":"address"},{"name":"_amount","type":"uint256"}],"name":"destroyTokens","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"tokenFactory","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_transfersEnabled","type":"bool"}],"name":"enableTransfers","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"controller","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"inputs":[{"name":"_tokenFactory","type":"address"},{"name":"_parentToken","type":"address"},{"name":"_parentSnapShotBlock","type":"uint256"},{"name":"_tokenName","type":"string"},{"name":"_decimalUnits","type":"uint8"},{"name":"_tokenSymbol","type":"string"},{"name":"_transfersEnabled","type":"bool"}],"payable":false,"type":"constructor"},{"payable":true,"type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_amount","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_cloneToken","type":"address"},{"indexed":false,"name":"_snapshotBlock","type":"uint256"}],"name":"NewCloneToken","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"},{"indexed":false,"name":"_amount","type":"uint256"}],"name":"Approval","type":"event"}]
        }
    };
        
    var service = {
        //Registry
        register: function(name){
            var deferred = $q.defer();
            
            var Registry = web3.eth.contract(platform.registry.abi).at(platform.registry.address);
            
            $q.all([Web3Service.getCurrentAccount(),Web3Service.getGasPrice()]).then(function(array){
                var account = array[0];
                var gasPrice = array[1];
                
                Registry.deploy(name, {from:account,gasPrice:gasPrice},
                function(err, tx){
                    if(!err)
                        deferred.resolve(tx);
                    else 
                        deferred.reject(err);
                });
            }).catch(function(err){
                deferred.reject(err);
            });
            
            return deferred.promise;
        },
        getMeDaoAddress: function(account){
            var deferred = $q.defer();
            
            var Registry = web3.eth.contract(platform.registry.abi).at(platform.registry.address);
            
            Registry.medaos(account,
            function(err, medaoAddress){
                if(!err)
                    deferred.resolve(medaoAddress);
                else 
                    deferred.reject(err);
            });
            
            return deferred.promise;
        },
        //MeDao
        getVersion: function(medaoAddress){
            var deferred = $q.defer();
            var MeDaoInstance = web3.eth.contract(platform.medao.abi).at(medaoAddress);
    
            MeDaoInstance.version(
            function(err, tokenAddress){
                if(!err)
                    deferred.resolve(tokenAddress);
                else 
                    deferred.reject(err);
            });
            
            return deferred.promise;
        },
        getTokenAddress: function(medaoAddress){
            var deferred = $q.defer();
            var MeDaoInstance = web3.eth.contract(platform.medao.abi).at(medaoAddress);
    
            MeDaoInstance.Token(
            function(err, tokenAddress){
                if(!err)
                    deferred.resolve(tokenAddress);
                else 
                    deferred.reject(err);
            });
            
            return deferred.promise;
        },
        getAuctionAddress: function(medaoAddress) {
            var deferred = $q.defer();
            var MeDaoInstance = web3.eth.contract(platform.medao.abi).at(medaoAddress);
            
            MeDaoInstance.Auction(
            function(err,auctionAddress){
                if(!err)
                    deferred.resolve(auctionAddress);
                 else 
                    deferred.reject(err);
            });
            
            return deferred.promise;
        },
        getCooldownTimestamp: function(medaoAddress){
            var deferred = $q.defer();
            var MeDaoInstance = web3.eth.contract(platform.medao.abi).at(medaoAddress);
            
            MeDaoInstance.cooldown_timestamp(
            function(err, cooldownTimestamp){
                if(!err)
                    deferred.resolve(cooldownTimestamp);
                else 
                    deferred.reject(err);
            });
            
            return deferred.promise;
        },
        getWeeklyAuctionReward: function(medaoAddress){
            var deferred = $q.defer();
            var MeDaoInstance = web3.eth.contract(platform.medao.abi).at(medaoAddress);
            
            MeDaoInstance.weekly_auction_reward(
            function(err, workHours){
                if(!err)
                    deferred.resolve(workHours);
                else 
                    deferred.reject(err);
            });
            
            return deferred.promise;
        },
        getAuctionTimestamp: function(medaoAddress){
            var deferred = $q.defer();
            var MeDaoInstance = web3.eth.contract(platform.medao.abi).at(medaoAddress);
            
            MeDaoInstance.scheduled_auction_timestamp(
            function(err, timestamp){
                if(!err)
                    deferred.resolve(timestamp);
                else 
                    deferred.reject(err);
            });
            
            return deferred.promise;
        },
        getAuctionPeriod: function(medaoAddress){
            var deferred = $q.defer();
            var MeDaoInstance = web3.eth.contract(platform.medao.abi).at(medaoAddress);
            
            MeDaoInstance.auction_period(
            function(err, period){
                if(!err)
                    deferred.resolve(period);
                else 
                    deferred.reject(err);
            });
            
            return deferred.promise;
        },
        getTotalProofOfWork: function(medaoAddress){
            var deferred = $q.defer();
            var MeDaoInstance = web3.eth.contract(platform.medao.abi).at(medaoAddress);
            
            MeDaoInstance.total_proof_of_work(
            function(err, totalPOW){
                if(!err)
                    deferred.resolve(totalPOW);
                else 
                    deferred.reject(err);
            });
            
            return deferred.promise;
        },
        startAuction: function(medaoAddress, account){
            var deferred = $q.defer();
            var MeDaoInstance = web3.eth.contract(platform.medao.abi).at(medaoAddress);
            
            MeDaoInstance.startAuction({from:account},
            function(err, tx){
                if(!err)
                    deferred.resolve(tx);
                else 
                    deferred.reject(err);
            });
            
            return deferred.promise;
        },
        submitProofOfWork: function(medaoAddress, account, amountInWei, comment){
            var deferred = $q.defer();
            var MeDaoInstance = web3.eth.contract(platform.medao.abi).at(medaoAddress);
            
            MeDaoInstance.burn(amountInWei, comment, {from:account},
            function(err,tx){
                if(!err){
                    deferred.resolve(tx);
                } else {
                    deferred.reject(err);
                }
            });
            
            return deferred.promise;
        },
        setWeeklyAuctionReward: function(medaoAddress, account, hours) {
            var deferred = $q.defer();
            var MeDaoInstance = web3.eth.contract(platform.medao.abi).at(medaoAddress);
            
            MeDaoInstance.setWeeklyAuctionReward(hours, {from:account},
            function(err,tx){
                if(!err){
                    deferred.resolve(tx);
                } else {
                    deferred.reject(err);
                }
            });
            
            return deferred.promise;
        },
        getProofOfWorkEvents: function(medaoAddress,numOfBlocks){
            var deferred = $q.defer();
            var MeDaoInstance = web3.eth.contract(platform.medao.abi).at(medaoAddress);
               
            Web3Service.getCurrentBlockNumber()
            .then(function(currentBlock){
                var fromBlock = currentBlock - numOfBlocks;
                var events = MeDaoInstance.ProofOfWork_event(null,{fromBlock:fromBlock});
                deferred.resolve(events);
            });
            
            return deferred.promise;
        },
        //Auction
        getHighestBid: function(auctionAddress){
            var deferred = $q.defer();
            var AuctionInstance = web3.eth.contract(platform.auction.abi).at(auctionAddress);
               
            AuctionInstance.top_teir(
            function(err, highestBid){
                if(!err){
                    deferred.resolve(highestBid);
                } else {
                    deferred.reject(err);
                }
            });
            
            return deferred.promise;
        },
        getTeirs: function(auctionAddress){
            var deferred = $q.defer();
            var AuctionInstance = web3.eth.contract(platform.auction.abi).at(auctionAddress);
            
            AuctionInstance.getTeirs(
            function(err, teirs){
                if(!err){
                    deferred.resolve(teirs);
                } else {
                    deferred.reject(err);
                }
            });

            return deferred.promise;
        },
        getTeirInfo: function(auctionAddress,teir){
            var deferred = $q.defer();
            var AuctionInstance = web3.eth.contract(platform.auction.abi).at(auctionAddress);
            
            AuctionInstance.teirs(teir,
            function(err, teirInfo){
                if(!err){
                    deferred.resolve(teirInfo);
                } else {
                    deferred.reject(err);
                }
            });

            return deferred.promise;
        },
        getTotalTeirs: function(auctionAddress){
            var deferred = $q.defer();
            var AuctionInstance = web3.eth.contract(platform.auction.abi).at(auctionAddress);
            
            AuctionInstance.total_teirs(
            function(err, total){
                if(!err){
                    deferred.resolve(total);
                } else {
                    deferred.reject(err);
                }
            });
            
            return deferred.promise;
        },
        getBid: function(auctionAddress,bid_id){
            var deferred = $q.defer();
            var AuctionInstance = web3.eth.contract(platform.auction.abi).at(auctionAddress);
            
            AuctionInstance.bids(bid_id,
            function(err, bidInfo){
                if(!err){
                    deferred.resolve(bidInfo);
                } else {
                    deferred.reject(err);
                }
            });
            
            return deferred.promise;
        },
        getBids: function(auctionAddress,bidderAddress){
            var deferred = $q.defer();
            var AuctionInstance = web3.eth.contract(platform.auction.abi).at(auctionAddress);
            
            AuctionInstance.getBids(bidderAddress,
            function(err, allBids){
                if(!err){
                    deferred.resolve(allBids);
                } else {
                    deferred.reject(err);
                }
            });
            
            return deferred.promise;
        },
        placeBid: function(auctionAddress, account, amountInWei, touchingTeir){
            var deferred = $q.defer();
            var AuctionInstance = web3.eth.contract(platform.auction.abi).at(auctionAddress);
            console.log(auctionAddress, account);
            console.log(amountInWei, touchingTeir);
            AuctionInstance.placeBid(touchingTeir, {from:account,value:amountInWei},
            function(err,tx){
                if(!err){
                    deferred.resolve(tx);
                } else {
                    deferred.reject(err);
                }
            });
            
            return deferred.promise;
        },
        removeBid: function(auctionAddress, account, bid_id){
            var deferred = $q.defer();
            var AuctionInstance = web3.eth.contract(platform.auction.abi).at(auctionAddress);
            
            AuctionInstance.removeBid(bid_id, {from:account},
            function(err,tx){
                if(!err){
                    deferred.resolve(tx);
                } else {
                    deferred.reject(err);
                }
            });
            
            return deferred.promise;
        },
        //Token
        getName: function(tokenAddress){
            var deferred = $q.defer();
            var tokenInstance = web3.eth.contract(platform.token.abi).at(tokenAddress);
            
            tokenInstance.name(function(err, name) {
                if(err)
                    deferred.reject(err);
                else
                    deferred.resolve(name);
            });
            return deferred.promise;
        },
        getSymbol: function(tokenAddress){
            var deferred = $q.defer();
            var tokenInstance = web3.eth.contract(platform.token.abi).at(tokenAddress);
            
            tokenInstance.symbol(function(err, symbol) {
                if(err)
                    deferred.reject(err);
                else
                    deferred.resolve(symbol);
            });
            return deferred.promise;
        },
        getCurrentSupply: function(tokenAddress){
            var deferred = $q.defer();
            var tokenInstance = web3.eth.contract(platform.token.abi).at(tokenAddress);
            
            tokenInstance.totalSupply(function(err, supply) {
                if(err)
                    deferred.reject(err);
                else
                    deferred.resolve(supply);
            });
            return deferred.promise;
        },
        getBalanceOf: function(tokenAddress,owner){
            var deferred = $q.defer();
            var tokenInstance = web3.eth.contract(platform.token.abi).at(tokenAddress);
            
            tokenInstance.balanceOf(owner, function(err, balance) {
                if(err)
                    deferred.reject(err);
                else
                    deferred.resolve(balance);
            });
            return deferred.promise;
        },
        getController: function(tokenAddress) {
            var deferred = $q.defer();
            var tokenInstance = web3.eth.contract(platform.token.abi).at(tokenAddress);
            
            tokenInstance.changeController(function(err, controller) {
                if(err)
                    deferred.reject(err);
                else
                    deferred.resolve(controller);
            });
            return deferred.promise;
        },
        changeController: function(tokenAddress,newController) {
            var deferred = $q.defer();
            var tokenInstance = web3.eth.contract(platform.token.abi).at(tokenAddress);
            
            Web3Service.getCurrentAccount()
            .then(function(account){
                tokenInstance.changeController(newController, {from:account},
                function(err, txHash) {
                    if(err)
                        deferred.reject(err);
                    else
                        deferred.resolve(tx);
                });
            });
            return deferred.promise;
        },
        transfer: function(tokenAddress,to,amount) {
            var deferred = $q.defer();
            var tokenInstance = web3.eth.contract(platform.token.abi).at(tokenAddress);
            
            Web3Service.getCurrentAccount()
            .then(function(from){
                tokenInstance.transfer(to, amount, {from:from},
                function(err, txHash) {
                    if(err)
                        deferred.reject(err);
                    else
                        deferred.resolve(txHash);
                });
            });
            return deferred.promise;
        }
    }
    
    return service;
}]);