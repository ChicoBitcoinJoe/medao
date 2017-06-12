MeDao.directive('commentView', ['MeDaoService',
function(MeDaoService) {
	return {
		restrict: 'E',
		scope: {
            medaoAddress: '='
		},
		replace: true,
		templateUrl: 'directives/comment-view/commentViewDirective.html',
		controller: function($scope){
            //console.log('Loading Comment View');
		},
		link : function($scope, $element, $attrs) {
            
		}
	}
}]);