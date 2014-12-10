'use strict';

angular.module('tidepoolsServices')
    .factory('mapManager', ['leafletData', '$rootScope', 
    	function(leafletData, $rootScope) {
var mapManager = {
	center: {
		lat: 42,
		lng: -83,
		zoom: 14
		},
	markers: {},
	layers: {
		baselayers: {
			baseMap: {
				name: "Urban",
				url: 'https://{s}.tiles.mapbox.com/v3/interfacefoundry.ig6a7dkn/{z}/{x}/{y}.png',
				type: 'xyz',
				top: true,
				maxZoom: 23,
    			maxNativeZoom: 23
			}
		},
		overlays: {
		}
	},
	paths: {/*
worldBounds: {
			type: 'circle',
			radius: 150,
			latlngs: {lat:40, lng:20}
		}
*/},
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

mapManager.setCenter = function(latlng, z, state) { //state is aperture state
	console.log('--mapManager--');
	console.log('--setCenter--', latlng, z, state);
	mapManager._actualCenter = latlng;
	mapManager._z = z;
	
	switch (state) {
		case 'aperture-half':
			mapManager.setCenterWithAperture(latlng, z, 0, .25)
			break;
		case 'aperture-third': 
			mapManager.setCenterWithAperture(latlng, z, 0, .35);
			break;
		case 'editor':
			mapManager.setCenterWithAperture(latlng, z, -.2,0);
			break;
		default:
			angular.extend(mapManager.center, {lat: latlng[1], lng: latlng[0], zoom: z});
			mapManager.refresh();
	}
}

mapManager.setCenterWithAperture = function(latlng, z, xpart, ypart) {
	console.log('setCenterWithAperture', latlng, z, xpart, ypart);
	var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
		w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
		targetPt, targetLatLng;
	console.log(h,w);
	
	leafletData.getMap().then(function(map) {
			targetPt = map.project([latlng[1], latlng[0]], z).add([w*xpart,h*ypart]);
			console.log(targetPt);
			targetLatLng = map.unproject(targetPt, z);
			console.log(targetLatLng);
			angular.extend(mapManager.center, {lat: targetLatLng.lat, lng: targetLatLng.lng, zoom: z});
			console.log(mapManager.center);
			mapManager.refresh();
	});
}

mapManager.apertureUpdate = function(state) {
	if (mapManager._actualCenter && mapManager._z) {
		mapManager.setCenter(mapManager._actualCenter, mapManager._z, state);
	}
}

mapManager.resetMap = function() {
	mapManager.removeAllMarkers();
	mapManager.removeAllPaths();
	mapManager.removeOverlays();
	mapManager.removeCircleMask();
	mapManager.removePlaceImage();
	mapManager.refresh();
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
			mapManager.markers[key] = marker;
			console.log('Marker added');
		}
	} else {
		mapManager.markers[key] = marker;
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

mapManager.removeAllMarkers = function() {
	console.log('--removeAllMarkers--');
	mapManager.markers = {};
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
			mapManager.paths[key] = path;
			console.log(mapManager.paths[key]);
			return mapManager.paths[key];
		}	
	} else { //key is free
		console.log('else2');
		mapManager.paths[key] = path; 
		console.log(mapManager.paths[key]);
		return mapManager.paths[key];
	}
	
	refreshMap();
}

mapManager.removeAllPaths = function() {
	mapManager.paths = {};
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
	leafletData.getMap().then(function(map) {
		map.setMaxBounds([
			[sWest[0], sWest[1]],
			[nEast[0], nEast[1]]
		]);
	mapManager.refresh();
	});
}

/* setMaxBoundsFromPoint
	set max bounds with a point and a distance
	point: the center of the max bounds
	distance: orthogonal distance from point to bounds
*/ 
mapManager.setMaxBoundsFromPoint = function(point, distance) {
	leafletData.getMap().then(function(map) {
		setTimeout(function() {map.setMaxBounds([
			[point[0]-distance, point[1]-distance],
			[point[0]+distance, point[1]+distance]
		])}, 400);
	mapManager.refresh();
	});
	return true;
}

mapManager.refresh = function() {
	refreshMap();
}

function refreshMap() { 
	console.log('--refreshMap()--');
    console.log('invalidateSize() called');
    leafletData.getMap().then(function(map){
   	 setTimeout(function(){ map.invalidateSize()}, 400);
    });
}

mapManager.setBaseLayer = function(layerURL) {
	console.log('new base layer');
	mapManager.layers.baselayers = {};
	mapManager.layers.baselayers[layerURL] = {
		name: 'newBaseMap',
		url: layerURL,
		type: 'xyz',
		layerParams: {},
		layerOptions: {
			minZoom: 1,
			maxZoom: 23
		}
	};	
}

mapManager.setBaseLayerFromID = function(ID) {
	mapManager.setBaseLayer(
	'https://{s}.tiles.mapbox.com/v3/'+
	ID+
	'/{z}/{x}/{y}.png');
}

mapManager.addOverlay = function(localMapID, localMapName, localMapOptions) {
	console.log('addOverlay');
	var newOverlay = {};
	// if (localMapOptions.maxZoom>19) {
	// 	localMapOptions.maxZoom = 19;
	// }
	localMapOptions.zIndex = 10;
	mapManager.layers.overlays[localMapName] = {
		name: localMapName,
		type: 'xyz',
		url: 'http://107.170.180.141/maps/'+localMapID+'/{z}/{x}/{y}.png',
		layerOptions: localMapOptions,
		visible: true,
		opacity: 0.8,
	};/*
	

	mapManager.layers.overlays = newOverlay;
*/
	console.log(mapManager);
	console.log(newOverlay);
};

mapManager.removeOverlays = function() {
	mapManager.layers.overlays = {};
	mapManager.refresh();
}


mapManager.addCircleMaskToMarker = function(key, radius, state) {
	console.log('addCircleMaskToMarker');
	mapManager.circleMaskLayer = new L.IFCircleMask(mapManager.markers[key], 150, state);
	leafletData.getMap().then(function(map) {
	map.addLayer(mapManager.circleMaskLayer);
	$rootScope.$on('leafletDirectiveMarker.dragend', function(event) {
		mapManager.circleMaskLayer._draw();
	});
	});
}

mapManager.setCircleMaskState = function(state) {
	if (mapManager.circleMaskLayer) {
		mapManager.circleMaskLayer._setState(state);
	} else {
		console.log('no circleMaskLayer');
	}
}

mapManager.removeCircleMask = function() {
	var layer = mapManager.circleMaskLayer;
	if (mapManager.circleMaskLayer) {
		console.log('removeCircleMask');
		leafletData.getMap().then(function(map) {
			map.removeLayer(layer);
		});
	} else {
		console.log('No circle mask layer.');
	}
}

mapManager.placeImage = function(key, url) {
	console.log('placeImage');
	mapManager.placeImageLayer = new L.IFPlaceImage(url, mapManager.markers[key]);
	leafletData.getMap().then(function(map) {
		map.addLayer(mapManager.placeImageLayer);
	});
	return function(i) {mapManager.placeImageLayer.setScale(i)}
}

mapManager.setPlaceImageScale = function(i) {
	mapManager.placeImageLayer.setScale(i);
}

mapManager.removePlaceImage = function() {
	if (mapManager.placeImageLayer) {
		leafletData.getMap().then(function(map) {
			map.removeLayer(mapManager.placeImageLayer);
		});
	} else {
		console.log('No place image layer.');
	}
}

mapManager.getPlaceImageBounds = function() {
	if (mapManager.placeImageLayer) {
		return mapManager.placeImageLayer.getBounds();
	}
}


return mapManager;
    }]);