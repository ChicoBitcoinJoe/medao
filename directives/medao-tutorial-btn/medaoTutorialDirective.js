app.directive('medaoTutorialBtn', ['$mdDialog',
function($mdDialog) {
	return {
		restrict: 'E',
		scope: {
            
		},
		replace: true,
		templateUrl: 'directives/medao-tutorial-btn/medaoTutorialDirective.html',
		controller: function($scope){
            
            function DialogController($scope, $mdDialog) {
                $scope.back = function() {
                    $mdDialog.hide(0);
                };
            };
            
            $scope.openTutorialDialog = function(ev) {
                $mdDialog.show({
                    controller: DialogController,
                    templateUrl: 'directives/medao-tutorial-btn/medaoTutorialDialog.template.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose:true,
                    fullscreen: true, // Only for -xs, -sm breakpoints.
                }).then(function(answer) {
                    //console.log(answer);
                }).catch(function() {
                    //console.log('You cancelled the dialog.');
                });
            };
		},
		link : function($scope, $element, $attrs) {
            
		}
	}
}]);