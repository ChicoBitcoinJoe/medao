MeDao.directive('paymentBtn', ['$q','$mdDialog','Web3Service','MeDaoService','Notifier',
function($q,$mdDialog,Web3Service,MeDaoService,Notifier) {
	return {
		restrict: 'E',
		scope: {
            owner: '='
		},
		replace: true,
		templateUrl: 'directives/payment-btn/paymentDirective.html',
		controller: function($scope){
            console.log($scope.owner);
            
            function DialogController($scope, $mdDialog, data) {
                $scope.owner = data.owner;
                
                $scope.payment = {
                    amountInSeconds: null,
                    comment: null
                };
                
                $scope.back = function() {
                    $mdDialog.hide(0);
                };

                $scope.place = function() {
                    $mdDialog.hide($scope.payment.amountInEther);
                };
                
                $scope.maxTime = function() {
                    MeDaoService.getMeDaoAddress($scope.owner)
                    .then(function(medaoAddress){
                        return $q.all([
                            Web3Service.getCurrentAccount(),
                            MeDaoService.getTokenAddress(medaoAddress)
                        ]);
                    }).then(function(promises){
                        var currentAccount = promises[0];
                        var tokenAddress = promises[1];
                        
                        return MeDaoService.getBalanceOf(tokenAddress,currentAccount);
                    }).then(function(timeBalanceInSeconds){
                        $scope.payment.amountInSeconds = timeBalanceInSeconds.toNumber();
                    });
                };
                
                $scope.makePayment = function(){
                    $q.all([
                        Web3Service.getCurrentAccount(),
                        MeDaoService.getMeDaoAddress($scope.owner)
                    ]).then(function(promises){
                        var currentAccount = promises[0];
                        var medaoAddress = promises[1];
                        
                        if($scope.payment.comment == null)
                            $scope.payment.comment = '(no comment)';
                        
                        return MeDaoService.submitProofOfWork(
                            medaoAddress,
                            currentAccount,
                            $scope.payment.amountInSeconds, 
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
                            owner:$scope.owner
                        }
                    }
                }).then(function(answer) {
                    console.log(answer);
                }).catch(function() {
                    console.log('You cancelled the dialog.');
                });
            };
		},
		link : function($scope, $element, $attrs) {
            
		}
	}
}]);