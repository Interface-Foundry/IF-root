'use strict';

angular.module('tidepoolsServices')
    .factory('mapManager', ['leafletData', '$rootScope', 'bubbleTypeService',
		function(leafletData, $rootScope, bubbleTypeService) { //manages and abstracts interfacing to leaflet directive
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
			targetPt = map.project([latlng[1], latlng[0]], z).add([w*xpart,h*ypart-(68/2)]); // where 68px is the height of #top-shelf
			console.log(targetPt);
			targetLatLng = map.unproject(targetPt, z);
			console.log(targetLatLng);
			angular.extend(mapManager.center, {lat: targetLatLng.lat, lng: targetLatLng.lng, zoom: z});
			console.log(mapManager.center);
			mapManager.refresh();
	});
}

mapManager.setCenterWithFixedAperture = function(latlng, z, xOffset, yOffset) {
	var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
		w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0), targetPt, targetLatLng, dX, dY;

	if (xOffset) { dX = w/2 - xOffset/2;} else {dX = 0}
	if (yOffset) { dY = h/2 - yOffset/2 - 30;} else {dY = -30}

	leafletData.getMap().then(function(map) {
		targetPt = map.project([latlng[1], latlng[0]], z).add([dX, dY]);
		targetLatLng = map.unproject(targetPt, z);
		angular.extend(mapManager.center, {lat: targetLatLng.lat, lng: targetLatLng.lng, zoom: z});
		mapManager.refresh();
	});
}

mapManager.apertureUpdate = function(state) {
	if (mapManager._actualCenter && mapManager._z) {
		mapManager.setCenter(mapManager._actualCenter, mapManager._z, state);
	}
}

