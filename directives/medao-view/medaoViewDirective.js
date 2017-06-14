MeDao.directive('medaoView', ['$q','$location','$mdDialog','Web3Service','MeDaoRegistry','MeDaoService','TokenService','AuctionService',
function($q,$location,$mdDialog,Web3Service,MeDaoRegistry,MeDaoService,TokenService,AuctionService) { return {
    restrict: 'E',
    scope: {
        account: '='
    },
    replace: true,
    templateUrl: 'directives/medao-view/medaoViewDirective.html',
    controller: function($scope){
        console.log('Loading MeDao belonging to: ' + $scope.account);

    //State
                
        $scope.platform = {
            account: {
                address: null,
                wei: null,
                ether: null,
                hours: null
            },
            medao: {
                address: null,
                owner: $scope.account,
                cooldown: null,
                burned: null
            },
            token: {
                address: null,
                name: null,
                supply: null,
            },
            auction: {
                address: null,
                reward: null,
                highestBid: null
            }
        };
        
        $scope.timer = {
            now: Math.floor(Date.now() / 1000),
            seconds: null,
            alarm: false,
            text: '...'
        };
        
    //Setup
        
        MeDaoRegistry.getMeDaoAddress($scope.account)
        .then(function(medaoAddress){
            $scope.platform.medao.address = medaoAddress;
            return $q.all([
                MeDaoService.getTokenAddress($scope.platform.medao.address), 
                MeDaoService.getAuctionAddress($scope.platform.medao.address),
                MeDaoService.getAuctionTimestamp($scope.platform.medao.address),
                MeDaoService.getWeeklyAuctionReward($scope.platform.medao.address),
                MeDaoService.getCooldownTimestamp($scope.platform.medao.address),
                MeDaoService.getProofOfWork($scope.platform.medao.address)
            ]);
        }).then(function(promises){
            $scope.platform.token.address = promises[0];
            $scope.platform.auction.address = promises[1];
            $scope.timer.seconds = promises[2];
            $scope.platform.auction.reward = promises[3].toNumber();
            $scope.platform.medao.cooldown = promises[4].toNumber();
            $scope.platform.medao.burned = promises[5].toNumber() / 3600;
            
            var now = Math.floor(Date.now() / 1000);
            var auctionTimerInSeconds = $scope.timer.seconds - now;
            setTimer(auctionTimerInSeconds);
            $scope.cooldownInSeconds = $scope.platform.medao.cooldown - now;
            
            TokenService.getName($scope.platform.token.address)
            .then(function(tokenName){
                $scope.platform.token.name = tokenName;
            }).catch(function(err){
                console.error(err);
            });
            
            TokenService.getCurrentSupply($scope.platform.token.address)
            .then(function(tokenSupply){
                $scope.platform.token.supply = tokenSupply.toNumber() / 3600;
            }).catch(function(err){
                console.error(err);
            });
            
            TokenService.getBalanceOf($scope.platform.token.address, $scope.account)
            .then(function(balance){
                $scope.platform.account.hours = balance.toNumber() / 3600;
            }).catch(function(err){
                console.error(err);
            });
            
            setInterval(function(){
                AuctionService.getHighestBid($scope.platform.auction.address)
                .then(function(highestBid){
                    $scope.platform.auction.highestBid = web3.fromWei(highestBid,'ether').toNumber();
                }).catch(function(err){
                    console.error(err);
                });
            }, 1000);
        
        }).catch(function(err){
            console.error(err);
        });
        
        Web3Service.getCurrentAccount()
        .then(function(currentAccount){
            $scope.platform.account.address = currentAccount;

            if($scope.platform.account.address == $scope.platform.medao.owner){
                $scope.isOwner = true;
            }
            
            return Web3Service.getEtherBalance(currentAccount);
        }).then(function(etherBalanceInWei){
            $scope.platform.account.wei = etherBalanceInWei;
            $scope.platform.account.ether = web3.fromWei(etherBalanceInWei,'ether');
        }).catch(function(err){
            console.error(err);
        });
                
        var setTimer = function(seconds){
            if(seconds > 0)
                $scope.timer.seconds = seconds;
            else
                $scope.timer.seconds = 1;
                
            clearInterval($scope.timerInterval);
            $scope.timerInterval = setInterval(function(){
                $scope.timer.seconds--;
                var seconds = $scope.timer.seconds;
                var days = Math.floor(seconds/(24*60*60));
                seconds = seconds - days*(24*60*60);
                ////console.log(days + ' days',seconds + ' seconds');
                var hours = Math.floor(seconds/(60*60));
                seconds = seconds - hours*(60*60);
                ////console.log(hours + ' hours',seconds + ' seconds');
                var minutes = Math.floor(seconds/60);
                seconds = seconds - minutes*60;
                ////console.log(minutes + ' minutes',seconds + ' seconds');

                $scope.timer.text = '';

                if(days > 0)
                    $scope.timer.text += days+'d ';
                if(hours > 0 || days > 0)
                    $scope.timer.text += hours+'h ';
                if(minutes > 0 || hours > 0 || days > 0)
                    $scope.timer.text += minutes+'m ';

                $scope.$apply(function(){
                    //console.log($scope.timer.seconds);
                    $scope.timer.text += seconds+'s ';
                    if($scope.timer.seconds <= 0){
                        $scope.timer.alarm = true;
                        clearInterval($scope.timerInterval);
                    }
                });
            }, 1000);
        };
        
    //Actions
        
        $scope.goto = function(path){
            $location.path(path);
        };
        
        $scope.openAuctionRewardPanel = function(ev) {
            $mdDialog.show({
                controller: DialogController,
                templateUrl: 'directives/medao-view/auction-reward-dialog.template.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose:true,
                fullscreen: true, // Only for -xs, -sm breakpoints.
                locals: {timer:{seconds:$scope.cooldownInSeconds}}
            }).then(function(hours) {
                $scope.setAuctionReward(hours);
            }, function() {
                console.log('You cancelled the dialog.');
            });
        };

        function DialogController($scope, $mdDialog, timer) {
            
            $scope.hours = 0;
            $scope.onCooldown = true;
            $scope.seconds = timer.seconds;
            
            var updateDialog = function(){
                if($scope.seconds > 0) {
                    setTimerText();
                    $scope.onCooldown = true;
                } else
                    $scope.onCooldown = false;
                
                return $scope.onCooldown;
            }
            
            var timerInterval = setInterval(function(){
                if(updateDialog())
                    $scope.seconds--;
                else
                    clearInterval(timerInterval);
            }, 1000)
            
            var setTimerText = function(){
                var seconds = $scope.seconds;
                
                var days = Math.floor(seconds/(24*60*60));
                seconds = seconds - days*(24*60*60);
                ////console.log(days + ' days',seconds + ' seconds');
                var hours = Math.floor(seconds/(60*60));
                seconds = seconds - hours*(60*60);
                ////console.log(hours + ' hours',seconds + ' seconds');
                var minutes = Math.floor(seconds/60);
                seconds = seconds - minutes*60;
                ////console.log(minutes + ' minutes',seconds + ' seconds');

                $scope.timerText = '';

                if(days > 0)
                    $scope.timerText += days+'d ';
                if(hours > 0 || days > 0)
                    $scope.timerText += hours+'h ';
                if(minutes > 0 || hours > 0 || days > 0)
                    $scope.timerText += minutes+'m ';

                $scope.$apply(function(){
                    $scope.timerText += seconds+'s ';
                });
            }
            
            $scope.validAuctionReward = function(){
                if( $scope.hours > 0 && $scope.hours <= 40)
                    return true;
                return false;
            }
            
            $scope.hide = function() {
                $mdDialog.hide();
            };

            $scope.cancel = function(hours) {
                $mdDialog.cancel(hours);
            };

            $scope.answer = function(answer) {
                $mdDialog.hide(answer);
            };
        };
        
        $scope.setAuctionReward = function(hours){
            console.log($scope.platform.medao.address, hours);
            
            if(hours > 0){
                MeDaoService.setWeeklyAuctionReward(
                    $scope.platform.medao.address,
                    $scope.platform.account.address,
                    hours)
                .then(function(txHash){
                    return Web3Service.getTransactionReceipt(txHash);
                }).then(function(receipt){
                    return $q.all([
                        MeDaoService.getWeeklyAuctionReward($scope.platform.medao.address),
                        MeDaoService.getAuctionTimestamp($scope.platform.medao.address),
                        MeDaoService.getCooldownTimestamp($scope.platform.medao.address)
                    ]);
                }).then(function(promises){
                    $scope.platform.auction.reward = promises[0].toNumber();
                    $scope.timer.seconds = promises[1].toNumber();
                    $scope.platform.medao.cooldown = promises[2].toNumber();
            
                    $scope.cooldownInSeconds = $scope.platform.medao.cooldown - Math.floor(Date.now() / 1000);

                    $scope.timer.now = Math.floor(Date.now() / 1000),
                    $scope.timer.alarm = false;

                    if($scope.timer.now < $scope.timer.seconds)
                        setTimer();
                    else
                        $scope.timer.alarm = true;

                }).catch(function(err){
                    console.error(err);
                });
            }
            
        };

        $scope.startAuction = function(){
            console.log($scope.platform.medao.address);
            MeDaoService.startAuction($scope.platform.medao.address,$scope.platform.account.address)
            .then(function(txHash){
                  return Web3Service.getTransactionReceipt(txHash);
            }).then(function(receipt){
                return $q.all([
                    MeDaoService.getHighestBid($scope.platform.medao.address),
                    MeDaoService.getAuctionTimestamp($scope.platform.medao.address)
                ]);
            }).then(function(promises){
                $scope.platform.auction.highestBid = web3.fromWei(promises[0],'ether').toNumber();
                $scope.timer.seconds = array[1].toNumber();
                var auctionTimerInSeconds = $scope.timer.seconds - now;
                setTimer(auctionTimerInSeconds);
            }).catch(function(err){
                console.error(err);
            });
        };
        
        /*
        $scope.submitProofOfWork = function(){
            MeDao.submitProofOfWork($scope.medao.address,$scope.medao.submitProofOfWork.burnAmount*3600, $scope.medao.submitProofOfWork.comment)
            .then(function(txHash){
                return Web3Service.getTransactionReceipt(txHash);
            }).then(function(receipt){
                //console.log(receipt);
            });
        };

        $scope.removeBid = function(){
            var bid_id = $scope.auction.removeBid.bidID;
            var medaoAddress = $scope.medao.address;

            MeDao.removeBid(medaoAddress,bid_id)
            .then(function(txHash){
                return Web3Service.getTransactionReceipt(txHash);
            }).then(function(receipt){
                populateTeirInfo(medaoAddress);
            });
        }
        */
    },
    link : function($scope, $element, $attrs) {
        
    }
}
}]);