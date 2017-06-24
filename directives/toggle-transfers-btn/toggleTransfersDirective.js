app.directive('toggleTransfersBtn', ['$q','$mdDialog','Web3Service','MeDao','Notifier',
function($q,$mdDialog,Web3Service,MeDao,Notifier) {
	return {
		restrict: 'E',
		scope: {
            owner: '='
		},
		replace: true,
		templateUrl: 'directives/toggle-transfers-btn/toggleTransfersDirective.html',
		controller: function($scope){
            
            $scope.toggleStatus = '______';
            
            $scope.refresh = function(){
                MeDao.getMeDaoAddress($scope.owner)
                    .then(function(medaoAddress){
                        $scope.medaoAddress = medaoAddress
                        return MeDao.getTokenAddress(medaoAddress);
                    }).then(function(tokenAddress){
                        return MeDao.transfersEnabled(tokenAddress);
                }).then(function(enabled){
                    if(enabled)
                        $scope.toggleStatus = 'disable'
                    else
                        $scope.toggleStatus = 'enable'
                })
            };
            
            $scope.toggleTransfers = function(){
                MeDao.getMeDaoAddress($scope.owner)
                .then(function(medaoAddress){
                    $scope.medaoAddress = medaoAddress
                    return MeDao.getTokenAddress(medaoAddress);
                }).then(function(tokenAddress){
                    return $q.all([
                        Web3Service.getCurrentAccount(),
                        MeDao.transfersEnabled(tokenAddress)
                    ]);
                }).then(function(promises){
                    var currentAccount = promises[0];
                    $scope.enabled = promises[1];
                    return MeDao.enableTransfers(
                        $scope.medaoAddress,
                        currentAccount,
                        !$scope.enabled
                    );
                }).then(function(txHash){
                    var action;
                    if($scope.enabled)
                        action = 'Disable all transfers';
                    else
                        action = 'Enable transfers';

                    var message = {
                        txHash: txHash,
                        action: action
                    };

                    Notifier.notify(message);
                });
            };
            
            $scope.refresh();
            web3.eth.filter('latest', function(err,result){
                if(!err) {
                    $scope.refresh();
                } else {
                    console.error(err);
                }
            });
		},
		link : function($scope, $element, $attrs) {
            
		}
	}
}]);