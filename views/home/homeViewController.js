app.controller('HomeViewController', ['$scope','$location','$q','Web3Service','MeDao',
function($scope,$location,$q,Web3Service,MeDao){
    console.log('Loading Home View');
    
    $scope.loaded = false;
    $scope.hasMedao = false;
    $scope.dotted = true;
    $scope.customFullscreen = false;
    $scope.showInput = false;
    
    $scope.medao = {
        name: 'Enter Your Name',
        valid: false
    };
    
    Web3Service.getCurrentAccount()
    .then(function(account){
        $scope.account = account;
        return MeDao.getMeDaoAddress(account);
    }).then(function(medaoAddress){
        console.log(medaoAddress);
        if(medaoAddress == '0x0000000000000000000000000000000000000000')
            $scope.hasMedao = false;
        else {
            $scope.hasMedao = true;
            MeDao.getTeirs(medaoAddress)
            .then(function(teirs){
                console.log(teirs);
                $scope.teirs = teirs;

                var promises = [];
                for(var i = 0; i < teirs.length; i++)
                    promises[i] = MeDao.getTeirInfo(medaoAddress,teirs[i]);

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

                    ether += (web3.fromWei(value,'ether').toNumber() * length);
                    bids += length;
                    
                    if(bids > 40)
                        i = promises.length;
                }
                if(bids == 0)
                    $scope.salary = 0;
                else
                    $scope.salary = ether / bids * 40 * 52;

            }).catch(function(err){
                console.error(err);
            });
        }
        
        $scope.loaded = true;
    }).catch(function(err){
        console.error(err);
    });
    
    $scope.$watch('medao.name', function(){
        //console.log($scope.medao.name);
        if($scope.medao.name.length > 0 && $scope.medao.name != 'Enter Your Name' && $scope.medao.name != null)
            $scope.medao.valid = true;
        else
            $scope.medao.valid = false;
    });
    
    $scope.goto = function(path){
        $location.path(path);
    }

    $scope.onFocus = function(){
        $scope.dotted = false;
        if($scope.medao.name == 'Enter Your Name')
            $scope.medao.name = '';
    }
    
    $scope.onBlur = function(){
        if($scope.medao.name == '') {
            $scope.dotted = true;
            $scope.medao.name = 'Enter Your Name';
        } else {
            $scope.dotted = false;
        }
    }
}]);