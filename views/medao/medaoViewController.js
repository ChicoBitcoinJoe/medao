MeDao.controller('MeDaoViewController', [ '$q', '$scope', '$location', '$mdMedia', 'Web3Service', 'MeDaoRegistry', 'MeDao', 'Token', 'Auction',
function($q,$scope,$location,$mdMedia,Web3Service,Registry,MeDao,Token,Auction){
    console.log('Loading MeDao View');
    
    var array = $location.path().split('/');
    var MeDaoAccount = array[2];
    
    $scope.view = {
        secondary: 'posts',
        panels: {
            manage: true,
            medao: true,
            posts: true,
        }
    };
    
    $scope.showPanel = function(panel){
        if(panel =='posts' || panel == 'manage')
            $scope.view.secondary = panel;
        
        $scope.view.panels.manage = false;
        $scope.view.panels.medao = false;
        $scope.view.panels.posts = false;
        
        if($scope.screenIsBig)
            $scope.view.panels.medao = true;
        
        $scope.view.panels[panel] = true;
    };
    
    $scope.$watch(function() { 
        return $mdMedia('gt-md'); 
    }, function(is_gt_md) {
        $scope.screenIsReallyBig = is_gt_md;
        if(is_gt_md){
            $scope.view.panels.manage = true;
            $scope.view.panels.medao = true;
            $scope.view.panels.posts = true;
        } else {
            $scope.view.panels.medao = true;
            $scope.view.panels.posts = false;
            $scope.view.panels.manage = false;
            $scope.view.panels[$scope.view.secondary] = true;
        }
    });
    
    $scope.$watch(function() { 
        return $mdMedia('gt-sm'); 
    }, function(is_gt_sm) {
        $scope.screenIsBig = is_gt_sm;
        $scope.screenIsSmall = !is_gt_sm;
        if(is_gt_sm){
            $scope.view.panels.medao = true;
            $scope.view.panels.posts = false;
            $scope.view.panels.manage = false;
            $scope.view.panels[$scope.view.secondary] = true;
        } else {
            $scope.view.panels.manage = false;
            $scope.view.panels.medao = true;
            $scope.view.panels.posts = false;
        }
    });
    
    $scope.currentAccount = {
        address: null,
        ether: {
            balance: null,
            inWei: null
        },
        token: {
            //tokenAddress:balance
        }
    };
    
    $scope.medao = {
        address: null,
        founder: null,
        pow: null,
        redeemedHours: null,
        outstandingHours: null,
        token: {
            address: null,
            name: null,
            supply: null,
            balance: null
        },
        auction: {
            address: null,
            reward: null,
            period: null,
            timestamp: null,
            highestBid: null,
            placeBid: {
                ether: null
            }
        },
        setAuctionReward: {
            hours: null
        }
    };
    
    $scope.maxBid = function(){
        $scope.medao.auction.placeBid.ether = $scope.currentAccount.ether.balance;
    }
    
    $scope.matchBid = function(){
        $scope.medao.auction.placeBid.ether = $scope.medao.auction.highestBid;
    }
    
    $scope.goto = function(path){
        $location.path(path);
    };
    
    $scope.validAuctionReward = function(){
        var hours = $scope.medao.setAuctionReward.hours;
        if( hours > 0 && hours <= 40)
            return true;
        return false;
    }
    
    $scope.placeBid = function(){
        var auctionAddress = $scope.medao.auction.address;
        var bidInWei = web3.toWei($scope.medao.auction.placeBid.ether,'ether');
        Auction.placeBid(auctionAddress,bidInWei)
        .then(function(txHash){
              return Web3Service.getTransactionReceipt(txHash);
        }).then(function(recepit){
              var success = true;
        }).catch(function(err){
            console.error(err);
        });
    };
    
    Web3Service.getCurrentAccount()
    .then(function(account){
        $scope.currentAccount.address = account;
        return Web3Service.getEtherBalance(account);
    }).then(function(etherBalanceInWei){
        $scope.currentAccount.ether.balance = web3.fromWei(etherBalanceInWei,'ether').toNumber();
        $scope.currentAccount.ether.inWei = etherBalanceInWei.toString();
    }).catch(function(err){
        console.error(err);
    });
    
    Registry.getMeDaoAddress(MeDaoAccount)
    .then(function(medaoAddress){
        console.log(medaoAddress);
        $scope.medao.address =  medaoAddress;
        return $q.all([
            MeDao.getToken(medaoAddress),
            MeDao.getAuction(medaoAddress)
        ]);
    }).then(function(array){
        console.log(array);
        $scope.medao.token.address = array[0];
        $scope.medao.auction.address = array[1];
        return $q.all([
            MeDao.getAuctionReward($scope.medao.address),
            MeDao.getAuctionTimestamp($scope.medao.address),
            MeDao.getAuctionPeriod($scope.medao.address),
            MeDao.getProofOfWork($scope.medao.token.address),
            Token.getName($scope.medao.token.address),
            Token.getCurrentSupply($scope.medao.token.address),
            Auction.getHighestBid($scope.medao.auction.address)
        ]);
    }).then(function(array){
        console.log(array);
        $scope.medao.auction.reward = array[0].toNumber();
        $scope.medao.auction.timestamp = new Date(array[1].toNumber() * 1000);
        $scope.medao.auction.period = array[2].toNumber();
        $scope.medao.pow = array[3].toNumber();
        $scope.medao.token.name = array[4].toString();
        $scope.medao.token.supply = Math.round(array[5].toNumber() / 3600);
        $scope.medao.auction.highestBid = web3.fromWei(array[6],'ether').toNumber();
        
        $scope.medao.redeemedHours = $scope.medao.pow / 3600;
        $scope.medao.outstandingHours = $scope.medao.token.supply / 3600;
    }).catch(function(err){
        console.error(err);    
    });
}]);