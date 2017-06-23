app.directive('setUrlBtn', ['$q','$mdDialog','Web3Service','MeDao','Notifier',
function($q,$mdDialog,Web3Service,MeDao,Notifier) {
	return {
		restrict: 'E',
		scope: {
            owner: '='
		},
		replace: true,
		templateUrl: 'directives/set-url-btn/setUrlDirective.html',
		controller: function($scope){
            
            function DialogController($scope, $mdDialog, data) {
                $scope.owner = data.owner;
                
                $scope.url = {
                    new: null
                };
                
                $scope.back = function() {
                    $mdDialog.hide(0);
                };
                
                $scope.setUrl = function(){
                    $q.all([
                        Web3Service.getCurrentAccount(),
                        MeDao.getMeDaoAddress($scope.owner)
                    ]).then(function(promises){
                        var currentAccount = promises[0];
                        var medaoAddress = promises[1];
                        
                        return MeDao.setUrl(
                            medaoAddress,
                            currentAccount,
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