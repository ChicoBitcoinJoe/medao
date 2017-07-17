app.controller('HomeViewController', ['$scope','$location','$q','Web3Service','MeDaoPlatform',
function($scope,$location,$q,Web3Service,Platform){
    //console.log('Loading Home View');
    
    $scope.loaded = false;
    $scope.hasMedao = false;
    $scope.dotted = true;
    $scope.customFullscreen = false;
    $scope.showInput = false;
    
    $scope.platform = {
        major_version: null,
        major_version: null
    };
    
    $scope.medao = {
        name: 'Enter Your Name',
        valid: false,
        salary: null
    };
    
    Web3Service.getCurrentAccount()
    .then(function(account){
        $scope.account = account;
        return Platform.getMeDaoInfo(account);
    }).then(function(medaoInfo){
        var tokenAddress = medaoInfo[3];
        if(tokenAddress == '0x0000000000000000000000000000000000000000'
        || tokenAddress == '0x'
        || tokenAddress == null)
            $scope.hasMedao = false;
        else {
            $scope.hasMedao = true;
            
            //To do: // get salary
            $scope.medao.salary = 0;
        }
        
        $scope.loaded = true;
    }).catch(function(err){
        console.error(err);
    });
    
    Platform.getVersion().then(function(versionInfo){
        $scope.platform.major_version = versionInfo[0].toNumber();
        $scope.platform.minor_version = versionInfo[1].toNumber();
    });
    
    $scope.$watch('medao.name', function(){
        ////console.log($scope.medao.name);
        if($scope.medao.name.length > 0 && $scope.medao.name != 'Enter Your Name' && $scope.medao.name != null)
            $scope.medao.valid = true;
        else
            $scope.medao.valid = false;
    });
    
    $scope.validateSearch = function(address){
        if(web3.isAddress(address)) {
            $scope.goto(address + '/medao');
            $scope.search.isValidAddress = true;
        } else
            $scope.search.isValidAddress = false;
    };
    
    $scope.goto = function(path){
        $location.path(path);
    };

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