//use bounds from array of markers to set more accruate center
mapManager.setCenterFromMarkers = function(markers) {
	leafletData.getMap().then(function(map) {
		map.fitBounds(
			L.latLngBounds(markers.map(latLngFromMarker)),
			{maxZoom: 20}
		)
	});
	
	function latLngFromMarker(marker) {
		return [marker.lat, marker.lng];
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

mapManager.addMarkers = function(markers) {
	if (_.isArray(markers)) {
		angular.extend(mapManager.markers, _.indexBy(markers, function(marker) {
			return marker._id;
		}))
	} else {
		angular.extend(mapManager.markers, markers);
	}
}

mapManager.newMarkerOverlay = function(landmark) {
	var layer = landmark.loc_info ? String(landmark.loc_info.floor_num) || '1' : '1';
	if (mapManager.layers.overlays[layer + '-landmarks']) {
		return;
	} else {
		mapManager.layers.overlays[layer + '-landmarks'] = {
			type: 'group',
			name: layer + '-landmarks',
			visible: false
		};
	}
}

mapManager.toggleOverlay = function(layer) {
	if (!mapManager.layers.overlays.hasOwnProperty(layer)) {
		return;
	}
	return mapManager.layers.overlays[layer].visible = !mapManager.layers.overlays[layer].visible;
}

mapManager.turnOffOverlay = function(layer) {
	if (!mapManager.layers.overlays.hasOwnProperty(layer)) {
		return;
	}
	return mapManager.layers.overlays[layer].visible = false;
}

mapManager.findVisibleLayers = function() {
	return _.filter(mapManager.layers.overlays, function(l) {
		return l.visible === true;
	});
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

mapManager.setMarkers = function(markers) {
	if (_.isArray(markers)) {
		mapManager.markers = _.indexBy(markers, function(marker) {
			return marker._id;
		})
	} else {
		mapManager.markers = markers;
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

mapManager.setMarkerSelected = function(key) {
	console.log('--setMarkerSelected()--');
	
	// reset all marker images to default
	angular.forEach(mapManager.markers, function(marker) {
		if (bubbleTypeService.get() !== 'Retail') {
			marker.icon.iconUrl = 'img/marker/bubble-marker-50.png';
		}
	});

	// set new image for selected marker
	if (mapManager.markers.hasOwnProperty(key)) {
		console.log('setting marker as selected');
		if (bubbleTypeService.get() !== 'Retail' ||	mapManager.markers[key].icon.iconUrl === 'img/marker/bubble-marker-50.png') {
			mapManager.markers[key].icon.iconUrl = 'img/marker/bubble-marker-50_selected.png';
		}
		return true;
	} else {
		console.log('Key not found in markers');
		return false;
	}
};

mapManager.setNewIcon = function(landmark) {
	mapManager.markers[landmark._id].icon.iconUrl = landmark.avatar;
	mapManager.markers[landmark._id].icon.iconAnchor = [25, 25];
	mapManager.markers[landmark._id].icon.iconSize = [50, 50];
}

mapManager.bringMarkerToFront = function(key) {
	console.log('--bringMarkerToFront--');

	// reset all z-indices to 0
	angular.forEach(mapManager.markers, function(marker) {
		marker.zIndexOffset = 0;
	});

	// set z-index for selected marker
	if (mapManager.markers.hasOwnProperty(key)) {
		console.log('setting z-index offset');
		mapManager.markers[key].zIndexOffset = 1000;
		return true;
	} else {
		console.log('Key not found in markers');
		return false;
	}
};

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

mapManager.setBaseLayer = function(layerURL, localMaps) {
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

mapManager.findZoomLevel = function(localMaps) {
	if (!localMaps) {
		return;
	}
	var zooms = _.chain(localMaps)
		.map(function(m) {
			if (m.localMapOptions){
				return m.localMapOptions.minZoom;
			}
		})
		.filter(function(m) {
			return m;
		})
		.value();
	var lowestZoom = _.isEmpty(zooms) ? null : _.min(zooms);

	return lowestZoom;
}

mapManager.setBaseLayerFromID = function(ID) {
	mapManager.setBaseLayer(
	'https://{s}.tiles.mapbox.com/v3/'+
	ID+
	'/{z}/{x}/{y}.png');
}

mapManager.findMapFromArray = function(mapArray) {
	// sort floors low to high and get rid of null floor_nums
	// var sortedFloors = _.chain(mapArray)
	// 	.filter(function(floor) {
	// 		return floor.floor_num;
	// 	})
	// 	.sortBy(function(floor) {
	// 		return floor.floor_num;
	// 	})
	// 	.value();
	// // will return lowest number floor or undefined if none
	// sortedFloors = sortedFloors.filter(function(floor) {
	// 	return floor.floor_num === sortedFloors[0].floor_num;
	// });

	var sortedFloors = _.chain(mapArray)
		.sortBy(function(floor) {
			return floor.floor_num;
		})
		.value();

	return sortedFloors;
}


// mapManager.addOverlay = function(localMapID, localMapName, localMapOptions) {
// 	console.log('addOverlay');

// 	var newOverlay = {};
// 	// if (localMapOptions.maxZoom>19) {
// 	// 	localMapOptions.maxZoom = 19;
// 	// }
// 	localMapOptions.zIndex = 10;
// 	console.log('requesting new overlay')
// 	mapManager.layers.overlays[localMapID] = {
// 		name: localMapName,
// 		type: 'xyz',
// 		url: 'https://bubbl.io/maps/'+localMapID+'/{z}/{x}/{y}.png',
// 		layerOptions: localMapOptions,
// 		visible: true,
// 		opacity: 0.8
// 	};/*
	

// 	mapManager.layers.overlays = newOverlay;
// */


// 	console.log(mapManager);
// 	console.log(newOverlay);
// 	// mapManager.refresh();
// };

mapManager.addOverlay = function(localMapID, localMapName, localMapOptions) {
	console.log('addOverlay');

	var newOverlay = {};
	// if (localMapOptions.maxZoom>19) {
	// 	localMapOptions.maxZoom = 19;
	// }
	localMapOptions.zIndex = 10;
	console.log('requesting new overlay')
	newOverlay = {
		name: localMapName,
		type: 'xyz',
		url: 'https://bubbl.io/maps/'+localMapID+'/{z}/{x}/{y}.png',
		layerOptions: localMapOptions,
		visible: true,
		opacity: 0.8
	};
	return newOverlay;
}

mapManager.addOverlayGroup = function(overlays, groupName) {
	if (mapManager.layers.overlays.hasOwnProperty(groupName)) {
		mapManager.layers.overlays[groupName].layers = mapManager.layers.overlays[groupName].layers.concat(overlays);
	} else {
		var group = {
			type: 'group',
			name: groupName,
			layerOptions: {
				layers: []
			},
			visible: false
		};
		overlays.forEach(function(overlay) {
			group.layerOptions.layers.push(overlay);
		})

		mapManager.layers.overlays[groupName] = group;
	}
}

mapManager.overlayExists = function(layerName) {
	return mapManager.layers.overlays.hasOwnProperty(layerName);
}


mapManager.removeOverlays = function(type) {
	if (type) {
		var temp = mapManager.layers.overlays;
		mapManager.layers.overlays = {};
		for (var p in temp) {
			if (temp[p].type !== type) {
				mapManager.layers.overlays[p] = temp[p];
			}
		}
	} else {
		mapManager.layers.overlays = {};
		mapManager.refresh();
	}
}


mapManager.addCircleMaskToMarker = function(key, radius, state) {
	console.log('addCircleMaskToMarker');
	mapManager.circleMaskLayer = new L.IFCircleMask(mapManager.markers[key], 120, state);
	leafletData.getMap().then(function(map) {
		map.addLayer(mapManager.circleMaskLayer);
		mapManager._cMLdereg = $rootScope.$on('leafletDirectiveMarker.dragend', function(event) {
			mapManager.circleMaskLayer._draw();
		});
	});
}

mapManager.localMapArrayExists = function(world) {
	return world && world.style && world.style.maps 
		&& world.style.maps.localMapArray && world.style.maps.localMapArray.length > 0;
}

mapManager.filterToCurrentFloor = function(sortedFloors, currentFloor) {
	return sortedFloors.filter(function(f) {
		return f.floor_num === currentFloor;
	});
}

mapManager.sortFloors = function(mapArray) {
	// sort floors low to high and get rid of null floor_nums
	return _.chain(mapArray)
		.filter(function(floor) {
			return floor.floor_num;
		})
		.sortBy(function(floor) {
			return floor.floor_num;
		})
		.value();
}

mapManager.groupFloorMaps = function(worldStyle) {
	if (!worldStyle.hasOwnProperty('maps')) {
		return;
	}

	// legacy maps
	var localMaps = [worldStyle.maps];
	
	// if localMapArray exists, replace local map with sorted array
	if (hasLocalMapArray(worldStyle.maps)) {
		localMaps = _.groupBy(worldStyle.maps.localMapArray, function(m) {
			return m.floor_num
		});
		for (mapGroup in localMaps) {
			var overlayGroup = localMaps[mapGroup].map(function(m) {
				return mapManager.addOverlay(m.localMapID, m.localMapName, m.localMapOptions);
			});
			var groupName = mapGroup + '-maps';
			mapManager.addOverlayGroup(overlayGroup, groupName);
		}
	}
}

function hasLocalMapArray(maps) {
	return maps.localMapArray && maps.localMapArray.length;
}

mapManager.setCircleMaskState = function(state) {
	if (mapManager.circleMaskLayer) {
		mapManager.circleMaskLayer._setState(state);
	} else {
		console.log('no circleMaskLayer');
	}
}

mapManager.setCircleMaskMarker = function(key) {
	if (mapManager.circleMaskLayer) {
		mapManager.circleMaskLayer._setMarker(mapManager.markers[key]);
	}
}

mapManager.removeCircleMask = function() {
	var layer = mapManager.circleMaskLayer;
	if (mapManager.circleMaskLayer) {
		console.log('removeCircleMask');
		leafletData.getMap().then(function(map) {
			map.removeLayer(layer);
			mapManager._cMLdereg();
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

mapManager.fadeMarkers = function(bool) {
	leafletData.getMap().then(function(map) {
		var container = map.getContainer();
		if (bool===true) {
			container.classList.add('fadeMarkers');
			console.log(container.classList);
		} else {
			container.classList.remove('fadeMarkers')
		}
	})
}

mapManager.hasMarker = function(key) {
	return mapManager.markers.hasOwnProperty(key);
}

mapManager.loadBubble = function(bubble, config) {
	//config is of form
	//{center: true/false, 	//set the center
	//	marker: true/false  //add marker
	var zoomLevel = 18,
		config = config || {};
	if (bubble.hasOwnProperty('loc') && bubble.loc.hasOwnProperty('coordinates')) {
		if (config.center) {mapManager.setCenter([bubble.loc.coordinates[0], bubble.loc.coordinates[1]], zoomLevel, apertureService.state);}
		if (config.marker) {mapManager.addMarker('c', {
				lat: bubble.loc.coordinates[1],
				lng: bubble.loc.coordinates[0],
				icon: {
					iconUrl: 'img/marker/bubble-marker-50.png',
					shadowUrl: '',
					iconSize: [35, 67], 
					iconAnchor: [17, 67],
					popupAnchor:[0, -40]
				},
				message:'<a href="#/w/'+bubble.id+'/">'+bubble.name+'</a>',
		});}
		
		} else {
			console.error('No center found! Error!');
		}
		
		if (bubble.style.hasOwnProperty('maps')) {
				if (bubble.style.maps.localMapID) {
					mapManager.addOverlay(bubble.style.maps.localMapID, 
							bubble.style.maps.localMapName, 
							bubble.style.maps.localMapOptions);
				}
				
				if (bubble.style.maps.hasOwnProperty('localMapOptions')) {
					zoomLevel = bubble.style.maps.localMapOptions.maxZoom || 19;
				}
		
				if (tilesDict.hasOwnProperty(bubble.style.maps.cloudMapName)) {
					mapManager.setBaseLayer(tilesDict[bubble.style.maps.cloudMapName]['url']);
				} else if (bubble.style.maps.hasOwnProperty('cloudMapID')) {
					mapManager.setBaseLayer('https://{s}.tiles.mapbox.com/v3/'+bubble.style.maps.cloudMapID+'/{z}/{x}/{y}.png');
				} else {
					console.warn('No base layer found! Defaulting to forum.');
					mapManager.setBaseLayer('https://{s}.tiles.mapbox.com/v3/interfacefoundry.jh58g2al/{z}/{x}/{y}.png');
				}
		}
	
}

return mapManager;
    }]);