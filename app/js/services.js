'use strict';

/* Services */

var res;

angular.module('tidepoolsServices', ['ngResource'])

	.factory('Landmark', ['$resource', '$http',
        function($resource, $http) {
			var actions = {
                'count': {method:'PUT', params:{_id: 'count'}},                           
                'distinct': {method:'PUT', params:{_id: 'distinct'}},      
                'find': {method:'PUT', params:{_id: 'find'}, isArray:true},              
                'group': {method:'PUT', params:{_id: 'group'}, isArray:true},            
                'mapReduce': {method:'PUT', params:{_id: 'mapReduce'}, isArray:true},  
                'aggregate': {method:'PUT', params:{_id: 'aggregate'}, isArray:true},
                'del': {method:'DELETE', params:{_id: 'del'}, isArray:true}
            }
            res = $resource('api/landmarks/:_id:id', {}, actions);
            return res;
        }
    ])

    .factory('World', ['$resource', '$http', 'leafletData', 
        function($resource, $http, leafletData) {
            var actions = {
                'count': {method:'PUT', params:{_id: 'count'}},                           
                'distinct': {method:'PUT', params:{_id: 'distinct'}},      
                'find': {method:'PUT', params:{_id: 'find'}, isArray:true},              
                'group': {method:'PUT', params:{_id: 'group'}, isArray:true},            
                'mapReduce': {method:'PUT', params:{_id: 'mapReduce'}, isArray:true},  
                'aggregate': {method:'PUT', params:{_id: 'aggregate'}, isArray:true},
                'del': {method:'DELETE', params:{_id: 'del'}, isArray:true}
            }
            res = $resource('api/worlds/:_id:id', {}, actions);
            return res;
        }
    ])
    .factory('db', ['$resource', '$http',    
        function($resource, $http) {
    		var actions = {
                    'count': {method:'PUT', params:{_id: 'count'}},                           
                    'distinct': {method:'PUT', params:{_id: 'distinct'}},      
                    'find': {method:'PUT', params:{_id: 'find'}, isArray:true},              
                    'group': {method:'PUT', params:{_id: 'group'}, isArray:true},            
                    'mapReduce': {method:'PUT', params:{_id: 'mapReduce'}, isArray:true},  
                    'aggregate': {method:'PUT', params:{_id: 'aggregate'}, isArray:true},
                    'create':  {method:'POST', params:{_id: 'create'}, isArray:true},
                    'locsearch':  {method:'GET', params:{_id: 'locsearch'}, isArray:true}
                }
            var db = {};
            db.worlds = $resource('api/worlds/:_id', {}, actions);
            db.landmarks = $resource('api/landmarks/:_id:id', {}, actions);
            db.styles = $resource('api/styles/:_id', {}, actions);
            db.projects = $resource('api/projects/:_id', {}, actions);
            db.tweets = $resource('api/tweets/:_id', {}, actions);
            db.instagrams = $resource('api/instagrams/:_id', {}, actions);
            return db;
        }
    ])
    .factory('apertureService', ['leafletData', 'mapManager', 
    	function(leafletData, mapManager) {
	    	var aperture = {};
			aperture.off = true;
	    	aperture.state = 'aperture-off';
	    	aperture.navfix = 'navfix';
	    	var map = mapManager;
	    	
	    	aperture.toggle = function(state) {
	    		if (aperture.off)  {
		    			aperture.off = false;
		    			console.log('toggling aperture on');
		    			aperture.navfix = '';
						if (state == 'half') {
						console.log('half');	
							aperture.state = 'aperture-half';
						}
						if (state == 'full') {
						console.log('full');
							aperture.state = 'aperture-full';
						}
				} else {
				console.log('off');
					aperture.off = true;
					aperture.state = 'aperture-off';
					aperture.navfix = 'navfix';
				}
				
				/*if ($rootScope.apertureOn) {
					//open
					console.log('opening');
					angular.extend($rootScope, {apertureSize: h});
					console.log($rootScope.apertureSize);
				} else { 
					console.log('closing aperture');
					angular.extend($rootScope, {apertureSize: 0});
					console.log($rootScope.apertureSize);
				}*/
				map.refresh();
			}
			
			aperture.set = function(state) {
				switch (state) {
					case 'off':
						aperture.off = true;
						aperture.state = 'aperture-off';
						aperture.navfix = 'navfix';
						break;
					case 'half':
						aperture.off = false;
						aperture.state = 'aperture-half';
						aperture.navfix = '';
						break;
					case 'full':
						aperture.off = false;
						aperture.state = 'aperture-full';
						aperture.navfix = '';
						break;
				}
				}
			
			return aperture;
    }])
    .factory('mapManager', ['leafletData',
    	function(leafletData) {
       var mapManager = {
    		center: {
	    		lat: 42,
	    		lng: -83,
	    		zoom: 14
				},
			markers: {},
			tiles: tilesDict.mapbox,
			layers: {
				baselayers: {
					baseMap: {
					name: "Sunset",
					url: 'https://{s}.tiles.mapbox.com/v3/interfacefoundry.ig6f6j6e/{z}/{x}/{y}.png',
					type: 'xyz',
					layerParams: {},
					layerOptions: {}
				}
			},
				overlays: {}
			},
			paths: {worldBounds: {
					type: 'circle',
					radius: 150,
					latlngs: {lat:40, lng:20}
				}},
			maxbounds: {},
			defaults: {
				controls: {
					layers: {
						visible: false,
						position: 'bottomright',
						collapsed: true
					}
				},
				zoomControlPosition: 'bottomleft',
			}
		};
		
		
		mapManager.setCenter = function(latlng, z) {
			console.log('--mapManager--');
			console.log('--setCenter--');
			console.log(latlng);
			console.log(z);
			angular.extend(mapManager.center, {lat: latlng[1], lng: latlng[0], zoom: z});
			refreshMap();
		}
				
		/* addMarker
		Key: Name of marker to be added
		Marker: Object representing marker
		Safe: Optional. If true, does not overwrite existing markers. Default false
		*/
		mapManager.addMarker = function(key, marker, safe) {
				console.log('--addMarker('+key+','+marker+','+safe+')--');
			if (mapManager.markers.hasOwnProperty(key)) { //key is in use
				if (safe == true) {
					//dont replace
					console.log('Safe mode cant add marker: Key in use');
					return false;
				} else {
					mapManager.markers[key] = angular.copy(marker);
					console.log('Marker added');
				}
			} else {
				mapManager.markers[key] = angular.copy(marker);
				console.log('Marker added');
			}
			return true;
		}
		
		mapManager.getMarker = function(key) {
			console.log('--getMarker('+key+')--');
			if (mapManager.markers.hasOwnProperty(key)) {
				console.log('Marker found!');
				console.log(mapManager.markers[key]);
				return mapManager.markers[key];
			} else {
				console.log('Key not found in Markers');
				return false;
			}
		}
		
		mapManager.removeMarker = function(key) {
			console.log('--removeMarker('+key+')--');
			if (mapManager.markers.hasOwnProperty(key)) {
				console.log('Deleting marker');
				delete mapManager.markers[key];
				return true;
			} else {
				console.log('Key not found in Markers');
				return false;
			}
		}
		
		mapManager.setMarkerMessage = function(key, msg) {
			console.log('--setMarkerMessage()--');
			if (mapManager.markers.hasOwnProperty(key)) {
				console.log('Setting marker message');
				angular.extend(mapManager.markers[key], {'message': msg});
				//refreshMap();
				return true;
			} else {
				console.log('Key not found in Markers');
				return false;
			}
		}
		
		mapManager.setMarkerFocus = function(key) {
			console.log('--setMarkerFocus('+key+')--');
			if (mapManager.markers.hasOwnProperty(key)) {
				console.log('Setting marker focus');
				angular.forEach(mapManager.markers, function(marker) {					
					marker.focus = false;
					console.log(marker);
				});
				mapManager.markers[key].focus = true; 
				console.log(mapManager.markers);
				return true;
			} else {
				console.log('Key not found in Markers');
				return false;
			}
		}
		
		/* addPath
		Key: Name of path to be added
		Path: Object representing path in leafletjs style
		Safe: Optional. If true, does not overwrite existing paths. Default false.
		*/
		mapManager.addPath = function(key, path, safe) {
			console.log('--addPath('+key+','+path+','+safe+')--');
			if (mapManager.paths.hasOwnProperty(key)) { //key is in use
				if (safe == true) {		
					//dont delete
					console.log('Safe mode cant add path: Key in use'); 
					return false;
				} else {
					console.log('else1');
					mapManager.paths[key] = angular.copy(path);
					console.log(mapManager.paths[key]);
				}	
			} else { //key is free
				console.log('else2');
				mapManager.paths[key] = path; 
				console.log(mapManager.paths[key]);
			}
			
			refreshMap();
			return true;
		}
		
		/* setTiles
		Name: Name of tileset from dictionary
		*/
		mapManager.setTiles = function(name) {
			console.log('DO NOT USE');
			console.log('--setTiles('+name+'--');
			angular.extend(mapManager.tiles, tilesDict[name]); 
			refreshMap();
		}
		
		/* setMaxBounds
			set the two corners of the map view maxbounds
		southWest: array of latitude, lng
		northEast: array of latitude, lng
		*/
		mapManager.setMaxBounds = function(sWest, nEast) {
				console.log('--setMaxBounds('+sWest+','+nEast+')--');
			leafletData.getMap().then(function(map){
				map.setMaxBounds([
					[sWest[0], sWest[1]],
					[nEast[0], nEast[1]]
				]);
			});
			refreshMap();
			return true;
		}
		
		/* setMaxBoundsFromPoint
			set max bounds with a point and a distance
			point: the center of the max bounds
			distance: orthogonal distance from point to bounds
		*/ 
		mapManager.setMaxBoundsFromPoint = function(point, distance) {
			leafletData.getMap().then(function(map){
				setTimeout(function() {map.setMaxBounds([
					[point[0]-distance, point[1]-distance],
					[point[0]+distance, point[1]+distance]
				])}, 400);
			});
			refreshMap();
			return true;
		}
		
		mapManager.refresh = function() {
			refreshMap();
		}
		
		function refreshMap() { 
			console.log('--refreshMap()--');
	        leafletData.getMap().then(function(map) {
	        	console.log('invalidateSize() called');
	        	setTimeout(function(){ map.invalidateSize()}, 400);
	        });
		}
		
		return mapManager;
    }])
    // .service('mapper', ['$scope', function($scope) {
            
    //         this.view = function() {
    //             //console.log('MAP');
    //             angular.extend($scope, {
    //                 center: {
    //                     lat: 42.356810,
    //                     lng: -83.0610023,
    //                     zoom: 14
    //                 }
    //             });
    //         }
            
    //     }
    // ]);


    // .factory('map', ['$resource', '$http',    
    //     function(type,filter) {
    //        console.log("asdf")
    //     }
    // ]);


    // .factory('map', function(type,filter) {

    //     console.log(type,filter);

    // });

	//handling alerts
   .factory('alertManager', [function () {
   		var alerts = {
   			'list':[]
   		};

   		alerts.addAlert = function(alertType, alertMsg) {
   			alerts.list = []; //clear alerts automatically for now to show one
   			alerts.list.push({type: alertType, msg: alertMsg});
   		}

   		alerts.closeAlert = function(index) {
   			alerts.list.splice(index, 1);
   		}

   		return alerts;
   }])

   //socket connection
	.factory('socket', function ($rootScope) {
	  var socket = io.connect();
	  return {
	    on: function (eventName, callback) {
	      socket.on(eventName, function () {  
	        var args = arguments;
	        $rootScope.$apply(function () {
	          callback.apply(socket, args);
	        });
	      });
	    },
	    emit: function (eventName, data, callback) {
	      socket.emit(eventName, data, function () {
	        var args = arguments;
	        $rootScope.$apply(function () {
	          if (callback) {
	            callback.apply(socket, args);
	          }
	        });
	      })
	    }
	  };
	});