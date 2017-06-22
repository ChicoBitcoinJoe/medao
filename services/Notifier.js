app.service('Notifier',['$q','Notification','Web3Service', function ($q, Notification, Web3Service) {
    console.log('Loading Web3Service');
    
    var service = {
		notify: function(message){
            Web3Service.getTransactionReceipt(message.txHash)
            .then(function(receipt){
                console.log(receipt.gasUsed,receipt.cumulativeGasUsed,receipt);
                if(receipt.gasUsed == receipt.cumulativeGasUsed) {
                    Notification.error('FAILED: ' + message.action);
                    console.error(receipt);
                } else
                    Notification.success('SUCCESS: ' + message.action);
            }).catch(function(err){
                console.error(err);
                Notification.error('FAILED: ' + message.action);
            });
        }
	};

	return service;
}]);