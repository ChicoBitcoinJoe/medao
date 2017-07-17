app.directive('paymentBtn', ['$q','$mdDialog','Web3Service','MeDaoPlatform','MiniMeToken','Notifier',
function($q,$mdDialog,Web3Service,Platform,Token,Notifier) {
	return {
		restrict: 'E',
		scope: {
            founder: '='
		},
		replace: true,
		templateUrl: 'directives/payment-btn/paymentDirective.html',
		controller: function($scope){
            
            function DialogController($scope, $mdDialog, data) {
                $scope.founder = data.founder;
                
                $scope.payment = {
                    amountInSeconds: null,
                    amountInMeeWei: null,
                    comment: null
                };
                
                $scope.back = function() {
                    $mdDialog.hide(0);
                };

                $scope.place = function() {
                    $mdDialog.hide($scope.payment.amountInEther);
                };
                
                $scope.maxTime = function() {
                    $q.all([
                        Web3Service.getCurrentAccount(),
                        Platform.getMeDaoInfo($scope.founder)
                    ]).then(function(promises){
                        var currentAccount = promises[0];
                        var tokenAddress = promises[1][3];
                        
                        return Token.getBalanceOf(tokenAddress,currentAccount);
                    }).then(function(timeBalanceInMeeWei){
                        $scope.payment.amountInSeconds = web3.fromWei(timeBalanceInMeeWei,'ether').toNumber();
                    });
                };
                
                $scope.makePayment = function(){
                    Web3Service.getCurrentAccount().then(function(currentAccount){
                        if($scope.payment.comment == null)
                            $scope.payment.comment = '';
                        
                        return Platform.makePayment(
                            $scope.founder,
                            web3.toWei($scope.payment.amountInSeconds,'ether'), 
                            $scope.payment.comment
                        );
                    }).then(function(txHash){
                        var action = 'Submit payment of ' + $scope.payment.amountInSeconds / 3600 + ' hours.';
                
                        var message = {
                            txHash: txHash,
                            action: action
                        };
                        
                        Notifier.notify(message);
                        
                        $scope.back();
                    });
                };
            }
            
            $scope.openPaymentDialog = function(ev) {
                $mdDialog.show({
                    controller: DialogController,
                    templateUrl: 'directives/payment-btn/paymentDialog.template.html',
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