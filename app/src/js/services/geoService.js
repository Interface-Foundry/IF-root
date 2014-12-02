angular.module('tidepoolsServices')
    .factory('geoService', [ '$q', 
    	function($q) {

var geoService = {
	location: {
		//lat,
		//lng
		//timestamp  
	}
}	
 
geoService.getLocation = function(maxAge) {
	var deferred = $q.defer();

	if (navigator.geolocation) {
		console.log('geo: using navigator');
			
		function geolocationSuccess(position) {
			geoService.location.lat = position.coords.latitude;
			geoService.location.lng = position.coords.longitude;
			geoService.location.timestamp = Date.now();
			deferred.resolve({
				lat: position.coords.latitude,
				lng: position.coords.longitude
			})
		}

		function geolocationError(error){
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
			deferred.reject(error);
		}
		
			navigator.geolocation.getCurrentPosition(geolocationSuccess, 
			geolocationError, 
			{timeout:15000, enableHighAccuracy : true});

	} else {
		//browser update message
		deferred.reject('navigator.geolocation undefined');
	}
	
	return deferred.promise;
}

return geoService;
}]);