MeDao.controller('MeDaoViewController', ['$scope','$q','$location','$mdMedia','Web3Service','MeDaoRegistry','MeDaoService','TokenService','AuctionService',
function($scope,$q,$location,$mdMedia,Web3Service,MeDaoRegistry,MeDaoService,TokenService,AuctionService){
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
            highestBidInWei: null,
            bidsLoaded: false
        }
    };
    
//Setup
    
    MeDaoRegistry.getMeDaoAddress($scope.platform.medao.owner)
    .then(function(medaoAddress){
        $scope.platform.medao.address = medaoAddress;
        return $q.all([
            MeDaoService.getTokenAddress($scope.platform.medao.address), 
            MeDaoService.getAuctionAddress($scope.platform.medao.address),
            MeDaoService.getAuctionTimestamp($scope.platform.medao.address),
            MeDaoService.getWeeklyAuctionReward($scope.platform.medao.address),
            MeDaoService.getCooldownTimestamp($scope.platform.medao.address),
            MeDaoService.getTotalProofOfWork($scope.platform.medao.address)
        ]);
    }).then(function(promises){
        $scope.platform.token.address = promises[0];
        $scope.platform.auction.address = promises[1];
        $scope.platform.auction.timestamp = promises[2].toNumber();
        $scope.platform.auction.reward = promises[3].toNumber();
        $scope.platform.medao.cooldown = promises[4].toNumber();
        $scope.platform.medao.burned = promises[5].toNumber() / 3600;

        TokenService.getName($scope.platform.token.address)
        .then(function(tokenName){
            $scope.platform.token.name = tokenName;
        }).catch(function(err){
            console.error(err);
        });

        setInterval(function(){
            AuctionService.getHighestBid($scope.platform.auction.address)
            .then(function(highestBid){
                $scope.platform.auction.highestBidInWei = highestBid;
            }).catch(function(err){
                console.error(err);
            });
            
            TokenService.getCurrentSupply($scope.platform.token.address)
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

                return $q.all([
                    Web3Service.getEtherBalance(currentAccount),
                    TokenService.getBalanceOf($scope.platform.token.address, currentAccount)
                ]);
            }).then(function(promises){
                $scope.platform.account.weiBalance = promises[0];
                $scope.platform.account.secondsBalance = promises[1].toNumber();
            }).catch(function(err){
                console.error(err);
            });
        }, 1000);

    }).catch(function(err){
        console.error(err);
    });
    
//Button Functions
    
    $scope.goto = function(path){
        $location.path(path);
    };
    
//Internal
    
    
    
}]);