MeDao.service('Auction', ['$q','Web3Service',
function ($q,Web3Service) {
    console.log('Loading Auction Service');
    
    var AuctionContract = web3.eth.contract(
        [{"constant":false,"inputs":[{"name":"depositAddress","type":"address"}],"name":"acceptHighestBid","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"bid_id","type":"uint256"}],"name":"getBidValue","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"total_teirs","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"teir","outputs":[{"name":"teir_above","type":"uint256"},{"name":"value","type":"uint256"},{"name":"teir_below","type":"uint256"},{"name":"front_of_line_id","type":"uint256"},{"name":"back_of_line_id","type":"uint256"},{"name":"line_length","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"bottom_teir","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"bids","outputs":[{"name":"id","type":"uint256"},{"name":"owner","type":"address"},{"name":"value","type":"uint256"},{"name":"cancelled","type":"bool"},{"name":"accepted","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"getHighestBid","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"current_bids_open","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"bid_id","type":"uint256"}],"name":"getBidder","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"top_teir","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_touchingTeir","type":"uint256"}],"name":"placeBid","outputs":[],"payable":true,"type":"function"},{"constant":true,"inputs":[{"name":"bidder","type":"address"}],"name":"getBids","outputs":[{"name":"","type":"uint256[]"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"total_bids_made","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"bid_id","type":"uint256"}],"name":"removeBid","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"bidders","outputs":[{"name":"current_bids_open","type":"uint256"},{"name":"total_bids_made","type":"uint256"}],"payable":false,"type":"function"},{"anonymous":false,"inputs":[{"indexed":false,"name":"bidder","type":"address"},{"indexed":false,"name":"bid_id","type":"uint256"},{"indexed":false,"name":"value","type":"uint256"}],"name":"NewBid_event","type":"event"}]

    );
    
    var service = {
        getHighestBid: function(auctionAddress){
            var deferred = $q.defer();
            var AuctionInstance = AuctionContract.at(auctionAddress);
            
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
        getTeirInfo: function(auctionAddress,teir){
            var deferred = $q.defer();
            var AuctionInstance = AuctionContract.at(auctionAddress);
            
            AuctionInstance.teir(teir,
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
            var AuctionInstance = AuctionContract.at(auctionAddress);
            
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
        placeBid: function(auctionAddress, amountInWei, touchingTeir){
            var deferred = $q.defer();
            var AuctionInstance = AuctionContract.at(auctionAddress);
            
            Web3Service.getCurrentAccount()
            .then(function(account){
                console.log(account,amountInWei,touchingTeir);
                AuctionInstance.placeBid(amountInWei, touchingTeir, {from:account,value:amountInWei},
                function(err,tx){
                    if(!err){
                        deferred.resolve(tx);
                    } else {
                        deferred.reject(err);
                    }
                })
            });
            
            return deferred.promise;
        },
        removeBid: function(auctionAddress, bid_id){
            var deferred = $q.defer();
            var AuctionInstance = AuctionContract.at(auctionAddress);
            
            Web3Service.getCurrentAccount()
            .then(function(account){
                AuctionInstance.removeBid(bid_id, {from:account},
                function(err,tx){
                    if(!err){
                        deferred.resolve(tx);
                    } else {
                        deferred.reject(err);
                    }
                })
            });
            
            return deferred.promise;
        }
    }
    
    return service;
}]);