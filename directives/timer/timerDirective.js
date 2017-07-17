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

                    var timeLeft = $scope.timer;
                    var days = Math.floor(timeLeft/(24*60*60));
                    timeLeft -= days*(24*60*60);
                    var hours = Math.floor(timeLeft/(60*60));
                    timeLeft -= hours*(60*60);
                    var minutes = Math.floor(timeLeft/60);
                    var seconds = timeLeft - minutes*60;
                    
                    
                    $scope.$apply(function(){
                        $scope.text.long = '~' + hours + 'h ' + minutes + 'm ' + seconds+'s ';
                        $scope.text.short = '~' + days + 'd ' + hours + 'h ' + minutes + 'm';
                        
                        if(days > 1)
                            $scope.short = true;
                        else
                            $scope.short = false;
                        
                        //console.log($scope.text.long);
                        
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