MeDao.directive('startAuctionBtn', ['$q','Web3Service','MeDaoService',
function($q,Web3Service,MeDaoService) {
	return {
		restrict: 'E',
		scope: {
            owner: '='
		},
		replace: true,
		templateUrl: 'directives/start-auction-btn/startAuctionDirective.html',
		controller: function($scope){
            console.log($scope.owner);
            
            $scope.disabled = true;
            
            $scope.promises = $q.all([
                MeDaoService.getMeDaoAddress($scope.owner),
                Web3Service.getCurrentBlockNumber()
            ]);
            
            $scope.interval = setInterval(function(){
                $scope.promises.then(function(promises){
                    $scope.medaoAddress = promises[0];
                    $scope.currentBlock = promises[1];
                    //console.log($scope.medaoAddress,$scope.currentBlock);

                    return $q.all([
                        Web3Service.getBlock($scope.currentBlock),
                        MeDaoService.getAuctionTimestamp($scope.medaoAddress),
                        MeDaoService.getHighestBid($scope.medaoAddress),
                    ]); 
                }).then(function(promises){
                    var blockTimestamp = promises[0].timestamp;
                    var auctionTimestamp = promises[1].toNumber();
                    var highestBid = promises[2].toNumber();
                    //console.log(blockTimestamp,auctionTimestamp);

                    if(blockTimestamp > auctionTimestamp)
                        $scope.disabled = false;
                    else
                        $scope.disabled = true;
                    
                    if(highestBid == 0)
                        $scope.disabled = true;
                    
                }).catch(function(err){
                    console.error(err);
                });
            }, 2500);
            
            $scope.startAuction = function(){
                console.log($scope.medaoAddress);
                
                Web3Service.getCurrentAccount()
                .then(function(currentAccount){
                    return MeDaoService.startAuction($scope.medaoAddress, currentAccount);
                }).then(function(txHash){
                    $scope.waiting = true;
                    return Web3Service.getTransactionReceipt(txHash);
                }).then(function(receipt){
                    $scope.waiting = false;
                }).catch(function(err){
                    console.error(err);
                });
            }
		},
		link : function($scope, $element, $attrs) {
            
		}
	}
}]);