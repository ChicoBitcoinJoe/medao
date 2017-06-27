app.service( 'Web3Service',['$q', function ($q) {
    console.log('Loading Web3Service');
    
    var web3Connected = null;
    var networkID = 0;
    var alerted = false;
    
    var accounts = {
        current: null
    };
    
    var web3Interval = setInterval(function(){
        if (typeof web3 !== "undefined") {
            try {
                web3 = new Web3(web3.currentProvider);
                web3.version.getNetwork((err, netId) => {
                    networkID = netId;
                    switch (netId) {
                        case "1":
                            console.log('Connected to mainnet');
                            web3 = null;
                            alert("Not connected to the proper network. Please connect to the ropsten test network and refresh the page to continue using this site!")
                            break
                        case "2":
                            console.log('Connected to the deprecated Morden test network.');
                            web3 = null;
                            alert("Not connected to the proper network. Please connect to the ropsten test network and refresh the page to continue using this site!")
                            break
                        case "3":
                            break
                        default:
                            console.log('Connected to an unknown network.');
                            web3 = null;
                            if(!alerted) {
                                alert("Not connected to the Ropsten network! Please connect to the Ropsten Testnet and then refresh the page to continue using this site.");
                                alerted = true;
                            }
                    }
                });
                
                if(!web3Connected && networkID == 3) {
                    web3Connected = true;
                    console.log('Successfully connected to web3 on the Ropsten Testnet!');
                    var updateAccountInterval = setInterval(function() {
                        //console.log(accounts.current,web3.eth.accounts[0]);
                        if(web3.eth.accounts[0] == null)
                            console.error('Could not fetch current account. Is web3 connected?');
                        else if(accounts.current != web3.eth.accounts[0] && accounts.current != null){
                            console.log('Account change detected. Reloading page.');
                            location.reload();
                        } else {
                            accounts.current = web3.eth.accounts[0];
                            //console.log('Account set to ' + web3.eth.accounts[0]);
                        }
                    }, 500);
                }
                
            } catch (err) {
                console.error('Connected to localhost but cannot access web3!');
                web3Connected = false;
            }
        } else {
            console.log('No web3 found. Trying to connect to localhost:8545...');
            try {
                web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
            } catch(e) {
                console.log('No local host found. Retrying in 1 second.')
            }
        }
    }, 1000);
    
    
    var service = {
		getCurrentAccount: function(){
            var deferred = $q.defer();
            
            var ticker = 0;
            var interval = setInterval(function(){
                if(accounts.current != null && accounts.current != '0x0000000000000000000000000000000000000000'){
                    console.log(accounts.current);
                    deferred.resolve(accounts.current);
                    clearInterval(interval);
                } else {
                    ticker++;
                    if(ticker >= 10){
                        deferred.reject('Took to long to retrieve account! Is web3 connected?');
                        //clearInterval(interval);
                    }
                }
            }, 500);
            
            return deferred.promise;
        },
        getEtherBalance: function(account){
            var deferred = $q.defer();
            var async_getBalance = web3.eth.getBalance(account, 
            function(err,etherBalanceInWei){
                if(!err){
                    deferred.resolve(etherBalanceInWei);
                } else {
                    deferred.reject(err);
                }
            });
            
            return deferred.promise;
        },
		getTransactionReceipt: function(txHash){
            var deferred = $q.defer();
            var async_filter = web3.eth.filter('latest', 
            function(err, blockHash) {
                if(!err){
                    var async_reciept = web3.eth.getTransactionReceipt(txHash, 
                    function(err,receipt){
                        if(!err){
                            if(receipt !== null){
                                async_filter.stopWatching();
                                //console.log(receipt);
                                deferred.resolve(receipt);
                            } else {
                                console.log("Tx not included in this block. Waiting for reciept.");
                            }
                        } else {
                            async_filter.stopWatching();
                            deferred.reject(err);
                        } 
                    });
                } else {
                    async_filter.stopWatching();
                    deferred.reject(err);
                }
            });
            
            return deferred.promise;
        },
		getTransaction: function(txHash){
            var deferred = $q.defer();
            
            web3.eth.getTransaction(txHash, 
            function(err,receipt){
                if(!err){
                    deferred.resolve(receipt);
                } else {
                    deferred.reject(err);
                } 
            });
            
            return deferred.promise;
        },
        getCurrentBlockNumber: function(){
            var deferred = $q.defer();
            var async_getCurrentBlock = web3.eth.getBlockNumber(
            function(err,number){
                if(!err){
                    deferred.resolve(number);
                } else {
                    deferred.reject(err);
                }
            });
            
            return deferred.promise;
        },
        getBlock: function(blockNumber){
            var deferred = $q.defer();
            var async_getBlock = web3.eth.getBlock(blockNumber,
            function(err,blockData){
                if(!err){
                    deferred.resolve(blockData);
                } else {
                    deferred.reject(err);
                }
            });
            
            return deferred.promise;
        },
        getGasPrice: function(gasPrice) {
            var deferred = $q.defer();
            
            web3.eth.getGasPrice(function(err, gasPrice){
                if(!err){
                    var gwei = web3.fromWei(gasPrice,'gwei');
                    if(gwei > 20)
                        gasPrice = web3.toWei(20,'gwei');
                    
                    deferred.resolve(gasPrice);
                }
                else
                    deferred.reject(err);
            });
            
            return deferred.promise;
        },
        sendEther: function(to,amountInWei){
            var deferred = $q.defer();
            
            service.getCurrentAccount()
            .then(function(from){
                web3.eth.sendTransaction({from:from,to:to,value:amountInWei},
                function(err,txHash){
                    if(!err)
                        deferred.resolve(txHash);
                    else
                        deferred.reject(err);
                });
            });
            
            return deferred.promise;
        }
	};

	return service;
}]);