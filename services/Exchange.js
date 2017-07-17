app.service('Exchange', ['$q','Web3Service','MiniMeToken',
function ($q,Web3Service,Token) {
    console.log('Loading Exchange Service');
    
    var medao = {
        exchange:{
            address: '0x19887cCA08b9bE4be4e25C1BA9299caaAb26c5bA',
            abi: [{"constant":true,"inputs":[{"name":"account","type":"address"}],"name":"getOrders","outputs":[{"name":"","type":"uint256[]"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"tradingPair","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"TokenA","type":"address"},{"name":"TokenB","type":"address"}],"name":"openTradingPair","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"order_id","type":"uint256"}],"name":"cancelOrder","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"TokenTake","type":"address"},{"name":"TokenGive","type":"address"},{"name":"takePrice","type":"uint256"},{"name":"nearbyKey","type":"uint256"}],"name":"placeOrder","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"order_id","type":"uint256"}],"name":"fillOrder","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"orders","outputs":[{"name":"order_id","type":"uint256"},{"name":"queue_id","type":"uint256"},{"name":"account","type":"address"},{"name":"TokenTake","type":"address"},{"name":"TokenGive","type":"address"},{"name":"takePrice","type":"uint256"},{"name":"cancelled","type":"bool"},{"name":"accepted","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"total_orders_made","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"TokenTake","type":"address"},{"name":"TokenGive","type":"address"},{"name":"numberOfOrders","type":"uint8"}],"name":"fillTopOrder","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"type":"function"},{"anonymous":false,"inputs":[{"indexed":false,"name":"account","type":"address"},{"indexed":false,"name":"order_id","type":"uint256"}],"name":"Order_event","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"account","type":"address"},{"indexed":false,"name":"order_id","type":"uint256"}],"name":"Fill_event","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"account","type":"address"},{"indexed":false,"name":"order_id","type":"uint256"}],"name":"Cancel_event","type":"event"}]
        },
        orderbook: {
            abi: [{"constant":true,"inputs":[],"name":"total_teirs","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"bottom_teir","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"getTeirs","outputs":[{"name":"","type":"uint256[]"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"item_id","type":"uint256"}],"name":"remove","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"peek","outputs":[{"name":"","type":"uint256[2]"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"top_teir","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"key","type":"uint256"},{"name":"value","type":"uint256"},{"name":"nearbyTeir","type":"uint256"}],"name":"push","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"pop","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"nonce","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"teirs","outputs":[{"name":"teir_above","type":"uint256"},{"name":"value","type":"uint256"},{"name":"teir_below","type":"uint256"},{"name":"front_of_line_id","type":"uint256"},{"name":"back_of_line_id","type":"uint256"},{"name":"line_length","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"items","outputs":[{"name":"id","type":"uint256"},{"name":"key","type":"uint256"},{"name":"value","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"type":"function"}]
        }
    };
    
    var getNearbyKey = function(takePrice) {
        
    }
    
    var service = {
        placeOrder: function(TokenTake,TokenGive,takePrice) {
            var deferred = $q.defer();
            
            var Exchange = web3.eth.contract(medao.exchange.abi).at(medao.exchange.address);
            
            $q.all([
                Web3Service.getCurrentAccount(),
                Web3Service.getGasPrice()
            ]).then(function(array){
                var account = array[0];
                var gasPrice = array[1];
                
                Exchange.placeOrder(TokenTake,TokenGive,tokenPrice,nearbyKey, {from:account, gasPrice:gasPrice},
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
        }
    };
    
    var oldservice = {
        //Auction
        getHighestBid: function(exchangeAddress){
            var deferred = $q.defer();
            var ExchangeInstance = web3.eth.contract(platform.exchange.abi).at(exchangeAddress);
               
            ExchangeInstance.top_teir(
            function(err, highestBid){
                if(!err){
                    deferred.resolve(highestBid);
                } else {
                    deferred.reject(err);
                }
            });
            
            return deferred.promise;
        },
        getTeirs: function(exchangeAddress){
            var deferred = $q.defer();
            var ExchangeInstance = web3.eth.contract(platform.exchange.abi).at(exchangeAddress);
            
            ExchangeInstance.getTeirs(
            function(err, teirs){
                if(!err){
                    deferred.resolve(teirs);
                } else {
                    deferred.reject(err);
                }
            });

            return deferred.promise;
        },
        getTeirInfo: function(exchangeAddress,teir){
            var deferred = $q.defer();
            var ExchangeInstance = web3.eth.contract(platform.exchange.abi).at(exchangeAddress);
            
            ExchangeInstance.teirs(teir,
            function(err, teirInfo){
                if(!err){
                    deferred.resolve(teirInfo);
                } else {
                    deferred.reject(err);
                }
            });

            return deferred.promise;
        },
        getTotalTeirs: function(exchangeAddress){
            var deferred = $q.defer();
            var ExchangeInstance = web3.eth.contract(platform.exchange.abi).at(exchangeAddress);
            
            ExchangeInstance.total_teirs(
            function(err, total){
                if(!err){
                    deferred.resolve(total);
                } else {
                    deferred.reject(err);
                }
            });
            
            return deferred.promise;
        },
        getBidInfo: function(exchangeAddress,bid_id){
            var deferred = $q.defer();
            var ExchangeInstance = web3.eth.contract(platform.exchange.abi).at(exchangeAddress);
            
            ExchangeInstance.bids(bid_id,
            function(err, bidInfo){
                if(!err){
                    deferred.resolve(bidInfo);
                } else {
                    deferred.reject(err);
                }
            });
            
            return deferred.promise;
        },
        getBids: function(exchangeAddress,bidderAddress){
            var deferred = $q.defer();
            var ExchangeInstance = web3.eth.contract(platform.exchange.abi).at(exchangeAddress);
            
            ExchangeInstance.getBids(bidderAddress,
            function(err, allBids){
                if(!err){
                    deferred.resolve(allBids);
                } else {
                    deferred.reject(err);
                }
            });
            
            return deferred.promise;
        },
        placeBid: function(exchangeAddress, account, amountInWei, touchingTeir){
            var deferred = $q.defer();
            var ExchangeInstance = web3.eth.contract(platform.exchange.abi).at(exchangeAddress);
            console.log(exchangeAddress, account);
            console.log(amountInWei, touchingTeir);
            ExchangeInstance.placeBid(touchingTeir, {from:account,value:amountInWei},
            function(err,tx){
                if(!err){
                    deferred.resolve(tx);
                } else {
                    deferred.reject(err);
                }
            });
            
            return deferred.promise;
        },
        removeBid: function(exchangeAddress, account, bid_id){
            var deferred = $q.defer();
            var ExchangeInstance = web3.eth.contract(platform.exchange.abi).at(exchangeAddress);
            
            ExchangeInstance.removeBid(bid_id, {from:account},
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