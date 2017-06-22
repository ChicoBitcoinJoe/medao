app.directive('setRewardBtn', ['$q','$mdDialog','Web3Service','MeDao','Notifier',
function($q,$mdDialog,Web3Service,MeDao,Notifier) {
	return {
		restrict: 'E',
		scope: {
            owner: '='
		},
		replace: true,
		templateUrl: 'directives/set-reward-btn/setRewardDirective.html',
		controller: function($scope){
            
            function DialogController($scope, $mdDialog, data) {
                $scope.owner = data.owner;
                
                $scope.reward = {
                    amountInHours: null
                };
                
                $scope.back = function() {
                    $mdDialog.hide(0);
                };
                
                $scope.setReward = function(){
                    $q.all([
                        Web3Service.getCurrentAccount(),
                        MeDao.getMeDaoAddress($scope.owner)
                    ]).then(function(promises){
                        var currentAccount = promises[0];
                        var medaoAddress = promises[1];
                        
                        return MeDao.setWeeklyAuctionReward(
                            medaoAddress,
                            currentAccount,
                            $scope.reward.amountInHours
                        );
                    }).then(function(txHash){
                        var action = 'Set weekly hours to ' + $scope.reward.amountInHours;
                
                        var message = {
                            txHash: txHash,
                            action: action
                        };
                        
                        Notifier.notify(message);
                        
                        $scope.back();
                    });
                };
            };
            
            $scope.openRewardDialog = function(ev) {
                $mdDialog.show({
                    controller: DialogController,
                    templateUrl: 'directives/set-reward-btn/setRewardDialog.template.html',
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
                    //console.log(answer);
                }).catch(function() {
                    //console.log('You cancelled the dialog.');
                });
            };
		},
		link : function($scope, $element, $attrs) {
            
		}
	}
}]);