app.directive('sendBtn', ['$q','$mdDialog','Web3Service','MeDao','Notifier',
function($q,$mdDialog,Web3Service,MeDao,Notifier) {
	return {
		restrict: 'E',
		scope: {
            owner: '='
		},
		replace: true,
		templateUrl: 'directives/send-btn/sendDirective.html',
		controller: function($scope){
            
            function DialogController($scope, $mdDialog, data) {
                $scope.owner = data.owner;
                
                $scope.send = {
                    type: null,
                    address: null,
                    amountInEther: null,
                    amountInSeconds: null
                };
                
                $scope.back = function() {
                    $mdDialog.hide(0);
                };

                $scope.place = function() {
                    $mdDialog.hide($scope.send.amountInEther);
                };
                
                $scope.maxEther = function() {
                    Web3Service.getCurrentAccount()
                    .then(function(account){
                        return Web3Service.getEtherBalance(account);
                    }).then(function(etherBalanceInWei){
                        $scope.send.amountInEther = web3.fromWei(etherBalanceInWei,'ether');
                    });
                };
                
                $scope.maxTime = function() {
                    MeDao.getMeDaoAddress($scope.owner)
                    .then(function(medaoAddress){
                        return $q.all([
                            Web3Service.getCurrentAccount(),
                            MeDao.getTokenAddress(medaoAddress)
                        ]);
                    }).then(function(promises){
                        var currentAccount = promises[0];
                        var tokenAddress = promises[1];
                        
                        return MeDao.getBalanceOf(tokenAddress,currentAccount);
                    }).then(function(timeBalanceInSeconds){
                        $scope.send.amountInSeconds = timeBalanceInSeconds.toNumber();
                    });
                };
                
                $scope.sendEther = function(){
                    var amountInWei = web3.toWei($scope.send.amountInEther,'ether');
                    Web3Service.sendEther($scope.send.address,amountInWei)
                    .then(function(txHash){
                        var action = 'Send ' + $scope.send.amountInEther + ' ether to ' + $scope.send.address;
                    
                        var message = {
                            txHash: txHash,
                            action: action
                        };

                        Notifier.notify(message);
                        
                        $scope.back();
                    });
                };

                $scope.sendTime = function(){
                    MeDao.getMeDaoAddress($scope.owner)
                    .then(function(medaoAddress){
                        return MeDao.getTokenAddress(medaoAddress);
                    }).then(function(tokenAddress){
                        return MeDao.transfer(
                            tokenAddress,
                            $scope.send.address,
                            $scope.send.amountInSeconds
                        );
                    }).then(function(txHash){
                        var action = 'Send ' + $scope.send.amountInSeconds + ' ether to ' + $scope.send.address;
                
                        var message = {
                            txHash: txHash,
                            action: action
                        };
                        
                        Notifier.notify(message);
                        
                        $scope.back();
                    });
                };
            }
            
            $scope.openSendDialog = function(ev) {
                $mdDialog.show({
                    controller: DialogController,
                    templateUrl: 'directives/send-btn/sendDialog.template.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose:true,
                    fullscreen: false, // Only for -xs, -sm breakpoints.
                    locals: {
                        data:{
                            owner:$scope.owner
                        }
                    }
                }).then(function(answer) {
                    console.log(answer);
                }).catch(function() {
                    console.log('You cancelled the dialog.');
                });
            };
		},
		link : function($scope, $element, $attrs) {
            
		}
	}
}]);