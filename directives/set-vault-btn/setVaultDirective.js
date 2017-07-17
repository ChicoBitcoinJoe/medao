app.directive('setVaultBtn', ['$q','$mdDialog','Web3Service','MeDaoPlatform','Notifier',
function($q,$mdDialog,Web3Service,Platform,Notifier) {
	return {
		restrict: 'E',
		scope: {
            founder: '='
		},
		replace: true,
		templateUrl: 'directives/set-vault-btn/setVaultDirective.html',
		controller: function($scope){
            
            function DialogController($scope, $mdDialog, data) {
                $scope.founder = data.founder;
                
                $scope.vault = {
                    address: null,
                    current: null
                };
                
                $scope.back = function() {
                    $mdDialog.hide(0);
                };
                
                Platform.getMeDaoInfo($scope.founder)
                .then(function(medaoInfo){
                    $scope.vault.current = medaoInfo[2];
                });
                
                $scope.setVault = function(){
                    Web3Service.getCurrentAccount().then(function(currentAccount){
                        return Platform.setVault(
                            $scope.founder,
                            currentAccount,
                            $scope.vault.address
                        );
                    }).then(function(txHash){
                        var action = 'Set vault hours to ' + $scope.vault.address;
                
                        var message = {
                            txHash: txHash,
                            action: action
                        };
                        
                        Notifier.notify(message);
                        
                        $scope.back();
                    });
                };
            };
            
            $scope.openVaultDialog = function(ev) {
                $mdDialog.show({
                    controller: DialogController,
                    templateUrl: 'directives/set-vault-btn/setVaultDialog.template.html',
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