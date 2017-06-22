app.directive('removeBidBtn', ['$q','$mdDialog','Web3Service','MeDao','Notifier',
function($q,$mdDialog,Web3Service,MeDao,Notifier) {
	return {
		restrict: 'E',
		scope: {
            owner: '='
		},
		replace: true,
		templateUrl: 'directives/remove-bid-btn/removeBidDirective.html',
		controller: function($scope){
            
            function DialogController($scope, $mdDialog, data) {
                $scope.owner = data.owner;
                
                $scope.noBids = true;
                
                $scope.bids = [];
                
                $scope.remove = {
                    bidId: null
                };
                
                $scope.back = function() {
                    $mdDialog.hide(0);
                };
                
                $scope.removeBid = function(bidID){
                    $mdDialog.hide(bidID);
                };

                $scope.getPlacedBids = function(){
                    MeDao.getMeDaoAddress($scope.owner)
                    .then(function(medaoAddress){
                        return $q.all([
                            MeDao.getAuctionAddress(medaoAddress),
                            Web3Service.getCurrentAccount()
                        ]);
                    }).then(function(promises){
                        var auctionAddress = promises[0];
                        var currentAccount = promises[1];
                        //console.log(auctionAddress);
                        $scope.auctionAddress = auctionAddress;
                        return MeDao.getBids(auctionAddress,currentAccount);
                    }).then(function(bids){
                        console.log(bids);
                        if(bids.length == 0)
                            $scope.noBids = true;
                        
                        var promises = [];
                        for(var i = 0; i < bids.length; i++)
                            promises[i] = MeDao.getBidInfo($scope.auctionAddress,bids[i]);
                        
                        return $q.all(promises);
                    }).then(function(promises){
                        $scope.bids = [];
                        for(var i = 0; i < promises.length; i++){
                            var bidInfo = promises[i];
                            var bidID = bidInfo[0].toNumber();
                            var value = bidInfo[2];
                            console.log(value);
                            var cancelled = bidInfo[3];
                            var accepted = bidInfo[4];
                            console.log(cancelled,accepted);
                            if(!accepted && !cancelled){
                                console.log('Setting bids[' + i + '] to ' + value);
                                $scope.bids.push({
                                    id: bidID,
                                    value: value
                                });
                            }
                        }
                        console.log($scope.bids);
                    }).catch(function(err){
                        console.error(err);
                    });
                };
                
                $scope.getPlacedBids();
                web3.eth.filter('latest', function(error, result){
                  if (!error)
                    $scope.getPlacedBids();
                });
            }
            
            $scope.openBidDialog = function(ev) {
                $mdDialog.show({
                    controller: DialogController,
                    templateUrl: 'directives/remove-bid-btn/removeBidDialog.template.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose:true,
                    fullscreen: false, // Only for -xs, -sm breakpoints.
                    locals: {
                        data:{
                            owner:$scope.owner
                        }
                    }
                }).then(function(bidId) {
                    //console.log(bidData.ether);
                    if(bidId > 0)
                        $scope.removeBid(bidId);
                }).catch(function() {
                    //console.log('You cancelled the dialog.');
                });
            };
            
            $scope.removeBid = function(bidID){
                MeDao.getMeDaoAddress($scope.owner)
                .then(function(medaoAddress){
                    return $q.all([
                        Web3Service.getCurrentAccount(),
                        MeDao.getAuctionAddress(medaoAddress)
                    ]);
                }).then(function(promises){
                    var account = promises[0];
                    var medaoAddress = promises[1];
                    
                    return MeDao.removeBid(
                        medaoAddress,
                        account,
                        bidID
                    );
                }).then(function(txHash){
                    $scope.txHash = txHash;
                    return Web3Service.getTransactionReceipt(txHash);
                }).then(function(receipt){
                    return Web3Service.getTransaction($scope.txHash);
                }).then(function(receipt){
                    Notifier.notify('Remove bid ' + bidID);
                }).catch(function(err){
                    console.error(err);
                });
            };
		},
		link : function($scope, $element, $attrs) {
            
		}
	}
}]);