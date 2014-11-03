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
		
		navigator.geolocation.getCurrentPosition(geolocationSuccess, 
			geolocationError, 
			{timeout:15000, enableHighAccuracy : true});
	
		function geolocationSuccess(position) {
			geoService.location.lat = position.coords.latitude;
			geoService.location.lng = position.coords.longitude;
			geoService.location.timestamp = Date.now();
			deferred.resolve({
				lat: position.coords.latitude,
				lng: position.coords.longitude
			})
		}

		function geolocationError(){
			deferred.reject();
		}
	} else {
		//browser update message
		deferred.reject();
	}
	
	return deferred.promise;
}

return geoService;
}]);