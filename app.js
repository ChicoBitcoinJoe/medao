var app = angular.module('MeDao',['ngRoute','ngMaterial','ngMessages','material.svgAssetsCache','ngSanitize','ngClickCopy','ui-notification']);

app.config(function ($routeProvider) {
	$routeProvider.
    when('/home', {
        templateUrl: 'views/home/homeView.html',
        controller: 'HomeViewController'
    }).
    when('/:account/medao', {
        templateUrl: 'views/medao/medaoView.html',
        controller: 'MeDaoViewController'
    }).
	otherwise({
      redirectTo: '/home'
    });
});

app.run(function() {
    console.log('MeDao loading...');
});

app.filter('fromWei', [function() {
    return function(value, convertTo) {
        if(value == null)
            return 0;
        
        return web3.fromWei(value,convertTo).toNumber();
    };
}]);

app.filter('decimals', [function() {
    return function(value,decimals) {
        if(value == null)
            return 0;
        
        return value.toFixed(decimals);
    };
}]);

app.filter('reverse', function() {
  return function(items) {
    return items.slice().reverse();
  };
});