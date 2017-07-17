app.directive('receiveBtn', ['$q','$mdDialog','Web3Service','Notifier',
function($q,$mdDialog,Web3Service,Notifier) {
	return {
		restrict: 'E',
		scope: {
            founder: '='
		},
		replace: true,
		templateUrl: 'directives/receive-btn/receiveDirective.html',
		controller: function($scope){
            
            function DialogController($scope, $mdDialog, data) {
                $scope.founder = data.founder;
                
                $scope.back = function() {
                    $mdDialog.hide(0);
                };
                
               Web3Service.getCurrentAccount()
                .then(function(account){
                    $scope.account = account;
                   
                    var typeNumber = 6;
                    var errorCorrectionLevel = 'L';
                    var qr = qrcode(typeNumber, errorCorrectionLevel);
                    qr.addData(account);
                    qr.make();
                    document.getElementById('qrcode').innerHTML = qr.createImgTag();
                });
            };
            
            $scope.openReceiveDialog = function(ev) {
                $mdDialog.show({
                    controller: DialogController,
                    templateUrl: 'directives/receive-btn/receiveDialog.template.html',
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