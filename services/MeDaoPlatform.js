app.service('MeDaoPlatform', ['$q','Web3Service','MiniMeToken',
function ($q,Web3Service,Token) {
    console.log('Loading MeDao Platform Service');
    
    var medao = {
        platform:{
            address:'0x59dc4D214BEA35c716e0a3F61FddB237785AaC7F',
            abi: [{"constant":true,"inputs":[],"name":"minor_version","outputs":[{"name":"","type":"uint8"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"medaos","outputs":[{"name":"founder","type":"address"},{"name":"controller","type":"address"},{"name":"vault","type":"address"},{"name":"Token","type":"address"},{"name":"url","type":"string"},{"name":"timestamp","type":"uint256"},{"name":"proof_of_work","type":"uint256"},{"name":"total_clones","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"name","type":"string"}],"name":"deployMeDao","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"major_version","outputs":[{"name":"","type":"uint8"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"total_founders","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_amount","type":"uint256"}],"name":"onTransfer","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"founder","type":"address"},{"name":"workHours","type":"uint8"}],"name":"startWeek","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"founder","type":"address"},{"name":"newVault","type":"address"}],"name":"setVault","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"founder","type":"address"},{"name":"newController","type":"address"}],"name":"setController","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"founder","type":"address"},{"name":"index","type":"uint256"}],"name":"getCloneAddress","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"founder","type":"address"},{"name":"amount","type":"uint256"},{"name":"comment","type":"string"}],"name":"makePayment","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"Prime","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"founder","type":"address"},{"name":"clone_id","type":"uint256"},{"name":"newUrl","type":"string"}],"name":"setUrl","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"founders","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"},{"name":"_amount","type":"uint256"}],"name":"onApprove","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_owner","type":"address"}],"name":"proxyPayment","outputs":[{"name":"","type":"bool"}],"payable":true,"type":"function"},{"constant":true,"inputs":[{"name":"founder","type":"address"},{"name":"index","type":"uint256"}],"name":"getCloneUrl","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"founder","type":"address"},{"name":"cloneName","type":"string"},{"name":"cloneSymbol","type":"string"},{"name":"cloneUrl","type":"string"},{"name":"cloneController","type":"address"},{"name":"delayInDays","type":"uint256"}],"name":"createClone","outputs":[],"payable":false,"type":"function"},{"inputs":[{"name":"prime","type":"address"}],"payable":false,"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"founder","type":"address"},{"indexed":false,"name":"workHours","type":"uint256"}],"name":"NewWeek_event","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"founder","type":"address"},{"indexed":true,"name":"sender","type":"address"},{"indexed":false,"name":"amount","type":"uint256"},{"indexed":false,"name":"comment","type":"string"},{"indexed":false,"name":"timestamp","type":"uint256"}],"name":"Payment_event","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"founder","type":"address"},{"indexed":false,"name":"clone","type":"address"}],"name":"Clone_event","type":"event"}]
        }
    };
    
    var getMajorVersion = function () {
        var deferred = $q.defer();
            
        var Platform = web3.eth.contract(medao.platform.abi).at(medao.platform.address);

        Platform.major_version(function(err, major_version){
            if(!err)
                deferred.resolve(major_version);
            else 
                deferred.reject(err);
        });

        return deferred.promise;
    }
    
    var getMinorVersion = function () {
        var deferred = $q.defer();
            
        var Platform = web3.eth.contract(medao.platform.abi).at(medao.platform.address);

        Platform.minor_version(
        function(err, minor_version){
            if(!err)
                deferred.resolve(minor_version);
            else 
                deferred.reject(err);
        });

        return deferred.promise;
    }
    
    var service = {
        //Platform Functions
        getVersion: function() {
            var deferred = $q.defer();
            
            var Platform = web3.eth.contract(medao.platform.abi).at(medao.platform.address);
            
            $q.all([
                getMajorVersion(), 
                getMinorVersion(),
            ]).then(function(promises){
                deferred.resolve(promises);
            });
            
            return deferred.promise;
        },
        getTotalFounders: function() {
            var deferred = $q.defer();
            
            var Platform = web3.eth.contract(medao.platform.abi).at(medao.platform.address);
            
            Platform.total_founders(
            function(err, founder){
                if(!err)
                    deferred.resolve(founder);
                else 
                    deferred.reject(err);
            });
            
            return deferred.promise;
        },
        getFounderAtIndex: function(index) {
            var deferred = $q.defer();
            
            var Platform = web3.eth.contract(medao.platform.abi).at(medao.platform.address);
            
            Platform.founders(index,
            function(err, founder){
                if(!err)
                    deferred.resolve(founder);
                else 
                    deferred.reject(err);
            });
            
            return deferred.promise;
        },
        getMeDaoInfo: function(founder) {
            var deferred = $q.defer();
            
            var Platform = web3.eth.contract(medao.platform.abi).at(medao.platform.address);
            
            Platform.medaos(founder,
            function(err, medaoInfo){
                if(!err)
                    deferred.resolve(medaoInfo);
                else 
                    deferred.reject(err);
            });
            
            return deferred.promise;
        },
        deployMeDao: function (name) {
            var deferred = $q.defer();
            
            var Platform = web3.eth.contract(medao.platform.abi).at(medao.platform.address);
            
            $q.all([
                Web3Service.getCurrentAccount(),
                Web3Service.getGasPrice()
            ]).then(function(array){
                var account = array[0];
                var gasPrice = array[1];
                
                Platform.deployMeDao(name, {from:account, gasPrice:gasPrice},
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
        //MeDao Functions
        startWeek: function (founder, workHours) {
            var deferred = $q.defer();
            
            var Platform = web3.eth.contract(medao.platform.abi).at(medao.platform.address);
            
            $q.all([
                Web3Service.getCurrentAccount(),
                Web3Service.getGasPrice()
            ]).then(function(array){
                var account = array[0];
                var gasPrice = array[1];
                
                Platform.startWeek(founder, workHours, {from:account, gasPrice:gasPrice},
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
        makePayment: function (founder, amount, comment) {
            var deferred = $q.defer();
            
            var Platform = web3.eth.contract(medao.platform.abi).at(medao.platform.address);
            
            $q.all([
                Web3Service.getCurrentAccount(),
                Web3Service.getGasPrice()
            ]).then(function(array){
                var account = array[0];
                var gasPrice = array[1];
                
                Platform.makePayment(founder, amount, comment, {from:account, gasPrice:gasPrice},
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
        getPaymentEvents: function(founder,numOfBlocks){
            var deferred = $q.defer();
            
            var Platform = web3.eth.contract(medao.platform.abi).at(medao.platform.address);
               
            Web3Service.getCurrentBlockNumber()
            .then(function(currentBlock){
                var fromBlock = currentBlock - numOfBlocks;
                var filter = Platform.Payment_event(null,{fromBlock:fromBlock,address:founder,'topics':[founder]});
                deferred.resolve(filter);
            }).catch(function(err){
                deferred.reject(err);
            });
            
            return deferred.promise;
        },
        getTotalClones: function(founder){
            var deferred = $q.defer();
            
            var Platform = web3.eth.contract(medao.platform.abi).at(medao.platform.address);
               
            service.getMeDaoInfo(founder)
            .then(function(medaoInfo){
                console.log(medaoInfo[7])
                deferred.resolve(medaoInfo[7]);
            }).catch(function(err){
                deferred.reject(err);
            });
            
            return deferred.promise;
        },
        getCloneAddress: function(founder,index){
            var deferred = $q.defer();
            
            var Platform = web3.eth.contract(medao.platform.abi).at(medao.platform.address);
               
            Platform.getCloneAddress(founder,index, 
            function(err, cloneAddress){
                if(!err){
                    deferred.resolve(cloneAddress);
                } else {
                    deferred.reject(err);
                }
            });
            
            return deferred.promise;
            
        },
        getCloneUrl: function(founder,index){
        var deferred = $q.defer();
            
            var Platform = web3.eth.contract(medao.platform.abi).at(medao.platform.address);
               
            Platform.getCloneUrl(founder,index, 
            function(err, cloneUrl){
                if(!err){
                    deferred.resolve(cloneUrl);
                } else {
                    deferred.reject(err);
                }
            });
            
            return deferred.promise;
        },
        getClones: function(founder){
            var deferred = $q.defer();
            
            var Platform = web3.eth.contract(medao.platform.abi).at(medao.platform.address);
               
            service.getTotalClones(founder)
            .then(function(totalClones){
                var addressPromiseArray = [];
                var urlPromiseArray = [];
                
                for(var i = 0; i < totalClones; i++){
                    addressPromiseArray[i] = service.getCloneAddress(founder,i+1);
                    urlPromiseArray[i] = service.getCloneUrl(founder,i+1);
                }
                
                $q.all([$q.all(addressPromiseArray),$q.all(urlPromiseArray)])
                .then(function(promiseArray){
                    var addresses = promiseArray[0];
                    var urls = promiseArray[1];
                    var clones = [];
                    for(var i = 0; i < urls.length; i++){
                        var clone = {
                            id: i+1,
                            address: addresses[i],
                            name: null,
                            url: urls[i]
                        };
                        
                        clones.push(clone);
                    }
                    
                    var namePromises = [];
                    for(var i = 0; i < clones.length; i++){
                        namePromises[i] = Token.getName(clones[i].address);
                    }

                    $q.all(namePromises)
                    .then(function(promiseArray){
                        for(var i = 0; i < promiseArray.length; i++){
                            var name = promiseArray[i];
                            console.log(name);
                            clones[i].name = name;
                        }
                    });

                    deferred.resolve(clones);
                });
            }).catch(function(err){
                deferred.reject(err);
            });
            
            return deferred.promise;
        },
        createClone: function(founder,cloneName,cloneSymbol,cloneUrl,cloneController,delayInDays){
            var deferred = $q.defer();
            
            var Platform = web3.eth.contract(medao.platform.abi).at(medao.platform.address);
            
            $q.all([
                Web3Service.getCurrentAccount(),
                Web3Service.getGasPrice()
            ]).then(function(array){
                var account = array[0];
                var gasPrice = array[1];
                
                Platform.createClone(founder, cloneName, cloneSymbol, cloneUrl, cloneController, delayInDays, {from:account, gasPrice:gasPrice},
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
        setUrl: function (founder, clone_id, url) {
            var deferred = $q.defer();
            
            var Platform = web3.eth.contract(medao.platform.abi).at(medao.platform.address);
            
            $q.all([
                Web3Service.getCurrentAccount(),
                Web3Service.getGasPrice()
            ]).then(function(array){
                var account = array[0];
                var gasPrice = array[1];
                
                Platform.setUrl(founder, clone_id, url, {from:account, gasPrice:gasPrice},
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
        setVault: function (founder, newVaultAddress) {
            var deferred = $q.defer();
            
            var Platform = web3.eth.contract(medao.platform.abi).at(medao.platform.address);
            
            $q.all([
                Web3Service.getCurrentAccount(),
                Web3Service.getGasPrice()
            ]).then(function(array){
                var account = array[0];
                var gasPrice = array[1];
                
                Platform.setVault(founder, newVaultAddress, {from:account, gasPrice:gasPrice},
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
        setController: function (founder, newController) {
            var deferred = $q.defer();
            
            var Platform = web3.eth.contract(medao.platform.abi).at(medao.platform.address);
            
            $q.all([
                Web3Service.getCurrentAccount(),
                Web3Service.getGasPrice()
            ]).then(function(array){
                var account = array[0];
                var gasPrice = array[1];
                
                Platform.setController(founder, newController, {from:account, gasPrice:gasPrice},
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
    }
    
    return service;
}]);