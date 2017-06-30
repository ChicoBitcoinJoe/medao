app.service('MiniMeToken', ['$q','Web3Service',
function ($q,Web3Service) {
    console.log('Loading MiniMeToken Service');
    
    var token = {
        abi: [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_amount","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"creationBlock","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_amount","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_newController","type":"address"}],"name":"changeController","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_blockNumber","type":"uint256"}],"name":"balanceOfAt","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"version","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_cloneTokenName","type":"string"},{"name":"_cloneDecimalUnits","type":"uint8"},{"name":"_cloneTokenSymbol","type":"string"},{"name":"_snapshotBlock","type":"uint256"},{"name":"_transfersEnabled","type":"bool"}],"name":"createCloneToken","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"parentToken","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_owner","type":"address"},{"name":"_amount","type":"uint256"}],"name":"generateTokens","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_blockNumber","type":"uint256"}],"name":"totalSupplyAt","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_amount","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"transfersEnabled","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"parentSnapShotBlock","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_amount","type":"uint256"},{"name":"_extraData","type":"bytes"}],"name":"approveAndCall","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_owner","type":"address"},{"name":"_amount","type":"uint256"}],"name":"destroyTokens","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"tokenFactory","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_transfersEnabled","type":"bool"}],"name":"enableTransfers","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"controller","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"inputs":[{"name":"_tokenFactory","type":"address"},{"name":"_parentToken","type":"address"},{"name":"_parentSnapShotBlock","type":"uint256"},{"name":"_tokenName","type":"string"},{"name":"_decimalUnits","type":"uint8"},{"name":"_tokenSymbol","type":"string"},{"name":"_transfersEnabled","type":"bool"}],"payable":false,"type":"constructor"},{"payable":true,"type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_amount","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_cloneToken","type":"address"},{"indexed":false,"name":"_snapshotBlock","type":"uint256"}],"name":"NewCloneToken","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"},{"indexed":false,"name":"_amount","type":"uint256"}],"name":"Approval","type":"event"}]
    };
        
    var service = {
        getName: function(tokenAddress){
            var deferred = $q.defer();
            var tokenInstance = web3.eth.contract(token.abi).at(tokenAddress);
            
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
            var tokenInstance = web3.eth.contract(token.abi).at(tokenAddress);
            
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
            var tokenInstance = web3.eth.contract(token.abi).at(tokenAddress);
            
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
            var tokenInstance = web3.eth.contract(token.abi).at(tokenAddress);
            
            tokenInstance.balanceOf(owner, function(err, balance) {
                if(err)
                    deferred.reject(err);
                else
                    deferred.resolve(balance);
            });
            return deferred.promise;
        },
        transfersEnabled: function(tokenAddress){
            var deferred = $q.defer();
            var TokenInstance = web3.eth.contract(token.abi).at(tokenAddress);
            
            TokenInstance.transfersEnabled(
            function(err, enabled){
                if(!err)
                    deferred.resolve(enabled);
                else 
                    deferred.reject(err);
            });
            
            return deferred.promise;
        },
        getController: function(tokenAddress) {
            var deferred = $q.defer();
            var tokenInstance = web3.eth.contract(token.abi).at(tokenAddress);
            
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
            var tokenInstance = web3.eth.contract(token.abi).at(tokenAddress);
            
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
        getCreationBlock: function(tokenAddress){
            var deferred = $q.defer();
            var tokenInstance = web3.eth.contract(token.abi).at(tokenAddress);
            
            tokenInstance.creationBlock(function(err, creationBlock) {
                if(err)
                    deferred.reject(err);
                else
                    deferred.resolve(creationBlock);
            });
            return deferred.promise;
        },
        transfer: function(tokenAddress,to,amount) {
            var deferred = $q.defer();
            var tokenInstance = web3.eth.contract(token.abi).at(tokenAddress);
            console.log(tokenAddress,to,amount);
        
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