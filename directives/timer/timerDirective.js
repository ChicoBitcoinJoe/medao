app.directive('timer', [function() {
	return {
		restrict: 'E',
		scope: {
            seconds: '=',
            alarm: '='
		},
		replace: true,
		templateUrl: 'directives/timer/timerDirective.html',
		controller: function($scope){
            
            $scope.timer = null;
            
            $scope.text = {
                short: null,
                long: null
            };
            
            $scope.timerInterval = setInterval(function(){
                if($scope.seconds == null){
                    //wait
                } else if($scope.timer == null){
                    $scope.timer = $scope.seconds;
                } else {
                   
                    $scope.timer--;

                    if($scope.timer < 0)
                        $scope.timer = 0;

                    var seconds = $scope.timer;
                    var days = Math.floor(seconds/(24*60*60));
                    seconds = seconds - days*(24*60*60);
                    ////console.log(days + ' days',seconds + ' seconds');
                    var hours = Math.floor(seconds/(60*60));
                    seconds = seconds - hours*(60*60);
                    ////console.log(hours + ' hours',seconds + ' seconds');
                    var minutes = Math.floor(seconds/60);
                    seconds = seconds - minutes*60;
                    ////console.log(minutes + ' minutes',seconds + ' seconds');

                    $scope.text.short = $scope.timer + 's';
                    $scope.text.long = '~ ';

                    if(days > 0)
                        $scope.text.long += days+'d ';
                    if(hours > 0 || days > 0)
                        $scope.text.long += hours+'h ';
                    if(minutes > 0 || hours > 0 || days > 0)
                        $scope.text.long += minutes+'m ';

                    $scope.$apply(function(){
                        //console.log($scope.timer);
                        $scope.text.long += seconds+'s ';
                        if($scope.timer <= 0){
                            $scope.alarm = true;
                            $scope.timer = null;
                        }
                    });
                }
            }, 1000);
		},
		link : function($scope, $element, $attrs) {
            
		}
	}
}]);