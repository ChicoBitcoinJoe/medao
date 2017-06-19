MeDao.controller('MeDaoViewController', ['$scope','$q','$location','$mdMedia','Web3Service','MeDaoService',
function($scope,$q,$location,$mdMedia,Web3Service,MeDaoService){
    console.log('Loading MeDao View');
    
//State
    
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
            timestamp: null,
            timer: null,
            highestBidInWei: null,
            bidsLoaded: false
        }
    };
    
//Setup
    
    MeDaoService.getMeDaoAddress($scope.platform.medao.owner)
    .then(function(medaoAddress){
        $scope.platform.medao.address = medaoAddress;
        return $q.all([
            MeDaoService.getTokenAddress($scope.platform.medao.address), 
            MeDaoService.getAuctionAddress($scope.platform.medao.address),
            MeDaoService.getAuctionTimestamp($scope.platform.medao.address),
            MeDaoService.getWeeklyAuctionReward($scope.platform.medao.address),
            MeDaoService.getCooldownTimestamp($scope.platform.medao.address),
        ]);
    }).then(function(promises){
        $scope.platform.token.address = promises[0];
        $scope.platform.auction.address = promises[1];
        $scope.platform.auction.timestamp = promises[2].toNumber();
        $scope.platform.auction.reward = promises[3].toNumber();
        $scope.platform.medao.cooldown = promises[4].toNumber();
        
        var now = Math.floor(Date.now() / 1000);
        $scope.platform.auction.timer = $scope.platform.auction.timestamp - now;
        
        MeDaoService.getName($scope.platform.token.address)
        .then(function(tokenName){
            $scope.platform.token.name = tokenName;
        }).catch(function(err){
            console.error(err);
        });

        setInterval(function(){
            refreshAll();
        }, 2000);

    }).catch(function(err){
        console.error(err);
    });
    
//Button Functions
    
    $scope.goto = function(path){
        $location.path(path);
    };
    
//Internal
    
    var refreshAll = function(){
        MeDaoService.getTotalProofOfWork($scope.platform.medao.address)
        .then(function(proofOfWork){
            $scope.platform.medao.burned = proofOfWork.toNumber() / 3600;
        }).catch(function(err){
            console.error(err);
        });

        MeDaoService.getHighestBid($scope.platform.auction.address)
        .then(function(highestBid){
            $scope.platform.auction.highestBidInWei = highestBid;
        }).catch(function(err){
            console.error(err);
        });

        MeDaoService.getCurrentSupply($scope.platform.token.address)
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
                MeDaoService.getBalanceOf($scope.platform.token.address, currentAccount)
            ]);
        }).then(function(promises){
            $scope.platform.account.weiBalance = promises[0];
            $scope.platform.account.secondsBalance = promises[1].toNumber();
        }).catch(function(err){
            console.error(err);
        });
    };
    
}]);