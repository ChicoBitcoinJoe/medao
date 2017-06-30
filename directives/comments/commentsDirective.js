app.directive('comments', ['MeDao', function(MeDao) {
	return {
		restrict: 'E',
		scope: {
            owner: '='
		},
		replace: true,
		templateUrl: 'directives/comments/commentsDirective.html',
		controller: function($scope){
            $scope.comments = [];
            
            MeDao.getMeDaoAddress($scope.owner)
            .then(function(medaoAddress){
                return MeDao.getProofOfWorkEvents(medaoAddress,4*60*24*7);
            }).then(function(filter){
                filter.watch(function(err,event){
                    if(!err){
                        var burned = event.args.amount.toNumber();
                        var comment = event.args.metadataHash;
                        //console.log(comment);
                        if(comment == '')
                            comment = '(no comment)';
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