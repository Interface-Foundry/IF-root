'use strict';

app.factory('worldBuilderService', worldBuilderService);

worldBuilderService.$inject = ['mapManager', 'userManager', 'localStore', 'apertureService'];

function worldBuilderService(mapManager, userManager, localStore, apertureService) {

	var currentWorldId;

	return {
		createMapLayer: createMapLayer,
		currentWorldId: currentWorldId,
		loadWorld: loadWorld
	};
	
	function loadWorld(world) {
		if (currentWorldId && world._id === currentWorldId) {
			return;
		}

		currentWorldId = world._id;	

		//local storage
		if (!userManager.loginStatus && !localStore.getID()) {
	 		localStore.createID();
	 	}
		
		// set appropriate zoom level based on local maps
		var zoomLevel = 18;

		if (world.style.hasOwnProperty('maps') && world.style.maps.hasOwnProperty('localMapOptions')) {
			if (world.style.maps.localMapArray){
				if (world.style.maps.localMapArray.length > 0) {
					zoomLevel = mapManager.findZoomLevel(world.style.maps.localMapArray);
				} 
			}
			else {
				zoomLevel = world.style.maps.localMapOptions.minZoom || 18;
			}
		};

		//map setup
		if (world.hasOwnProperty('loc') && world.loc.hasOwnProperty('coordinates')) {
			mapManager.setCenter([world.loc.coordinates[0], world.loc.coordinates[1]], zoomLevel, apertureService.state);
			console.log('setcenter');

			// if bubble has local maps then do not show world marker
			if (!mapManager.localMapArrayExists(world)) {
				addWorldMarker();
			}

		} else {
			console.error('No center found! Error!');
		}

		var worldStyle = world.style;
		mapManager.groupFloorMaps(worldStyle);

		if (worldStyle.maps.hasOwnProperty('localMapOptions')) {
			zoomLevel = Number(worldStyle.maps.localMapOptions.maxZoom) || 22;
		}

		if (tilesDict.hasOwnProperty(worldStyle.maps.cloudMapName)) {
			mapManager.setBaseLayer(tilesDict[worldStyle.maps.cloudMapName]['url']);
		} else if (worldStyle.maps.hasOwnProperty('cloudMapID')) {
			mapManager.setBaseLayer('https://{s}.tiles.mapbox.com/v3/'+worldStyle.maps.cloudMapID+'/{z}/{x}/{y}.png');
		} else {
			console.warn('No base layer found! Defaulting to forum.');
			mapManager.setBaseLayer('https://{s}.tiles.mapbox.com/v3/interfacefoundry.jh58g2al/{z}/{x}/{y}.png');
		}

		var mapLayer = createMapLayer(world);
		mapManager.toggleOverlay(mapLayer);

	}
	function addWorldMarker() {
		mapManager.addMarker('c', {
			lat: world.loc.coordinates[1],
			lng: world.loc.coordinates[0],
			icon: {
				iconUrl: 'img/marker/bubbleMarker_24.png',
				shadowUrl: '',
				iconSize: [24, 24],
				iconAnchor: [11, 11],
				popupAnchor:[0, -12]
			},
			message:'<a href="#/w/'+world.id+'/">'+world.name+'</a>',
		});
	}

	function createMapLayer(world) {
		var lowestFloor = 1,
				mapLayer;
		if (mapManager.localMapArrayExists(world)) {
			sortedFloorNums = mapManager.sortFloors(world.style.maps.localMapArray)
				.map(function(f) {
					return f.floor_num;
				});
			lowestFloor = lowestPositiveNumber(sortedFloorNums);
		}
		return mapLayer = lowestFloor + '-maps';
	}

	function lowestPositiveNumber(array) {
		var highestNegative;
	
		for (var i = 0, len = array.length; i < len; i++) {
			if (array[i] > 0) {
				return array[i];
			} else {
				highestNegative = Math.max(highestNegative, array[i]);
			}
		}

		// if no positive floor numbers, return floor closest to 0
		if (highestNegative) {
			return highestNegative;
		}

		// if the above fails - which it shouldn't - return floor 1
		return 1;
	}

}