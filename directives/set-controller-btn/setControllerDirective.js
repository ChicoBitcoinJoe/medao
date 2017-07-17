app.directive('setControllerBtn', ['$q','$mdDialog','Web3Service','MeDaoPlatform','Notifier',
function($q,$mdDialog,Web3Service,Platform,Notifier) {
	return {
		restrict: 'E',
		scope: {
            founder: '='
		},
		replace: true,
		templateUrl: 'directives/set-controller-btn/setControllerDirective.html',
		controller: function($scope){
            
            function DialogController($scope, $mdDialog, data) {
                $scope.founder = data.founder;
                
                $scope.controller = {
                    curernt: null,
                    address: null
                };
                
                $scope.back = function() {
                    $mdDialog.hide(0);
                };
                
                Platform.getMeDaoInfo($scope.founder)
                .then(function(medaoInfo){
                    $scope.controller.current = medaoInfo[1];
                });
                
                $scope.setController = function(){
                    Web3Service.getCurrentAccount().then(function(currentAccount){
                        return Platform.setController(
                            $scope.founder,
                            currentAccount,
                            $scope.newController.address
                        );
                    }).then(function(txHash){
                        var action = 'Set controller to ' + $scope.newController.address;
                
                        var message = {
                            txHash: txHash,
                            action: action
                        };
                        
                        Notifier.notify(message);
                        
                        $scope.back();
                    }).catch(function(err){
                        console.error(err);
                    });
                };
            };
            
            $scope.openControllerDialog = function(ev) {
                $mdDialog.show({
                    controller: DialogController,
                    templateUrl: 'directives/set-controller-btn/setControllerDialog.template.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose:true,
                    fullscreen: false, // Only for -xs, -sm breakpoints.
                    locals: {
                        data:{
                            founder:$scope.founder
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