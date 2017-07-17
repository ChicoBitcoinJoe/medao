app.directive('sendBtn', ['$q','$mdDialog','Web3Service','MeDaoPlatform','MiniMeToken','Notifier',
function($q,$mdDialog,Web3Service,Platform,Token,Notifier) {
	return {
		restrict: 'E',
		scope: {
            founder: '='
		},
		replace: true,
		templateUrl: 'directives/send-btn/sendDirective.html',
		controller: function($scope){
            
            function DialogController($scope, $mdDialog, data) {
                $scope.founder = data.founder;
                
                $scope.send = {
                    type: null,
                    address: null,
                    amountInEther: null,
                    amountInSeconds: null
                };
                
                $scope.back = function() {
                    $mdDialog.hide(0);
                };

                $scope.place = function() {
                    $mdDialog.hide($scope.send.amountInEther);
                };
                
                $scope.maxEther = function() {
                    Web3Service.getCurrentAccount()
                    .then(function(account){
                        return Web3Service.getEtherBalance(account);
                    }).then(function(etherBalanceInWei){
                        $scope.send.amountInEther = web3.fromWei(etherBalanceInWei,'ether').toNumber();
                    });
                };
                
                $scope.maxTime = function() {
                    $q.all([
                        Web3Service.getCurrentAccount(),
                        Platform.getMeDaoInfo($scope.founder)
                    ]).then(function(promises){
                        var currentAccount = promises[0];
                        var tokenAddress = promises[1][3];
                        
                        return Token.getBalanceOf(tokenAddress,currentAccount);
                    }).then(function(timeBalanceInSeconds){
                        $scope.send.amountInSeconds = web3.fromWei(timeBalanceInSeconds,'ether').toNumber();
                    });
                };
                
                $scope.sendEther = function(){
                    var amountInWei = web3.toWei($scope.send.amountInEther,'ether');
                    Web3Service.sendEther($scope.send.address,amountInWei)
                    .then(function(txHash){
                        var action = 'Send ' + $scope.send.amountInEther + ' ether to ' + $scope.send.address;
                    
                        var message = {
                            txHash: txHash,
                            action: action
                        };

                        Notifier.notify(message);
                        
                        $scope.back();
                    });
                };

                $scope.sendTime = function(){
                    Platform.getMeDaoInfo($scope.founder)
                    .then(function(medaoInfo){
                        var tokenAddress = medaoInfo[3];
                        console.log($scope.send.address, $scope.send.amountInSeconds);
                        return Token.transfer(
                            tokenAddress,
                            $scope.send.address,
                            web3.toWei($scope.send.amountInSeconds,'ether')
                        );
                    }).then(function(txHash){
                        var action = 'Send ' + $scope.send.amountInSeconds + ' ether to ' + $scope.send.address;
                
                        var message = {
                            txHash: txHash,
                            action: action
                        };
                        
                        Notifier.notify(message);
                        
                        $scope.back();
                    });
                };
            }
            
            $scope.openSendDialog = function(ev) {
                $mdDialog.show({
                    controller: DialogController,
                    templateUrl: 'directives/send-btn/sendDialog.template.html',
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
            /* Not working :(
            var scanner = angular.element(document.querySelector('#reader'));
            scanner.html5_qrcode(function(data){
                console.log(data);
                $scope.send.address = data;
                $scope.showScanner = false;
                scanner.html5_qrcode_stop();
            }, function(err){
                //show read errors 
                console.error(err)
            }, function(videoError){
                //the video stream could be opened
                console.error(videoError);
            });
            */
		}
	}
}]);