app.directive('cloneBtn', ['$window','$q','$mdDialog','Web3Service','Notifier','MeDaoPlatform','MiniMeToken',
function($window,$q,$mdDialog,Web3Service,Notifier,Platform,Token) {
	return {
		restrict: 'E',
		scope: {
            founder: '='
		},
		replace: true,
		templateUrl: 'directives/clone-btn/cloneDirective.html',
		controller: function($scope){
            
            function DialogController($scope, $mdDialog, data) {
                $scope.founder = data.founder;
                
                $scope.clone = {
                    name: null,
                    symbol: null,
                    url: null,
                    controller: null,
                    delay: null
                }
                
                $scope.clones = [
                    {
                        address: '0x368c93667090fb02a6159f0d44b145499b6fc7e1',
                        url: 'https://github.com/ChicoBitcoinJoe'
                    }
                ];
                
                $scope.back = function() {
                    $mdDialog.hide();
                };
                
                $scope.openUrl = function (url) {
                    console.log(url);
                    $window.location.href = url;
                };
                
                $scope.setCloneUrl = function(clone_id,url){
                    console.log(clone_id,url);
                    Platform.setUrl($scope.founder,clone_id,url)
                    .then(function(txHash){
                        return Web3Service.getTransactionReceipt(txHash);
                    }).then(function(receipt){
                        console.log(receipt);
                        refresh();
                    }).catch(function(err){
                        console.error(err);
                    });
                };
                
                var refresh = function(){
                    Platform.getClones($scope.founder)
                    .then(function(clones){
                        console.log(clones);
                        $scope.clones = clones;
                    }).catch(function(err){
                        console.error(err);
                    });
                    
                    $q.all([Web3Service.getCurrentAccount(),Platform.getMeDaoInfo($scope.founder)])
                    .then(function(promiseArray){
                        var currentAccount = promiseArray[0];
                        var medaoInfo = promiseArray[1];
                        var controller = medaoInfo[1];
                        $scope.isController = (currentAccount == controller);
                    });
                };
                
                refresh();
                
                $scope.validInput = function() {
                    var valid = true;
                    if($scope.clone.name == null || $scope.clone.name == '')
                        valid = false;
                    if($scope.clone.symbol == null || $scope.clone.symbol == '')
                        valid = false;
                    if($scope.clone.url == null || $scope.clone.url == '')
                        valid = false;
                    if($scope.clone.controller == null || $scope.clone.controller == '')
                        valid = false;
                    if($scope.clone.delay == null || $scope.clone.delay <= 0)
                        valid = false;
                    
                    return valid;
                };
                
                $scope.createClone = function(){
                    Platform.createClone(
                        $scope.founder,
                        $scope.clone.name,
                        $scope.clone.symbol,
                        $scope.clone.url,
                        $scope.clone.controller,
                        $scope.clone.delay
                    ).then(function(txHash){
                        return Web3Service.getTransactionReceipt(txHash);
                    }).then(function(receipt){
                        console.log(receipt);
                        refresh();
                    });
                };
            };
            
            $scope.openCloneDialog = function(ev) {
                $mdDialog.show({
                    controller: DialogController,
                    templateUrl: 'directives/clone-btn/cloneDialog.template.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose:true,
                    fullscreen: false, // Only for -xs, -sm breakpoints.
                    locals: {
                        data:{
                            founder:$scope.founder
                        }
                    }
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



