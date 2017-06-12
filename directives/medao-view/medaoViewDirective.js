MeDao.directive('medaoView', ['$q','$location','Web3Service','MeDaoRegistry','MeDaoService','TokenService','AuctionService',
function($q,$location,Web3Service,Registry,MeDaoService,TokenService,AuctionService) { return {
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
                ether: null,
                hours: null
            },
            medao: {
                address: $scope.account
            },
            token: {
                address: null,
                name: null,
                supply: null
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
            text: null
        };
        
    //Setup
        
        Registry.getMeDaoAddress($scope.account)
        .then(function(medaoAddress){
            $scope.platform.medao.address = medaoAddress;
            return $q.all([
                MeDaoService.getTokenAddress($scope.platform.medao.address), 
                MeDaoService.getAuctionAddress($scope.platform.medao.address),
                MeDaoService.getAuctionTimestamp()
            ]);
        }).then(function(promises){
            $scope.platform.token.address = promises[0];
            $scope.platform.auction.address = promises[1];
            $scope.timer.seconds = promises[2];
            
            setTimer($scope.timer.seconds);
            
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
            
            AuctionService.getHighestBid()
            .then(function(highestBid){
                $scope.platform.auction.highestBid = web3.fromWei(highestBid,'ether').toNumber();
            }).catch(function(err){
                console.error(err);
            });
        
        }).catch(function(err){
            console.error(err);
        });
        
        MeDaoService.getWeeklyAuctionReward($scope.medaoAddress)
        .then(function(reward){
            $scope.platform.auction.reward = reward.toNumber() / 3600;
        });
        
        Web3Service.getCurrentAccount()
        .then(function(currentAccount){
            $scope.platform.account.address = currentAccount;

            if($scope.platform.account.address == $scope.platform.medao.owner){
                $scope.isOwner = true;
            }
        }).catch(function(err){
            console.error(err);
        });
        
        var setTimer = function(){
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
                    $scope.timer.text += seconds+'s ';
                    if($scope.timer.seconds <= 0){
                        $scope.timer.alarm = true;
                         clearInterval($scope.interval);
                    }
                });
            }, 1000);
        };
        
    //Actions
        
        $scope.goto = function(path){
            $location.path(path);
        };

        /*

        $scope.placeBid = function(){
            var bidInWei = web3.toWei($scope.auction.placeBid.ether,'ether');
            MeDao.placeBid($scope.medao.address,bidInWei,$scope.medao.placeBid.touchingTeir)
            .then(function(txHash){
                  return Web3Service.getTransactionReceipt(txHash);
            }).then(function(receipt){
                //console.log(receipt);
                populateTeirInfo(medaoAddress);
            }).catch(function(err){
                console.error(err);
            });
        };

        $scope.startAuction = function(){
            var medaoAddress = $scope.medao.address;
            MeDao.startAuction(medaoAddress)
            .then(function(txHash){
                  return Web3Service.getTransactionReceipt(txHash);
            }).then(function(receipt){
                return $q.all([MeDao.getHighestBid($scope.medao.address), MeDao.getAuctionTimestamp($scope.medao.address)]);
            }).then(function(promises){
                $scope.auction.highestBid = web3.fromWei(promises[0],'ether').toNumber();
                $scope.auction.timestamp = array[1].toNumber();
            }).catch(function(err){
                console.error(err);
            });
        };

        $scope.submitProofOfWork = function(){
            MeDao.submitProofOfWork($scope.medao.address,$scope.medao.submitProofOfWork.burnAmount*3600, $scope.medao.submitProofOfWork.comment)
            .then(function(txHash){
                return Web3Service.getTransactionReceipt(txHash);
            }).then(function(receipt){
                //console.log(receipt);
            });
        };



        $scope.setAuctionReward = function(){
            MeDao.setWeeklyAuctionReward($scope.medao.address, $scope.medao.setAuctionReward.hours)
            .then(function(txHash){
                return Web3Service.getTransactionReceipt(txHash);
            }).then(function(receipt){
                return $q.all([MeDao.getAuctionReward($scope.medao.address),
                MeDao.getAuctionTimestamp($scope.medao.address),
                MeDao.getAuctionPeriod($scope.medao.address)]);
            }).then(function(promises){
                $scope.auction.reward = promises[0].toNumber();
                $scope.auction.timestamp = promises[1].toNumber();
                $scope.auction.period = promises[2].toNumber();

                $scope.timer.alarm = false;
                var timestamp = $scope.auction.timestamp;
                $scope.timer.seconds = timestamp - $scope.timer.now;
                //console.log(timestamp);
                //console.log($scope.timer.now);
                //console.log($scope.timer.seconds);
                if($scope.timer.now < timestamp) {
                    setTimer();
                } else {
                    $scope.timer.alarm = true;
                }
            }).catch(function(err){
                console.error(err);
            });
        };



        $scope.maxBid = function(){
            $scope.auction.placeBid.ether = $scope.currentAccount.ether.balance;
        }

        $scope.matchBid = function(){
            $scope.auction.placeBid.ether = $scope.auction.highestBid;
        }

        

        $scope.validAuctionReward = function(){
            var hours = $scope.medao.setAuctionReward.hours;
            if( hours > 0 && hours <= 40)
                return true;
            return false;
        }

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

        var populateTeirInfo = function(medaoAddress){
            $scope.total_bids = 0;
            $scope.medao.auction.teirs = [];
            MeDao.getHighestBid(medaoAddress)
            .then(function(highestBid){
                //console.log(highestBid.toNumber());
                return MeDao.getTeirInfo(medaoAddress,highestBid.toNumber());
            }).then(function(teirInfo){
                if(!teirInfo)
                    return false;
                else {
                    //console.log(teirInfo);
                    var teir_above = teirInfo[0].toNumber();
                    var teir_value = teirInfo[1].toNumber();
                    var teir_below = teirInfo[2].toNumber();
                    //console.log(teir_above,teir_below);
                    //console.log(teir_value);
                    if(teir_value != 0) {
                        //console.log('Teir Below ' + teir_value + ' is ' + teir_below);
                        //console.log('Bids on this teir is ' + teirInfo[5].toNumber());
                        $scope.medao.totalBids[teir_value] = teirInfo[5].toNumber();
                        $scope.medao.auction.teirs.push(teir_value);
                        $scope.total_bids += teirInfo[5].toNumber();
                        return MeDao.getTeirInfo(medaoAddress,teir_below);
                    } else 
                        return false;
                }
            }).then(function(teirInfo){
                if(!teirInfo)
                    return false;
                else {
                    //console.log(teirInfo);
                    var teir_above = teirInfo[0].toNumber();
                    var teir_value = teirInfo[1].toNumber();
                    var teir_below = teirInfo[2].toNumber();
                    //console.log(teir_above,teir_below);
                    //console.log(teir_value);
                    if(teir_value != 0) {
                        //console.log('Teir Below ' + teir_value + ' is ' + teir_below);
                        //console.log('Bids on this teir is ' + teirInfo[5].toNumber());
                        $scope.medao.totalBids[teir_value] = teirInfo[5].toNumber();
                        $scope.medao.auction.teirs.push(teir_value);
                        $scope.total_bids += teirInfo[5].toNumber();
                        return MeDao.getTeirInfo(medaoAddress,teir_below);
                    } else 
                        return false;
                }
            }).then(function(teirInfo){
                if(!teirInfo)
                    return false;
                else {
                    //console.log(teirInfo);
                    var teir_above = teirInfo[0].toNumber();
                    var teir_value = teirInfo[1].toNumber();
                    var teir_below = teirInfo[2].toNumber();
                    //console.log(teir_above,teir_below);
                    //console.log(teir_value);
                    if(teir_value != 0) {
                        //console.log('Teir Below ' + teir_value + ' is ' + teir_below);
                        //console.log('Bids on this teir is ' + teirInfo[5].toNumber());
                        $scope.medao.totalBids[teir_value] = teirInfo[5].toNumber();
                        $scope.medao.auction.teirs.push(teir_value);
                        $scope.total_bids += teirInfo[5].toNumber();
                        return MeDao.getTeirInfo(medaoAddress,teir_below);
                    } else 
                        return false;
                }
            }).then(function(teirInfo){
                if(!teirInfo)
                    return false;
                else {
                    //console.log(teirInfo);
                    var teir_above = teirInfo[0].toNumber();
                    var teir_value = teirInfo[1].toNumber();
                    var teir_below = teirInfo[2].toNumber();
                    //console.log(teir_above,teir_below);
                    //console.log(teir_value);
                    if(teir_value != 0) {
                        //console.log('Teir Below ' + teir_value + ' is ' + teir_below);
                        //console.log('Bids on this teir is ' + teirInfo[5].toNumber());
                        $scope.medao.totalBids[teir_value] = teirInfo[5].toNumber();
                        $scope.medao.auction.teirs.push(teir_value);
                        $scope.total_bids += teirInfo[5].toNumber();
                        return MeDao.getTeirInfo(medaoAddress,teir_below);
                    } else 
                        return false;
                }
            }).then(function(teirInfo){
                if(!teirInfo)
                    return false;
                else {
                    //console.log(teirInfo);
                    var teir_above = teirInfo[0].toNumber();
                    var teir_value = teirInfo[1].toNumber();
                    var teir_below = teirInfo[2].toNumber();
                    //console.log(teir_above,teir_below);
                    //console.log(teir_value);
                    if(teir_value != 0) {
                        //console.log('Teir Below ' + teir_value + ' is ' + teir_below);
                        //console.log('Bids on this teir is ' + teirInfo[5].toNumber());
                        $scope.medao.totalBids[teir_value] = teirInfo[5].toNumber();
                        $scope.medao.auction.teirs.push(teir_value);
                        $scope.total_bids += teirInfo[5].toNumber();
                        return MeDao.getTeirInfo(medaoAddress,teir_below);
                    } else 
                        return false;
                }
            });
        };

        var setTimer = function(){
            clearInterval($scope.interval);
            $scope.interval = setInterval(function(){
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
                    $scope.timer.text += seconds+'s ';
                    if($scope.timer.seconds <= 0){
                        $scope.timer.alarm = true;
                         clearInterval($scope.interval);
                    }
                });
            }, 1000);
        };

        var setWatcher = function(){
            $scope.watcher = setInterval(function(){
                var promisesArray = [
                    MeDao.getHighestBid($scope.medao.address), 
                    Web3Service.getEtherBalance($scope.currentAccount.address),
                    MeDao.getProofOfWork($scope.medao.address)
                ];

                $q.all(promisesArray).then(function(promises){
                    $scope.medao.auction.highestBid = web3.fromWei(promises[0],'ether').toNumber();
                    var etherBalanceInWei = promises[1];
                    $scope.currentAccount.ether.balance = web3.fromWei(etherBalanceInWei,'ether').toNumber();
                    $scope.currentAccount.ether.inWei = etherBalanceInWei.toString();
                    $scope.medao.redeemedHours = promises[2].toNumber()/3600;

                }).catch(function(err){
                    console.error(err);
                });
            },1000);
        };

        $q.all([Registry.getMeDaoAddress(MeDaoAccount),Web3Service.getCurrentAccount()])
        .then(function(array){
            console.log(array);
            $scope.medao.address =  array[0];
            $scope.currentAccount.address = array[1];
            return $q.all([
                MeDao.getToken($scope.medao.address),
                Web3Service.getEtherBalance($scope.currentAccount.address)
            ]);
        }).then(function(array){
            $scope.medao.token.address = array[0];
            var etherBalanceInWei = array[1];
            $scope.currentAccount.ether.balance = web3.fromWei(etherBalanceInWei,'ether').toNumber();
            $scope.currentAccount.ether.inWei = etherBalanceInWei.toString();
            console.log('adhere');
            return $q.all([
                MeDao.getAuctionReward($scope.medao.address),
                MeDao.getAuctionTimestamp($scope.medao.address),
                MeDao.getAuctionPeriod($scope.medao.address),
                MeDao.getProofOfWork($scope.medao.address),
                Token.getName($scope.medao.token.address),
                Token.getCurrentSupply($scope.medao.token.address),
                Token.getBalanceOf($scope.medao.token.address,$scope.currentAccount.address),
                MeDao.getHighestBid($scope.medao.address),
                MeDao.getBids($scope.medao.address,$scope.currentAccount.address)
            ]);
        }).then(function(array){
            console.log('there');
            $scope.medao.auction.reward = array[0].toNumber();
            $scope.medao.auction.timestamp = array[1].toNumber();
            $scope.medao.auction.period = array[2].toNumber();
            $scope.medao.pow = array[3].toNumber();
            $scope.medao.token.name = array[4].toString();
            $scope.medao.token.supply = Math.round(array[5].toNumber() / 3600);
            $scope.currentAccount.token.balance = array[6] / 3600;
            $scope.medao.auction.highestBid = web3.fromWei(array[7],'ether').toNumber();
            $scope.currentAccount.allBids = array[8];
            //console.log($scope.currentAccount.allBids);
            console.log('where');
            populateTeirInfo($scope.medao.address,array[7].toNumber());
            setWatcher();

            var timestamp = $scope.medao.auction.timestamp;
            $scope.timer.seconds = timestamp - $scope.timer.now;
            //console.log(timestamp);
            //console.log($scope.timer.now);
            //console.log($scope.timer.seconds);
            if($scope.timer.now < timestamp) {
                setTimer();
            } else {
                $scope.timer.alarm = true;
            }

            $scope.medao.redeemedHours = $scope.medao.pow / 3600;
            $scope.medao.outstandingHours = $scope.medao.token.supply / 3600;
        }).catch(function(err){
            console.error(err);    
        });
        */
    },
    link : function($scope, $element, $attrs) {
        
    }
}
}]);