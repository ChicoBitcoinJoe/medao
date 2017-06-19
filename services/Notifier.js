MeDao.service('Notifier',['$q', function ($q) {
    console.log('Loading Web3Service');
    
    var service = {
		notify: function(message){
            console.log(message);
        }
	};

	return service;
}]);