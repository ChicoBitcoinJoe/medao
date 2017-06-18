MeDao.directive('timer', [function() {
	return {
		restrict: 'E',
		scope: {
            seconds: '='
		},
		replace: true,
		templateUrl: 'directives/timer/timerDirective.html',
		controller: function($scope){
            
            $scope.timer = {
                seconds: $scope.seconds,
                text: {
                    long: null,
                    short: null
                }
            };
            
            $scope.timerInterval = setInterval(function(){
                console.log($scope.timer.seconds);
                $scope.timer.seconds--;

                if($scope.timer.seconds < 0)
                    $scope.timer.seconds = 0;

                var seconds = $scope.timer.seconds;
                var days = Math.floor(seconds/(24*60*60));
                seconds = seconds - days*(24*60*60);
                ////console.log(days + ' days',seconds + ' seconds');
                var hours = Math.floor(seconds/(60*60));
                seconds = seconds - hours*(60*60);
                ////console.log(hours + ' hours',seconds + ' seconds');
                var minutes = Math.floor(seconds/60);
                seconds = seconds - minutes*60;
                ////console.log(minutes + ' minutes',seconds + ' seconds');

                $scope.timer.text.long = '~ ';
                $scope.timer.text.short = $scope.timer.seconds;

                if(days > 0)
                    $scope.timer.text.long += days+'d ';
                if(hours > 0 || days > 0)
                    $scope.timer.text.long += hours+'h ';
                if(minutes > 0 || hours > 0 || days > 0)
                    $scope.timer.text.long += minutes+'m ';

                $scope.$apply(function(){
                    //console.log($scope.timer.seconds);
                    $scope.timer.text.long += seconds+'s ';
                    if($scope.timer.seconds <= 0){
                        $scope.timer.alarm = true;
                        clearInterval($scope.timerInterval);
                    }
                });
            }, 1000);
		},
		link : function($scope, $element, $attrs) {
            
		}
	}
}]);