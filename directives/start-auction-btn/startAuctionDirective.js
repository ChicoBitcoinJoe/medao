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
            
            $scope.cooldown = false;
            $scope.disabled = true;
            
            $scope.interval = setInterval(function(){
                $q.all([
                    MeDao.getMeDaoAddress($scope.owner),
                    Web3Service.getCurrentBlockNumber()
                ]).then(function(promises){
                    $scope.medaoAddress = promises[0];
                    $scope.currentBlock = promises[1];
                    //console.log($scope.medaoAddress,$scope.currentBlock);

                    return MeDao.getAuctionAddress($scope.medaoAddress);
                }).then(function(auctionAddress){
                    return $q.all([
                        Web3Service.getBlock($scope.currentBlock),
                        MeDao.getAuctionTimestamp($scope.medaoAddress),
                        MeDao.getHighestBid(auctionAddress),
                        MeDao.getWeeklyAuctionReward($scope.medaoAddress)
                    ]);
                }).then(function(promises){
                    var blockTimestamp = promises[0].timestamp;
                    var auctionTimestamp = promises[1].toNumber();
                    var highestBid = promises[2].toNumber();
                    var weeklyHours = promises[3].toNumber();
                    
                    if(highestBid == 0)
                        $scope.noBids = true;
                    
                    if(weeklyHours == 0)
                        $scope.auctionDisabled = true;
                    
                    if($scope.noBids || $scope.auctionDisabled)    
                        $scope.disabled = true;
                    else
                        $scope.disabled = false;
                    
                    //console.log(blockTimestamp,$scope.blockTimestamp);
                    //console.log(auctionTimestamp, blockTimestamp)
                    if(blockTimestamp != $scope.blockTimestamp)
                        $scope.timer.seconds = auctionTimestamp - blockTimestamp;
                    //console.log($scope.timer.seconds)
                    $scope.blockTimestamp = blockTimestamp;
                    
                    if(blockTimestamp >= auctionTimestamp)
                        $scope.cooldown = false;
                    else
                        $scope.cooldown = true;
                    
                    //console.log($scope.cooldown,$scope.disabled);
                    
                }).catch(function(err){
                    console.error(err);
                });
            }, 2500);
            
            $scope.startAuction = function(){
                //console.log($scope.medaoAddress);
                
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