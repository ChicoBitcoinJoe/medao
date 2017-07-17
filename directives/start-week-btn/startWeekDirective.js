app.directive('startWeekBtn', ['$q','$mdDialog','Web3Service','MeDaoPlatform','MiniMeToken','Notifier',
function($q,$mdDialog,Web3Service,Platform,Token,Notifier) {
	return {
		restrict: 'E',
		scope: {
            founder: '='
		},
		replace: true,
		templateUrl: 'directives/start-week-btn/startWeekDirective.html',
		controller: function($scope){
            
            $scope.cooldown = {
                secondsLeft: null,
                alarm: false
            };
            
            var refresh = function(blockNumber){
                $q.all([
                    Platform.getMeDaoInfo($scope.founder),
                    Web3Service.getBlock(blockNumber)
                ]).then(function(promises){
                    var medaoInfo = promises[0];
                    var blockInfo = promises[1];
                    var timestamp = medaoInfo[5];
                    var now = blockInfo.timestamp;
                    //console.log(now,timestamp);
                    if(now > timestamp){
                        $scope.cooldown.alarm = true;
                    } else {
                        //console.log(timestamp - now);
                        $scope.cooldown.alarm = false;
                        $scope.cooldown.secondsLeft = timestamp - now;
                    }
                });
            };
            
            Web3Service.getCurrentBlockNumber()
            .then(function(currentBlock){
               refresh(currentBlock);
            });
                
            web3.eth.filter('latest', function(err,newBlockInfo){
                refresh(newBlockInfo);
            });
            
            $scope.startWeek = function(workHours){
                Web3Service.getCurrentAccount()
                .then(function(currentAccount){
                    return Platform.startWeek(currentAccount, workHours);
                }).then(function(txHash){
                    return Web3Service.getTransactionReceipt(txHash);
                }).then(function(receipt){
                    console.log(receipt);
                }).catch(function(err){
                    console.error(err);
                });
            }
            
            function DialogController($scope, $mdDialog, data) {
                $scope.founder = data.founder;
                
                $scope.work = {
                    hours: null
                };
                
                $scope.back = function() {
                    $mdDialog.hide(0);
                };

                $scope.place = function() {
                    $mdDialog.hide($scope.work.hours);
                };  
            }
            
            $scope.openSendDialog = function(ev) {
                $mdDialog.show({
                    controller: DialogController,
                    templateUrl: 'directives/start-week-btn/startWeekDialog.template.html',
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
                    if(answer != 0)
                        $scope.startWeek(answer);
                }).catch(function() {
                    //console.log('You cancelled the dialog.');
                });
            };
		},
		link : function($scope, $element, $attrs) {
            
		}
	}
}]);