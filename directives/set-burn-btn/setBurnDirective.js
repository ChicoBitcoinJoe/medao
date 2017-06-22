app.directive('setBurnBtn', ['$q','$mdDialog','Web3Service','MeDao','Notifier',
function($q,$mdDialog,Web3Service,MeDao,Notifier) {
	return {
		restrict: 'E',
		scope: {
            owner: '='
		},
		replace: true,
		templateUrl: 'directives/set-burn-btn/setBurnDirective.html',
		controller: function($scope){
            
            function DialogController($scope, $mdDialog, data) {
                $scope.owner = data.owner;
                
                $scope.burn = {
                    amountInSeconds: null
                };
                
                $scope.back = function() {
                    $mdDialog.hide(0);
                };
                
                $scope.setBurnMinimum = function(){
                    $q.all([
                        Web3Service.getCurrentAccount(),
                        MeDao.getMeDaoAddress($scope.owner)
                    ]).then(function(promises){
                        var currentAccount = promises[0];
                        var medaoAddress = promises[1];
                        
                        return MeDao.setBurnMinimum(
                            medaoAddress,
                            currentAccount,
                            $scope.burn.amountInSeconds
                        );
                    }).then(function(txHash){
                        var action = 'Set burn minimum to ' + $scope.burn.amountInSeconds;
                
                        var message = {
                            txHash: txHash,
                            action: action
                        };
                        
                        Notifier.notify(message);
                        
                        $scope.back();
                    });
                };
            };
            
            $scope.openBurnDialog = function(ev) {
                $mdDialog.show({
                    controller: DialogController,
                    templateUrl: 'directives/set-burn-btn/setBurnDialog.template.html',
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