'use strict';

app.factory('worldBuilderService', worldBuilderService);

worldBuilderService.$inject = ['mapManager', 'userManager', 'localStore'];

function worldBuilderService(mapManager, userManager, localStore) {

	var currentWorldId;

	return {
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
			mapManager.setCenter([world.loc.coordinates[0], world.loc.coordinates[1]], zoomLevel, aperture.state);
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

		createMapLayer(world);

	}
	function addWorldMarker() {
		mapManager.addMarker('c', {
			lat: world.loc.coordinates[1],
			lng: world.loc.coordinates[0],
			icon: {
				iconUrl: 'img/marker/bubble-marker-50.png',
				shadowUrl: '',
				iconSize: [35, 67],
				iconAnchor: [17, 67],
				popupAnchor:[0, -40]
			},
			message:'<a href="#/w/'+world.id+'/">'+world.name+'</a>',
		});
	}

	function createMapLayer(world) {
		var lowestFloor = 1,
				mapLayer;
		if (mapManager.localMapArrayExists(world)) {
			lowestFloor = mapManager.sortFloors(world.style.maps.localMapArray)[0].floor_num;
		}
		mapLayer = lowestFloor + '-maps';
		mapManager.toggleOverlay(mapLayer);
	}

}