angular.module('tidepoolsServices')

	.factory('geoService', ['$location', '$http', '$q', '$rootScope', '$routeParams', '$timeout', 'alertManager', 'mapManager', 'bubbleTypeService', 'apertureService', 'locationAnalyticsService', 'deviceManager',
		function($location, $http, $q, $rootScope, $routeParams, $timeout, alertManager, mapManager, bubbleTypeService, apertureService, locationAnalyticsService, deviceManager) {

			var geoService = {
				location: {
					/**
					 * lat:
					 * lng:
					 * cityName:
					 * src:
					 * timestamp:
					 */ 
				},
				inProgress: false,
				tracking: false // bool indicating whether or not geolocation is being tracked
			};

			var marker = [];
			var pos = {
				/**
				 * lat:
				 * lng:
				 */
			}
			var watchID;
			$rootScope.aperture = apertureService;

			// start tracking when in full aperture (and retail bubble or world search) and stop otherwise
			$rootScope.$watch('aperture.state', function(newVal, oldVal) {
				if (bubbleTypeService.get() === 'Retail' || $routeParams.cityName) {
					if (newVal === 'aperture-full' && !geoService.tracking) {
						geoService.trackStart();
					} else if (newVal !== 'aperture-full' && geoService.tracking) {
						geoService.trackStop();
					}
				}
			});	

			// don't track across pages unless we need to. saves battery and prevents user location marker from showing up on non-full aperture
			$rootScope.$on('$locationChangeSuccess', function() {
				$timeout(function() {
					if (apertureService.state !== 'aperture-full' ||
						$location.path() === '/') {
						geoService.trackStop();
					}
				}, 5 * 1000);
			});
			 
			geoService.getLocation = function(maximumAge, timeout) {
				// note: maximumAge and timeout are optional. you should not be passing these arguments in most of the time; consider changing (carefully selected) defaults instead
				// @IFDEF WEB
				var maximumAge = maximumAge || 3.25 * 60 * 1000; // 3.25m
				var timeout = timeout || 7 * 1000; // 7s time before resorting to old location, or IP
				// @ ENDIF
				// @IFDEF PHONEGAP
				var maximumAge = maximumAge || 30 * 1000; // 30s
				var timeout = timeout || 7 * 1000; // 30s
				// @ENDIF
				
				var deferred = $q.defer();

				if (!geoService.inProgress) {
					if (navigator.geolocation) {
						console.log('geo: using navigator');

						geoService.inProgress = true;

						function geolocationSuccess(position) {
							console.log('geo success. onto retrieving city name :)');
							
							// get cityName now
							getLocationFromIP(true, position.coords.latitude, position.coords.longitude).then(function(locInfo) {
								console.log('got city name :)');
								deferred.resolve(locInfo);
							}, function(err) {
								console.log('did not get city name :( (but initial geolocation query was successful)');
								deferred.reject(err);
							}).finally(function() {
								console.log('finally leaving getLocation(). I promise (for now)');
								geoService.inProgress = false;
							});
						}

						function geolocationError(err) {
							console.log('geo not successful :(, possibly becasue ', err, '. going to try and get geo from IP now');
							
							// get both cityName AND lat,lng from IP
							getLocationFromIP(false).then(function(locInfo) {
								console.log('got city name and IP location :)');
								deferred.resolve(locInfo);
							}, function(err) {
								console.log('did not get city name :( (and initial geolocation query was also unsuccessful)');
								deferred.reject(err);
							}).finally(function() {
								console.log('finally leaving getLocation(). I promise (for now)');
								geoService.inProgress = false;
							});
						}

						// note that we are implementing the timeout feature internally. this is becasue the geolocation API doesn't take the time that is spent obtaining the user's permission into account (only the time actually spent obtaining location), and we do.
						var options = {
							maximumAge: maximumAge
						};
						
						navigator.geolocation.getCurrentPosition(geolocationSuccess, 
							geolocationError, options);

						$timeout(function() {
							// force get location from IP after timeout if we still don't have a location. could be that user accepted prompt and geo is taking too long. or could be that user didn't accept or reject prompt (but if user rejected prompt, it'd auto geolocationError()).
							if (geoService.inProgress) {
								geolocationError('manual timeout');
							}
						}, timeout);


					} else {
						geoLocationError('browser does not support location services');
					}
				} else {
					// return last known location
					console.log('Already trying to get location. resolving with last known location');
					deferred.resolve(geoService.location);
				} 

				return deferred.promise;
			}

			function getLocationFromIP(hasLoc, lat, lng) {
				// this function name is a misnomer, because sometimes it will be used to get only the city name, which uses the same api as getting location from IP
				console.log('in geoService.getLocationFromIP()');
				var deferred = $q.defer();
				var data = {
					server: true,
					params: {
						hasLoc: hasLoc
					}
				};
				if (lat && lng) { // optional params (if hasLoc: true)
					data.params.lat = lat;
					data.params.lng = lng;
				}
				$http.get('/api/geolocation', data)
					.success(function(locInfo) {
						// locInfo should have src, lat, lng, cityName
						var newLocInfo = {
							lat: lat || locInfo.lat,
							lng: lng || locInfo.lng,
							cityName: locInfo.cityName,
							src: locInfo.src,
							timestamp: Date.now()
						};
						geoService.location = newLocInfo;
						locationAnalyticsService.log({
							type: 'GPS',
							loc: {
								type: 'Point',
								coordinates: [newLocInfo.lat, newLocInfo.lng]
							}
						});
						deferred.resolve(newLocInfo);
					})
					.error(function(err) {
						deferred.reject(err);
					});
				return deferred.promise;
			}

			geoService.trackStart = function() {			
				// used to start showing user's location on map

				// if we are already tracking, stop current session before starting new one
				if (geoService.tracking) {
					geoService.trackStop();
				}
				if (navigator.geolocation && window.DeviceOrientationEvent) {
					
					// marker
					var iconUrl = 'img/marker/userLocMarker_noArrow.png';
					var iconSize = [18, 18];
					var iconAnchor = [9, 9];
					if (deviceManager.deviceType !== 'desktop') {
						// add arrow to user location marker if mobile device
						iconUrl = 'img/marker/userLocMarker_arrow.png';
						iconSize = [24, 28];
						iconAnchor = [12, 12];
					}

					mapManager.addMarker('track', {
						lat: pos.lat || geoService.location.lat || 0,
						lng: pos.lng || geoService.location.lng || 0,
						icon: {
							iconUrl: iconUrl,
							iconSize: iconSize, 
							iconAnchor: iconAnchor
						},
						alt: 'track' // used for tracking marker DOM element
					});
					mapManager.bringMarkerToFront('track');

					// movement XY
					watchID = navigator.geolocation.watchPosition(function(position) {
						pos = {
							lat: position.coords.latitude,
							lng: position.coords.longitude
						};
						mapManager.moveMarker('track', pos);
						locationAnalyticsService.log({
							type: 'GPS',
							loc: {
								type: 'Point',
								coordinates: [position.coords.latitude, position.coords.longitude]
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
				geoService.tracking = true;

			};

			geoService.trackStop = function() {
				// used to stop showing user's location on map

				if (geoService.tracking) { // only stop tracking if already tracking
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
				}
				geoService.tracking = false;

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
