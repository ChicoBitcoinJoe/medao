app.controller('MeDaoViewController', ['$scope','$q','$location','Web3Service','MeDao',
function($scope,$q,$location,Web3Service,MeDao){
    console.log('Loading MeDao View');
    
//State
    
    $scope.search = {
        text: null
    }
    
    $scope.platform = {
        account: {
            address: null,
            weiBalance: null,
            secondsBalance: null
        },
        medao: {
            address: null,
            owner: $location.path().split('/')[1],
            cooldown: null,
            burned: null,
            url: null
        },
        token: {
            address: null,
            name: null,
            supply: null,
        },
        auction: {
            address: null,
            reward: null,
            timestamp: null,
            timer: null,
            highestBidInWei: null,
            locked: null,
            bids: null
        }
    };
    
//Setup
    
    MeDao.getMeDaoAddress($scope.platform.medao.owner)
    .then(function(medaoAddress){
        $scope.platform.medao.address = medaoAddress;
        if(medaoAddress == '0x0000000000000000000000000000000000000000'
        || medaoAddress == '0x0')
            $scope.goto('/home')
        return $q.all([
            MeDao.getTokenAddress($scope.platform.medao.address), 
            MeDao.getAuctionAddress($scope.platform.medao.address),
            MeDao.getCooldownTimestamp($scope.platform.medao.address)
        ]);
    }).then(function(promises){
        $scope.platform.token.address = promises[0];
        $scope.platform.auction.address = promises[1];
        $scope.platform.medao.cooldown = promises[2].toNumber();
        
        MeDao.getName($scope.platform.token.address)
        .then(function(tokenName){
            $scope.platform.token.name = tokenName;
        }).catch(function(err){
            console.error(err);
        });
        
        refreshAll();
        
        web3.eth.filter('latest', function(error, result){
          if (!error)
            refreshAll();
        });

    }).catch(function(err){
        console.error(err);
    });
    
//Button Functions
    
    $scope.goto = function(path){
        $location.path(path);
    };
    
    $scope.goToUrl = function(url){
        window.location.href = url;
    };
    
//Internal
    
    var refreshAll = function(){
        MeDao.getUrl($scope.platform.medao.address)
        .then(function(url){
            $scope.platform.medao.url = url;
            console.log($scope.platform.medao.url);
        }).catch(function(err){
            console.error(err);
        });
        
        MeDao.getTeirs($scope.platform.auction.address)
        .then(function(teirs){
            //console.log(teirs);
            $scope.teirs = teirs;

            var promises = [];
            for(var i = 0; i < teirs.length; i++)
                promises[i] = MeDao.getTeirInfo($scope.platform.auction.address,teirs[i]);

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
            }

            $scope.platform.auction.bids = bids;
            $scope.platform.auction.locked = ether;

        }).catch(function(err){
            console.error(err);
        });
        
        MeDao.getWeeklyAuctionReward($scope.platform.medao.address)
        .then(function(reward){
            $scope.platform.auction.reward = reward.toNumber();
        }).catch(function(err){
            console.error(err);
        });
        
        MeDao.getAuctionTimestamp($scope.platform.medao.address)
        .then(function(timestamp){
            $scope.platform.auction.timestamp = timestamp.toNumber();
            var now = Math.floor(Date.now() / 1000);
            $scope.platform.auction.timer = $scope.platform.auction.timestamp - now;
        }).catch(function(err){
            console.error(err);
        });
        
        MeDao.getTotalProofOfWork($scope.platform.medao.address)
        .then(function(proofOfWork){
            $scope.platform.medao.burned = proofOfWork.toNumber() / 3600;
        }).catch(function(err){
            console.error(err);
        });

        MeDao.getHighestBid($scope.platform.auction.address)
        .then(function(highestBid){
            $scope.platform.auction.highestBidInWei = highestBid;
        }).catch(function(err){
            console.error(err);
        });

        MeDao.getCurrentSupply($scope.platform.token.address)
        .then(function(tokenSupply){
            $scope.platform.token.supply = tokenSupply.toNumber();
        }).catch(function(err){
            console.error(err);
        });

        Web3Service.getCurrentAccount()
        .then(function(currentAccount){
            $scope.platform.account.address = currentAccount;

            if($scope.platform.account.address == $scope.platform.medao.owner)
                $scope.isOwner = true;
            else
                $scope.isOwner = false;

            return $q.all([
                Web3Service.getEtherBalance(currentAccount),
                MeDao.getBalanceOf($scope.platform.token.address, currentAccount)
            ]);
        }).then(function(promises){
            $scope.platform.account.weiBalance = promises[0];
            $scope.platform.account.secondsBalance = promises[1].toNumber();
        }).catch(function(err){
            console.error(err);
        });
    };
    
}]);