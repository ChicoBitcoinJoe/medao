MeDao.directive('placebidButton', ['$mdDialog','$location','AuctionService','Web3Service',
function($mdDialog,$location,AuctionService,Web3Service) {
	return {
		restrict: 'E',
		scope: {
            auctionAddress: '=',
            max: '=',
            highest: '=',
            teirs: '='
		},
		replace: true,
		templateUrl: 'directives/placebid-button/placebidButtonDirective.html',
		controller: function($scope){
            setInterval(function(){
                console.log($scope.auctionAddress);
            },1000);
            
            $scope.openBidPanel = function(ev) {
                $mdDialog.show({
                    controller: DialogController,
                    templateUrl: 'directives/placebid-button/placebid-dialog.template.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose:true,
                    fullscreen: true, // Only for -xs, -sm breakpoints.
                    locals: {data:{auctionAddress:$scope.auctionAddress,max:$scope.max,highest:$scope.highest,teirs:$scope.teirs}}
                }).then(function(amountInEther) {
                    $scope.placeBid(amountInEther);
                }, function() {
                    console.log('You cancelled the dialog.');
                });
            };

            function DialogController($scope, $mdDialog, data) {
                $scope.auctionAddress = data.auctionAddress;
                $scope.max = data.max;
                $scope.highest = data.highest;
                $scope.teirs = data.teirs
                
                $scope.amount = {
                    inEther: null
                };
                
                $scope.hide = function() {
                    $mdDialog.hide();
                };

                $scope.cancel = function() {
                    $mdDialog.cancel();
                };

                $scope.answer = function(answer) {
                    $mdDialog.hide(answer);
                };
                
                $scope.validBid = function(){
                    if( $scope.amount.inEther > 0 && $scope.amount.inEther <= $scope.max)
                        return true;
                    return false;
                }
                
                $scope.setBidValue = function(value) {
                    $scope.amount.inEther = web3.fromWei(value,'ether').toNumber();
                }
            };

            $scope.goto = function(path){
                $location.path(path);
            };
            
            var getTouchingTeir = function(amountInWei) {
                return 0;
            };

            $scope.placeBid = function(amountInEther){
                var bidInWei = web3.toWei(amountInEther,'ether');
                var touchingTeir = getTouchingTeir(bidInWei);
                
                Web3Service.getCurrentAccount()
                .then(function(account){
                    return AuctionService.placeBid($scope.auctionAddress,account,bidInWei,touchingTeir);
                }).then(function(txHash){
                    return Web3Service.getTransactionReceipt(txHash);
                }).then(function(receipt){
                    console.log(receipt);
                }).catch(function(err){
                    console.error(err);
                });
            };
		},
		link : function($scope, $element, $attrs) {
            
		}
	}
}]);