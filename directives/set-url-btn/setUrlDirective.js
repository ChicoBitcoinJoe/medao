app.directive('setUrlBtn', ['$q','$mdDialog','Web3Service','MeDaoPlatform','Notifier',
function($q,$mdDialog,Web3Service,Platform,Notifier) {
	return {
		restrict: 'E',
		scope: {
            founder: '='
		},
		replace: true,
		templateUrl: 'directives/set-url-btn/setUrlDirective.html',
		controller: function($scope){
            
            function DialogController($scope, $mdDialog, data) {
                $scope.founder = data.founder;
                
                $scope.url = {
                    new: null
                };
                
                $scope.back = function() {
                    $mdDialog.hide(0);
                };
                
                $scope.setUrl = function(){
                    Web3Service.getCurrentAccount().then(function(currentAccount){
                        return Platform.setUrl(
                            $scope.founder,
                            0,
                            $scope.url.new
                        );
                    }).then(function(txHash){
                        var action = 'Set url to ' + $scope.url.new;
                
                        var message = {
                            txHash: txHash,
                            action: action
                        };
                        
                        Notifier.notify(message);
                        
                        $scope.back();
                    });
                };
            };
            
            $scope.openUrlDialog = function(ev) {
                $mdDialog.show({
                    controller: DialogController,
                    templateUrl: 'directives/set-url-btn/setUrlDialog.template.html',
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