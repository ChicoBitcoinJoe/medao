app.directive('exchangeBtn', ['$q','$mdDialog','Web3Service','Notifier','MeDaoPlatform',
function($q,$mdDialog,Web3Service,Notifier,MeDaoPlatform) {
	return {
		restrict: 'E',
		scope: {
            founder: '='
		},
		replace: true,
		templateUrl: 'directives/exchange-btn/exchangeDirective.html',
		controller: function($scope){
            
            function DialogController($scope, $mdDialog, data) {
                $scope.founder = data.founder;
                
                $scope.exchange = {
                    type: null,
                    buy: {
                        totalHours: null,
                        amountPerHourInEther: null
                    },
                    sell: {
                        totalHours: null,
                        amountPerHourInEther: null
                    }
                }
                
                $scope.back = function() {
                    $mdDialog.hide(0);
                };
                
                $scope.placeBuyOrders = function () {
                    var TokenGive;
                    var TokenGet;
                    var TokenPrice;
                    
                }
                
                $scope.placeSellOrders = function () {
                    var TokenGive;
                    var TokenGet;
                    var takePrice;
                    
                    
                }
            };
            
            $scope.openExchangeDialog = function(ev) {
                $mdDialog.show({
                    controller: DialogController,
                    templateUrl: 'directives/exchange-btn/exchangeDialog.template.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose:true,
                    fullscreen: true, // Only for -xs, -sm breakpoints.
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