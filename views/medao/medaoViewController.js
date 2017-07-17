app.controller('MeDaoViewController', ['$scope','$q','$location','Web3Service','MeDaoPlatform','MiniMeToken','Notifier',
function($scope,$q,$location,Web3Service,Platform,Token,Notifier){
    console.log('Loading MeDao View');
    
//State
    
    $scope.search = {
        text: null
    }
    
    $scope.account = {
        address: null,
        balanceInWei: null,
        balanceInMeeWei: null
    }
    
    $scope.platform = {
        major_version: null,
        minor_version: null
    }
    
    $scope.medao = {
        founder: $location.path().split('/')[1],
        controller: null,
        vault: null,
        url: null,
        timestamp: null,
        proof_of_work: null,
        token: {
            address: null,
            name: null,
            totalSupplyInWei: null
        }
    };
    
//Setup
    
    Platform.getVersion().then(function(versionInfo){
        $scope.platform.major_version = versionInfo[0].toNumber();
        $scope.platform.minor_version = versionInfo[1].toNumber();
    });
    
    var refresh = function(){
        $q.all([
            Platform.getMeDaoInfo($scope.medao.founder),
            Web3Service.getCurrentAccount()            
        ]).then(function(promises){
            var medaoInfo = promises[0];
            //console.log(medaoInfo);
            $scope.account.address = promises[1];
            $scope.medao.controller = medaoInfo[1];
            $scope.medao.vault = medaoInfo[2];
            $scope.medao.token.address = medaoInfo[3];
            $scope.medao.url = medaoInfo[4];
            $scope.medao.timestamp = medaoInfo[5];
            $scope.medao.proof_of_work = medaoInfo[6];

            Token.getName($scope.medao.token.address)
            .then(function(name){
                $scope.medao.token.name = name;
            });

            Token.getTotalSupply($scope.medao.token.address)
            .then(function(supply){
                $scope.medao.token.totalSupplyInWei = supply;
            });

            Token.getBalanceOf($scope.medao.token.address, $scope.account.address)
            .then(function(balance){
                if(balance > $scope.account.balanceInMeeWei && $scope.account.balanceInMeeWei != null){
                    var amountReceived =  web3.fromWei(balance,'ether') - web3.fromWei($scope.account.balanceInMeeWei,'ether');
                    
                    var action = 'Received ' + amountReceived / 3600  + ' hours for ' + $scope.medao.token.name;
                    
                    var message = {
                        action: action
                    };

                    Notifier.notify(message);
                }
                
                $scope.account.balanceInMeeWei = balance;
            });

            Web3Service.getEtherBalance($scope.account.address)
            .then(function(balance){
                if(balance > $scope.account.balanceInWei && $scope.account.balanceInWei != null){
                    var amountReceived =  web3.fromWei(balance,'ether') - web3.fromWei($scope.account.balanceInWei,'ether');
                    
                    if(amountReceived > 0) {
                        var action = 'Received ' + amountReceived  + ' ether';

                        var message = {
                            action: action
                        };

                        Notifier.notify(message);
                    }
                }
                    
                $scope.account.balanceInWei = balance;
            });
            
            $scope.isController = ($scope.account.address == $scope.medao.controller);
        });
    };
    
    refresh();
    web3.eth.filter('latest', function(error, result){
        if (!error) refresh();
    });
    
    
//Button Functions
    
    $scope.validateSearch = function(address){
        if(web3.isAddress(address)) {
            $scope.goto(address + '/medao');
            $scope.search.isValidAddress = true;
        } else
            $scope.search.isValidAddress = false;
    };
    
    $scope.goto = function(path){
        $location.path(path);
    };
    
    $scope.goToUrl = function(url){
        window.location.href = url;
    };

}]);