app.directive('setOwnerBtn', ['$q','$mdDialog','Web3Service','MeDao','Notifier',
function($q,$mdDialog,Web3Service,MeDao,Notifier) {
	return {
		restrict: 'E',
		scope: {
            owner: '='
		},
		replace: true,
		templateUrl: 'directives/set-owner-btn/setOwnerDirective.html',
		controller: function($scope){
            
            function DialogController($scope, $mdDialog, data) {
                $scope.owner = data.owner;
                
                $scope.newOwner = {
                    address: null
                };
                
                $scope.back = function() {
                    $mdDialog.hide(0);
                };
                
                $scope.transferOwnership = function(){
                    $q.all([
                        Web3Service.getCurrentAccount(),
                        MeDao.getMeDaoAddress($scope.owner)
                    ]).then(function(promises){
                        console.log(promises);
                        var currentAccount = promises[0];
                        var medaoAddress = promises[1];
                        console.log(currentAccount, $scope.newOwner.address);
                        
                        return MeDao.transferOwnership(
                            medaoAddress,
                            currentAccount,
                            $scope.newOwner.address
                        );
                    }).then(function(txHash){
                        var action = 'Transferred ownership to ' + $scope.newOwner.address;
                
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
            
            $scope.openOwnerDialog = function(ev) {
                $mdDialog.show({
                    controller: DialogController,
                    templateUrl: 'directives/set-owner-btn/setOwnerDialog.template.html',
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