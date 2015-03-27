angular.module('tidepoolsServices')
    .factory('geoService', [ '$q', 'alertManager', 'mapManager', 'locationAnalyticsService',
    	function($q, alertManager, mapManager, locationAnalyticsService) {
//abstract & promisify geolocation, queue requests.
var geoService = {
	location: {
		//lat,
		//lng
		//timestamp  
	},
	inProgress: false,
	requestQueue: [] 
}	

var marker = [];
var watchID;
 
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
			locationAnalyticsService.log({
				type: "GPS",
				loc: {
					type: "Point",
					coordinates: [position.coords.longitude, position.coords.latitude]
				}
			});
		}

		function geolocationError(error) {
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

geoService.trackStart = function() {
	if (navigator.geolocation && window.DeviceOrientationEvent) {

		// marker
		mapManager.addMarker('track', {
			lat: 0,
			lng: 0,
			icon: {
				iconUrl: 'img/marker/user-marker-50.png',
				shadowUrl: '',
				iconSize: [35, 43], 
				iconAnchor: [17, 43],
				popupAnchor:[0, -40]
			},
			alt: 'track' // used for tracking marker DOM element
		});
		mapManager.bringMarkerToFront('track');

		// movement XY
		watchID = navigator.geolocation.watchPosition(function(position) {
			var pos = {
				lat: position.coords.latitude,
				lng: position.coords.longitude
			};
			mapManager.moveMarker('track', pos);
			locationAnalyticsService.log({
				type: "GPS",
				loc: {
					type: "Point",
					coordinates: [position.coords.longitude, position.coords.latitude]
				}
			});
		}, function() {
			// console.log('location error');
		}, {
			// enableHighAccuracy: true
		});

		// movement rotation
		window.addEventListener('deviceorientation', rotateMarker);

	}
};

geoService.trackStop = function() {

	// movement: clear watch
	if (watchID) {
		navigator.geolocation.clearWatch(watchID);
		watchID = undefined;
	}

	// rotation: remove event listener
	window.removeEventListener('deviceorientation', rotateMarker);

	// remove marker
	mapManager.removeMarker('track');
	marker = [];

};

function rotateMarker(data) {
	// make sure new marker is loaded in DOM
	if (marker.length > 0) {
		var alpha = data.webkitCompassHeading || data.alpha;
		var matrix = marker.css('transform');

		// account for the fact that marker is initially facing south
		var adjust = 180 + Math.round(alpha);

		marker.css('transform', getNewTransformMatrix(matrix, adjust));
	} else {
		marker = $('img[alt="track"]');
	}
}

function getNewTransformMatrix(matrix, angle) {
	// convert from form 'matrix(a, c, b, d, tx, ty)'' to ['a', 'c', 'b', 'd', 'tx', 'ty']
	var newMatrix = matrix.slice(7, matrix.length - 1).split(', ');
	
	if (newMatrix.length !== 6) { // not 2D matrix
		return matrix;
	}
	
	// get translation and don't change
	var tx = newMatrix[4];
	var ty = newMatrix[5];
	
	// set new values for rotation matrix
	var a = Math.cos(angle * Math.PI / 180);
	var b = -Math.sin(angle * Math.PI / 180);
	var c = -b;
	var d = a;
	
	return 'matrix(' + a + ', ' + c + ', ' + b + ', ' + d + ', ' + tx + ', ' + ty + ')';
}

return geoService;
}]);
