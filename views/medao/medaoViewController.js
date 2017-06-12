MeDao.controller('MeDaoViewController', ['$scope','$location','$mdMedia','Web3Service','MeDaoRegistry',
function($scope,$location,$mdMedia,Web3Service,Registry){
    console.log('Loading MeDao View');
    
    $scope.account = $location.path().split('/')[2];
    $scope.current = 'medao';
    $scope.$watch(function() { 
        return $mdMedia('gt-sm'); 
    }, function(is_gt_sm) {
        $scope.screenIsBig = is_gt_sm;
        $scope.screenIsSmall = !is_gt_sm;
    });
    
    $scope.showView = function(view){
        $scope.current = view;
    };
    
}]);