MeDao.directive('auctionTeir', ['AuctionService',
function(AuctionService) {
	return {
		restrict: 'E',
		scope: {
            auctionAddress: '=',
            teir: '='
		},
		replace: true,
		templateUrl: 'directives/auction-teir/auctionteirDirective.html',
		controller: function($scope){
            console.log($scope.auctionAddress, $scope.teir)
            AuctionService.getTeirInfo($scope.auctionAddress, $scope.teir)
            .then(function(array){
                console.log(array);
                $scope.teirAbove = array[0].toNumber();
                $scope.teirValue = array[1].toNumber();
                $scope.teirBelow = array[2].toNumber();
                $scope.front_of_line_id = array[3].toNumber();
                $scope.back_of_line_id = array[4].toNumber();
                $scope.line_length = array[5].toNumber();
                $scope.total_teir_value = $scope.line_length * web3.fromWei($scope.teir,'ether');
            });
		},
		link : function($scope, $element, $attrs) {
            
		}
	}
}]);