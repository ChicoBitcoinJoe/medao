app.directive('startAuctionBtn', ['$q','Web3Service','MeDao',
function($q,Web3Service,MeDao) {
	return {
		restrict: 'E',
		scope: {
            owner: '='
		},
		replace: true,
		templateUrl: 'directives/start-auction-btn/startAuctionDirective.html',
		controller: function($scope){
            
            $scope.timer = {
                seconds: $scope.seconds,
                alarm: false
            };
            
            $scope.disabled = true;
            
            $scope.promises = $q.all([
                MeDao.getMeDaoAddress($scope.owner),
                Web3Service.getCurrentBlockNumber()
            ]);
            
            $scope.interval = setInterval(function(){
                $scope.promises.then(function(promises){
                    $scope.medaoAddress = promises[0];
                    $scope.currentBlock = promises[1];
                    //console.log($scope.medaoAddress,$scope.currentBlock);

                    return MeDao.getAuctionAddress($scope.medaoAddress);
                }).then(function(auctionAddress){
                    return $q.all([
                        Web3Service.getBlock($scope.currentBlock),
                        MeDao.getAuctionTimestamp($scope.medaoAddress),
                        MeDao.getHighestBid(auctionAddress)
                    ]);
                }).then(function(promises){
                    var blockTimestamp = promises[0].timestamp;
                    var auctionTimestamp = promises[1].toNumber();
                    var highestBid = promises[2].toNumber();
                    
                    var now = Math.floor(Date.now() / 1000);
                    $scope.timer.seconds = auctionTimestamp - now;
                    
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
                    return MeDao.startAuction($scope.medaoAddress, currentAccount);
                }).then(function(txHash){
                    $scope.waiting = true;
                    return Web3Service.getTransactionReceipt(txHash);
                }).then(function(receipt){
                    $scope.waiting = false;
                    $scope.disabled = true;
                }).catch(function(err){
                    console.error(err);
                });
            }
		},
		link : function($scope, $element, $attrs) {
            
		}
	}
}]);