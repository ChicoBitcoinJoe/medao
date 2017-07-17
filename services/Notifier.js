app.service('Notifier',['$q','Notification','Web3Service', function ($q, Notification, Web3Service) {
    console.log('Loading Web3Service');
    
    var service = {
		notify: function(message){
            if(message.txHash){
                Web3Service.getTransactionReceipt(message.txHash)
                .then(function(receipt){
                    //console.log(receipt.gasUsed,receipt.cumulativeGasUsed,receipt);
                    Notification.success({title:'SUCCESS',message:message.action, delay: 10000});
                }).catch(function(err){
                    Notification.error({title:'FAILED',message:message.action, delay: 10000});
                    console.error(err);
                });
            } else {
                Notification.success({message:message.action, delay: 10000});
            }
        }
	};

	return service;
}]);