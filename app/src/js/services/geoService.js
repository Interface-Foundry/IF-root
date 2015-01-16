angular.module('tidepoolsServices')
    .factory('geoService', [ '$q', 'alertManager',
    	function($q, alertManager) {

var geoService = {
	location: {
		//lat,
		//lng
		//timestamp  
	},
	inProgress: false,
	requestQueue: [] 
}	
 
geoService.getLocation = function(maxAge) {
	var deferred = $q.defer();
	
	geoService.requestQueue.push(deferred);

	if (geoService.inProgress) {
		// inprog
	} else if (navigator.geolocation) {
		geoService.inProgress = true;
		console.log('geo: using navigator');
		
		function geolocationSuccess(position) {
			geoService.location.lat = position.coords.latitude;
			geoService.location.lng = position.coords.longitude;
			geoService.location.timestamp = Date.now();
			geoService.resolveQueue({
				lat: position.coords.latitude,
				lng: position.coords.longitude
			})
		}

		function geolocationError(error) {
			//@IFDEF PHONEGAP
			if (error.code == 1) {
				//PERMISSIONS DENIED
				navigator.notification.alert(
					'Please enable Location Services for Bubbl.li', 
					function() {/*send to settings app eventually*/}, 
					'Location Error',
					'OK');
			}
			//@ENDIF
			
			geoService.resolveQueue({err: error.code});
		}
		
		navigator.geolocation.getCurrentPosition(geolocationSuccess, 
			geolocationError);

	} else {
		//browser update message
		alerts.addAlert('warning', 'Your browser does not support location services.')
	}
	
	return deferred.promise;
}

geoService.resolveQueue = function (position) {
	while (geoService.requestQueue.length > 0) {
		var request = geoService.requestQueue.pop();
		if (position.err) {
			request.reject(position.err);
		} else {
			request.resolve(position);
		}
	}
	geoService.inProgress = false;
}

return geoService;
}]);