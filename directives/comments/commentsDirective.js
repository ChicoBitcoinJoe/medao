app.directive('comments', ['$q','Web3Service','MeDaoPlatform', function($q,Web3Service,Platform) {
	return {
		restrict: 'E',
		scope: {
            founder: '='
		},
		replace: true,
		templateUrl: 'directives/comments/commentsDirective.html',
		controller: function($scope){
            $scope.comments = [];
            
            var blocks = 4*60*24*7; //1 week
            Platform.getPaymentEvents($scope.founder, blocks)
            .then(function(filter){
                filter.watch(function(err, event){
                    console.log(event);
                    var founder = event.args.founder;

                    if($scope.founder == founder){
                        var sender = event.args.sender;
                        var burned = event.args.amount;
                        var blockNumber = event.blockNumber;
                        var comment = event.args.comment;
                        var timestamp = event.args.timestamp;
                        if(comment == '')
                            comment = '(no comment)';

                        $scope.comments.push({
                            sender: sender,
                            timestamp: timestamp*1000,
                            burned: burned,
                            text: comment
                        });
                    }
                });
            });
		},
		link : function($scope, $element, $attrs) {
            
		}
	}
}]);