MeDao.service('MeDao', ['$q','Web3Service',
function ($q,Web3Service) {
    console.log('Loading MeDao Register');
    
    var MeDaoContract = web3.eth.contract(
        [{"constant":true,"inputs":[],"name":"auction_period","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"cooldown_timestamp","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_newDepositAddress","type":"address"}],"name":"updateDepositAddress","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"Founder","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_reward","type":"uint8"}],"name":"setWeeklyAuctionReward","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"Token","type":"address"}],"name":"withdrawERC20Token","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"version","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"auction_reward","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"Auction","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"CloneableToken","type":"address"},{"name":"_tokenName","type":"string"},{"name":"_decimals","type":"uint8"},{"name":"_symbol","type":"string"},{"name":"_snapshotBlock","type":"uint256"},{"name":"_transfersEnabled","type":"bool"}],"name":"setup","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_burnAmount","type":"uint256"}],"name":"submitProofOfWork","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"startAuction","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"withdrawEther","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"total_proof_of_work","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"deposit_address","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"Token","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"auction_timestamp","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"type":"function"},{"inputs":[{"name":"founder","type":"address"}],"payable":false,"type":"constructor"},{"payable":true,"type":"fallback"},{"anonymous":false,"inputs":[{"indexed":false,"name":"winner","type":"address"},{"indexed":false,"name":"ether_bid","type":"uint256"}],"name":"AuctionWinner_event","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"sender","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"ProofOfWork_event","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"sender","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"Deposit_event","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"deposit_address","type":"address"}],"name":"NewDepositAddress_event","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"new_auction_reward","type":"uint256"}],"name":"NewWeeklyAuctionReward_event","type":"event"}]

    );
    
    var service = {
        getVersion: function(medaoAddress){
            var deferred = $q.defer();
            var MeDaoInstance = MeDaoContract.at(medaoAddress);
    
            MeDaoInstance.version(
            function(err, tokenAddress){
                if(!err)
                    deferred.resolve(tokenAddress);
                else 
                    deferred.reject(err);
            });
            
            return deferred.promise;
        },
        getToken: function(medaoAddress){
            var deferred = $q.defer();
            var MeDaoInstance = MeDaoContract.at(medaoAddress);
    
            MeDaoInstance.Token(
            function(err, tokenAddress){
                if(!err)
                    deferred.resolve(tokenAddress);
                else 
                    deferred.reject(err);
            });
            
            return deferred.promise;
        },
        getAuction: function(medaoAddress){
            var deferred = $q.defer();
            var MeDaoInstance = MeDaoContract.at(medaoAddress);
    
            MeDaoInstance.Auction(
            function(err, auctionAddress){
                if(!err)
                    deferred.resolve(auctionAddress);
                else 
                    deferred.reject(err);
            });
            
            return deferred.promise;
        },
        startAuction: function(medaoAddress){
            var deferred = $q.defer();
            var MeDaoInstance = MeDaoContract.at(medaoAddress);
            
            Web3Service.getCurrentAccount().then(
            function(account){
                MeDaoInstance.startAuction({from:account},
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
        getAuctionReward: function(medaoAddress){
            var deferred = $q.defer();
            var MeDaoInstance = MeDaoContract.at(medaoAddress);
    
            MeDaoInstance.auction_reward(
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
            var MeDaoInstance = MeDaoContract.at(medaoAddress);
    
            MeDaoInstance.auction_timestamp(
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
            var MeDaoInstance = MeDaoContract.at(medaoAddress);
    
            MeDaoInstance.auction_period(
            function(err, period){
                if(!err)
                    deferred.resolve(period);
                else 
                    deferred.reject(err);
            });
            
            return deferred.promise;
        },
        getProofOfWork: function(medaoAddress){
            var deferred = $q.defer();
            var MeDaoInstance = MeDaoContract.at(medaoAddress);
    
            MeDaoInstance.total_proof_of_work(
            function(err, pow){
                if(!err)
                    deferred.resolve(pow);
                else 
                    deferred.reject(err);
            });
            
            return deferred.promise;
        }
    }
    
    return service;
}]);