MeDao.directive('comments', ['MeDaoService', function(MeDaoService) {
	return {
		restrict: 'E',
		scope: {
            owner: '='
		},
		replace: true,
		templateUrl: 'directives/comments/commentsDirective.html',
		controller: function($scope){
            $scope.comments = [];
            
            MeDaoService.getMeDaoAddress($scope.owner)
            .then(function(medaoAddress){
                return MeDaoService.getProofOfWorkEvents(medaoAddress,4*60*24*7);
            }).then(function(filter){
                filter.watch(function(err,event){
                    if(!err){
                        var burned = event.args.amount.toNumber();
                        var comment = event.args.metadataHash;
                        
                        $scope.comments.push({
                            burned:burned,
                            comment:comment
                        });
                    } else {
                        console.error(err);
                    }
                });
            });
		},
		link : function($scope, $element, $attrs) {
            
		}
	}
}]);