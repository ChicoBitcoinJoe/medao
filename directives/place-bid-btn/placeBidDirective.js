app.directive('placeBidBtn', ['$q','$mdDialog','Web3Service','MeDao','Notifier',
function($q,$mdDialog,Web3Service,MeDao,Notifier) {
	return {
		restrict: 'E',
		scope: {
            owner: '='
		},
		replace: true,
		templateUrl: 'directives/place-bid-btn/placeBidDirective.html',
		controller: function($scope){
            
            function DialogController($scope, $mdDialog, data) {
                $scope.owner = data.owner;
                
                $scope.totalBids = 0;
                $scope.totalEtherBid = 0;
                $scope.teir = [];
                
                $scope.bid = {
                    amountInEther: null
                };
                
                $scope.back = function() {
                    $mdDialog.hide(0);
                };

                $scope.place = function() {
                    var touchingTeir = getTouchingTeir(web3.toWei($scope.bid.amountInEther,'ether'));
                    $mdDialog.hide({
                        ether:$scope.bid.amountInEther,
                        touchingTeir:touchingTeir
                    });
                };
                
                $scope.max = function() {
                    Web3Service.getCurrentAccount()
                    .then(function(account){
                        return Web3Service.getEtherBalance(account);
                    }).then(function(etherBalanceInWei){
                        $scope.bid.amountInEther = web3.fromWei(etherBalanceInWei,'ether').toNumber();
                    });
                };                

                $scope.getTeirData = function(){
                    MeDao.getMeDaoAddress($scope.owner)
                    .then(function(medaoAddress){
                        return MeDao.getAuctionAddress(medaoAddress);
                    }).then(function(auctionAddress){
                        //console.log(auctionAddress);
                        $scope.auctionAddress = auctionAddress;
                        return MeDao.getTeirs(auctionAddress);
                    }).then(function(teirs){
                        //console.log(teirs);
                        $scope.teirs = teirs;
                        
                        var promises = [];
                        for(var i = 0; i < teirs.length; i++)
                            promises[i] = MeDao.getTeirInfo($scope.auctionAddress,teirs[i]);
                        
                        return $q.all(promises);
                    }).then(function(promises){
                        var bids = 0;
                        var ether = 0;
                        
                        for(var i = 0; i < promises.length; i++){
                            var teirInfo = promises[i];
                            //console.log(teirInfo);
                            var value = teirInfo[1];
                            var length = teirInfo[5].toNumber();
                            var total = web3.fromWei(value,'ether') * length;
                            //console.log(total);
                            
                            bids += length;
                            ether += (web3.fromWei(value,'ether').toNumber() * length);
                            
                            $scope.teir[i] = {
                                value: value,
                                bids: length,
                                total: total
                            }
                        }
                        
                        $scope.totalBids = bids;
                        $scope.totalEtherBid = ether;
                        
                    }).catch(function(err){
                        console.error(err);
                    });
                };
                
                $scope.getTeirData();
                web3.eth.filter('latest', function(error, result){
                  if (!error)
                    $scope.getTeirData();
                });
                
                $scope.setBidAmount = function(valueInWei){
                    //console.log(valueInWei);
                    $scope.bid.amountInEther = web3.fromWei(valueInWei,'ether').toNumber();
                    //console.log($scope.bid.amountInEther);
                };
                
                var getTouchingTeir = function(amountInWei) {
                    var total = $scope.teirs.length;
                    var currentTeir = 0;

                    for(var i = 0; i < total; i++){
                        currentTeir = $scope.teirs[i].toNumber();
                        if(amountInWei >= currentTeir){
                            //console.log('touching teir: ' + currentTeir);
                            return currentTeir;
                        }
                    }

                    return currentTeir;
                };
            }
            
            $scope.openBidDialog = function(ev) {
                $mdDialog.show({
                    controller: DialogController,
                    templateUrl: 'directives/place-bid-btn/placeBidDialog.template.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose:true,
                    fullscreen: false, // Only for -xs, -sm breakpoints.
                    locals: {
                        data:{
                            owner:$scope.owner
                        }
                    }
                }).then(function(bidData) {
                    //console.log(bidData.ether);
                    if(bidData.ether > 0)
                        $scope.placeBid(bidData.ether,bidData.touchingTeir);
                }).catch(function() {
                    //console.log('You cancelled the dialog.');
                });
            };
            
            $scope.placeBid = function(amountInEther,touchingTeir){
                var bidInWei = web3.toWei(amountInEther,'ether');
                //console.log(bidInWei,touchingTeir);
                
                MeDao.getMeDaoAddress($scope.owner)
                .then(function(medaoAddress){
                    return $q.all([
                        Web3Service.getCurrentAccount(),
                        MeDao.getAuctionAddress(medaoAddress)
                    ]);
                }).then(function(promises){
                    var account = promises[0];
                    var medaoAddress = promises[1];
                    
                    return MeDao.placeBid(
                        medaoAddress,
                        account,
                        bidInWei,
                        touchingTeir
                    );
                }).then(function(txHash){
                    var action = 'Place bid of ' + amountInEther + ' ether';
                    
                    var message = {
                        txHash: txHash,
                        action: action
                    };
                    
                    Notifier.notify(message);
                }).catch(function(err){
                    console.error(err);
                });
            };
		},
		link : function($scope, $element, $attrs) {
            
		}
	}
}]);