app.directive('medaoTutorialBtn', ['$q','$mdDialog','Web3Service','MeDaoPlatform','MiniMeToken',
function($q,$mdDialog,Web3Service,Platform,Token) {
	return {
		restrict: 'E',
		scope: {
            founder: '='
		},
		replace: true,
		templateUrl: 'directives/medao-tutorial-btn/medaoTutorialDirective.html',
		controller: function($scope){
            
            function DialogController($scope, $mdDialog) {
                $scope.back = function() {
                    $mdDialog.hide(0);
                };
            };
            
            console.log($scope.founder);
            Platform.getMeDaoInfo($scope.founder)
            .then(function(medaoInfo){
                var tokenAddress = medaoInfo[3];
                return $q.all([
                    Web3Service.getCurrentBlockNumber(),
                    Token.getCreationBlock(tokenAddress)
                ]);
            }).then(function(promises){
                var currentBlock = promises[0];
                var creationBlock = promises[1].toNumber();
                //console.log(currentBlock,creationBlock)
                if(currentBlock < creationBlock + 4){
                    $mdDialog.show({
                        controller: DialogController,
                        templateUrl: 'directives/medao-tutorial-btn/medaoTutorialDialog.template.html',
                        parent: angular.element(document.body),
                        clickOutsideToClose:true,
                        fullscreen: true, // Only for -xs, -sm breakpoints.
                    }).then(function(answer) {
                        //console.log(answer);
                    }).catch(function() {
                        //console.log('You cancelled the dialog.');
                    });
                }
            }).catch(function(err){
                console.error(err);
            });
            
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