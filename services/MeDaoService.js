MeDao.service('MeDaoService', ['$q',
function ($q) {
    console.log('Loading MeDao Service');
    
    var MeDao = {
        contract: web3.eth.contract(
           [{"constant":true,"inputs":[],"name":"auction_period","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"burnAmount","type":"uint256"},{"name":"metadataHash","type":"string"}],"name":"submitProofOfWork","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"cooldown_timestamp","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_newDepositAddress","type":"address"}],"name":"updateDepositAddress","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"Founder","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"reward","type":"uint8"}],"name":"setWeeklyAuctionReward","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"Token","type":"address"}],"name":"withdrawERC20Token","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"withdraw_address","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"version","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"withdrawAddress","type":"address"},{"name":"CloneableToken","type":"address"},{"name":"_tokenName","type":"string"},{"name":"_decimals","type":"uint8"},{"name":"_symbol","type":"string"},{"name":"_snapshotBlock","type":"uint256"},{"name":"_transfersEnabled","type":"bool"}],"name":"setupToken","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"Auction","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"burnMinimum","type":"uint256"}],"name":"setBurnMinimum","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"startAuction","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"withdrawEther","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"total_proof_of_work","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"weekly_auction_reward","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"winner","type":"address"},{"name":"bidValue","type":"uint256"}],"name":"declareAuctionWinner","outputs":[],"payable":true,"type":"function"},{"constant":true,"inputs":[],"name":"Token","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"scheduled_auction_timestamp","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"type":"function"},{"inputs":[{"name":"founder","type":"address"},{"name":"auction","type":"address"}],"payable":false,"type":"constructor"},{"payable":true,"type":"fallback"},{"anonymous":false,"inputs":[{"indexed":false,"name":"winner","type":"address"},{"indexed":false,"name":"ether_bid","type":"uint256"}],"name":"AuctionWinner_event","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"sender","type":"address"},{"indexed":false,"name":"amount","type":"uint256"},{"indexed":false,"name":"metadataHash","type":"string"}],"name":"ProofOfWork_event","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"deposit_address","type":"address"}],"name":"NewDepositAddress_event","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"new_auction_reward","type":"uint256"}],"name":"NewWeeklyAuctionReward_event","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"sender","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"Payable_event","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"withdrawAddress","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"WithdrawEther_event","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"withdrawAddress","type":"address"},{"indexed":false,"name":"token","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"WithdrawToken_event","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"withdraw_address","type":"address"}],"name":"NewWithdrawAddress_event","type":"event"}])
    };
    
    var service = {
        getVersion: function(medaoAddress){
            var deferred = $q.defer();
            var MeDaoInstance = MeDao.contract.at(medaoAddress);
    
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
            var MeDaoInstance = MeDao.contract.at(medaoAddress);
    
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
            var MeDaoInstance = MeDao.contract.at(medaoAddress);
            
            MeDaoInstance.Auction(
            function(err,auctionAddress){
                if(!err)
                    deferred.resolve(auctionAddress);
                 else 
                    deferred.reject(err);
            });
            
            return deferred.promise;
        },
        startAuction: function(medaoAddress, account){
            var deferred = $q.defer();
            var MeDaoInstance = MeDao.contract.at(medaoAddress);
            
            MeDaoInstance.startAuction({from:account},
            function(err, tx){
                if(!err)
                    deferred.resolve(tx);
                else 
                    deferred.reject(err);
            });
            
            return deferred.promise;
        },
        getWeeklyAuctionReward: function(medaoAddress){
            var deferred = $q.defer();
            var MeDaoInstance = MeDao.contract.at(medaoAddress);
            
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
            var MeDaoInstance = MeDao.contract.at(medaoAddress);
            
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
            var MeDaoInstance = MeDao.contract.at(medaoAddress);
            
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
            var MeDaoInstance = MeDao.contract.at(medaoAddress);
            
            MeDaoInstance.total_proof_of_work(
            function(err, totalPOW){
                if(!err) {
                    console.log(totalPOW);
                    deferred.resolve(totalPOW);
                }
                    
                else 
                    deferred.reject(err);
            });
            
            return deferred.promise;
        },
        submitProofOfWork: function(medaoAddress, account, amountInWei, comment){
            var deferred = $q.defer();
            var MeDaoInstance = MeDao.contract.at(medaoAddress);
            
            MeDaoInstance.submitProofOfWork(amountInWei, comment, {from:account},
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
            var MeDaoInstance = MeDao.contract.at(medaoAddress);
            
            MeDaoInstance.setWeeklyAuctionReward(hours, {from:account},
            function(err,tx){
                if(!err){
                    deferred.resolve(tx);
                } else {
                    deferred.reject(err);
                }
            });
            
            return deferred.promise;
        }
    }
    
    return service;
}]);