MeDao.directive('sendBtn', ['$q','$mdDialog','Web3Service','MeDaoService','Notifier',
function($q,$mdDialog,Web3Service,MeDaoService,Notifier) {
	return {
		restrict: 'E',
		scope: {
            owner: '='
		},
		replace: true,
		templateUrl: 'directives/send-btn/sendDirective.html',
		controller: function($scope){
            console.log($scope.owner);
            
            function DialogController($scope, $mdDialog, data) {
                $scope.owner = data.owner;
                
                $scope.send = {
                    type: null,
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
                    MeDaoService.getMeDaoAddress($scope.owner)
                    .then(function(medaoAddress){
                        return $q.all([
                            Web3Service.getCurrentAccount(),
                            MeDaoService.getTokenAddress(medaoAddress)
                        ]);
                    }).then(function(promises){
                        var currentAccount = promises[0];
                        var tokenAddress = promises[1];
                        
                        return MeDaoService.getBalanceOf(tokenAddress,currentAccount);
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
                    });
                };

                $scope.sendTime = function(){
                    MeDaoService.getMeDaoAddress($scope.owner)
                    .then(function(medaoAddress){
                        return $q.all([
                            Web3Service.getCurrentAccount(),
                            MeDaoService.getTokenAddress(medaoAddress)
                        ]);
                    }).then(function(promises){
                        var currentAccount = promises[0];
                        var tokenAddress = promises[1];
                        
                        return MeDaoService.transfer(tokenAddress,$scope.send.address,$scope.send.amountInSeconds);
                    }).then(function(txHash){
                        var action = 'Send ' + $scope.send.amountInESeconds + ' ether to ' + $scope.send.address;
                
                        var message = {
                            txHash: txHash,
                            action: action
                        };
                        
                        Notifier.notify(message);
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