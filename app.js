var MeDao = angular.module('MeDao',['ngRoute','ngMaterial','ngMessages','material.svgAssetsCache','ngSanitize']);

MeDao.config(function ($routeProvider) {
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

MeDao.run(function() {
    console.log('MeDao loading...');
});

MeDao.filter('fromWei', [function() {
    return function(value, convertTo) {
        if(value == null)
            return 0;
        
        return web3.fromWei(value,convertTo).toNumber();
    };
}]);

MeDao.filter('decimals', [function() {
    return function(value,decimals) {
        if(value == null)
            return 0;
        
        return value.toFixed(decimals);
    };
}]);

MeDao.filter('reverse', function() {
  return function(items) {
    return items.slice().reverse();
  };
});