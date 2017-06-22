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
            
            $scope.updateAll = function(){
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
                    
                    $scope.noBids = false;
                    if(highestBid == 0)
                        $scope.noBids = true;
                    
                    $scope.noHours = false;
                    if(weeklyHours == 0)
                        $scope.noHours = true;
                    
                    
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
                    
                    if($scope.noBids || $scope.noHours)    
                        $scope.disabled = true;
                    else
                        $scope.disabled = false;
                    
                    console.log($scope.cooldown,$scope.disabled);
                    
                }).catch(function(err){
                    console.error(err);
                });
            };
            
            $scope.updateAll();
            web3.eth.filter('latest',function(err,result){
                if(!err)
                    $scope.updateAll();
                else
                    console.error(err);
            });
            
            $scope.startAuction = function(){
                //console.log($scope.medaoAddress);
                
                Web3Service.getCurrentAccount()
                .then(function(currentAccount){
                    return MeDao.startAuction($scope.medaoAddress, currentAccount);
                }).then(function(txHash){
                    $scope.disabled = true;
                    return Web3Service.getTransactionReceipt(txHash);
                }).then(function(receipt){
                    console.log(receipt);
                }).catch(function(err){
                    console.error(err);
                });
            }
		},
		link : function($scope, $element, $attrs) {
            
		}
	}
}]);