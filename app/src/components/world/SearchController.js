app.controller('SearchController', ['$scope', '$location', '$routeParams', '$timeout', 'apertureService', 'worldTree', 'mapManager', 'bubbleTypeService', 'worldBuilderService', 'bubbleSearchService', 'floorSelectorService', function($scope, $location, $routeParams, $timeout, apertureService, worldTree, mapManager, bubbleTypeService, worldBuilderService, bubbleSearchService, floorSelectorService) {

	$scope.aperture = apertureService;
	$scope.bubbleTypeService = bubbleTypeService;
	$scope.currentFloor = floorSelectorService.currentFloor;
	$scope.populateSearchView = populateSearchView;
	$scope.go = go;
	$scope.groups;
	$scope.world;
	$scope.style;
	$scope.searchBarText;
	$scope.show;
	
	var map = mapManager;

	$scope.aperture.set('third');

	worldTree.getWorld($routeParams.worldURL).then(function(data) {
		$scope.world = data.world;
		$scope.style = data.style;

		worldBuilderService.loadWorld($scope.world);

		// call populateSearchView with the right parameters
		if ($routeParams.category) {
			populateSearchView($routeParams.category, 'category');
		} else if ($routeParams.text) {
			populateSearchView($routeParams.text, 'text');
		} else if ($location.path().slice(-3) === 'all') {
			populateSearchView('All', 'all');
		} else {
			populateSearchView(bubbleSearchService.defaultText, 'generic');
		}
	
	});

	function go(path) {
		$location.path(path);
	}

	function groupResults(data, searchType) {
		// groups array of landmarks correctly, such that they are sorted properly for the view (ng-repeat)
		if (searchType === 'all') {
			// group landmarks by category, then first letter, then sort
			var groups = _.chain(data)
				// group landmarks by category
				.groupBy(function(landmark) {
					return landmark.category || 'Other';
				})
				.each(function(value, key, list) {
					list[key] = _.chain(value)
						// 1st sort puts landamrks in order
						.sortBy(function(result) {
							return result.name.toLowerCase();
						})
						// group landmarks by first letter
						.groupBy(function(result) {
							var firstChar = result.name[0];
							if (firstChar.toUpperCase() !== firstChar.toLowerCase()) { // not a letter (regex might be better here)
								return firstChar.toUpperCase();
							} else { // number, #, ., etc...
								return '#';
							}
						})
						// map from object {A: [landmark1, landmark2], B: [landmark3, landmark4]} to array of objects [{letter: 'A', results: [landmark1, landmark2]}, {letter: 'B', results: [landmark3, landmark4]}], which enables sorting
						.map(function(group, key) {
							return {
								letter: key,
								results: group
							}
						})
						.sortBy('letter')
						.value();
				})
				.map(function(group, key) {
					return {
						catName: key,
						// avatar: _.findWhere($scope.world.landmarkCategories, {
						// 	name: key
						// }).avatar,
						results: group
					}
				})
				.sortBy(function(result) {
					return result.catName.toLowerCase();
				})
				.value()
		} else {
			// group landmarks by first letter, then sort
			// same as above, without grouping by category
			var groups = _.chain(data)
				.sortBy(function(result) {
					return result.name.toLowerCase();
				})
				.groupBy(function(result) {
					var firstChar = result.name[0];
					if (firstChar.toUpperCase() !== firstChar.toLowerCase()) { 
						return firstChar.toUpperCase();
					} else { 
						return '#';
					}
				})
				.map(function(group, key) {
					return {
						letter: key,
						results: group
					}
				})
				.sortBy('letter')
				.value();
		}
		return groups;
	}

	function populateSearchView(input, searchType) {
		var decodedInput = decodeURIComponent(input);
		// set text in catSearchBar
		$scope.searchBarText = decodedInput;
		$scope.show = { // used for displaying different views
			all: false,
			category: false,
			text: false,
			generic: false
		};
		$scope.show[searchType] = true;
		if (!$scope.show.generic) { // don't call bubbleservice search when we aren't requesting any data
			bubbleSearchService.search(searchType, $scope.world._id, decodedInput)
				.then(function(response) {
					$scope.groups = groupResults(bubbleSearchService.data, searchType);
					updateMap(bubbleSearchService.data);
				});
		}
	}

	function updateMap() {
		var landmarks = bubbleSearchService.data;

		// check if results on more than 1 floor and if so open selector
		if (floorSelectorService.landmarksToFloors(landmarks).length > 1) {
			floorSelectorService.showFloors = true;
		} else {
			floorSelectorService.showFloors = false;
		}

		// if no results, return
		if (!landmarks.length) {
			mapManager.removeAllMarkers();
			return;
		}

		mapManager.findVisibleLayers().forEach(function(l) {
			mapManager.toggleOverlay(l.name);			
		});
		// if no results on current floor, update floor map to nearest floor
		updateFloorMaps(landmarks);

		// create landmarks for all that match search, but only show landmarks on current floor
		updateLandmarks(landmarks);

		updateFloorIndicator(landmarks);
	}

	function updateFloorMaps(landmarks) {

		var floor = floorSelectorService.currentFloor.floor_num || floorSelectorService.currentFloor.loc_info.floor_num,
				resultFloors = floorSelectorService.landmarksToFloors(landmarks);

		if (resultFloors.indexOf(floor) < 0) {
			var sortedMarks = _.chain(landmarks)
				.filter(function(l) {
					return l.loc_info;
				})
				.sortBy(function(l) {
					return l.loc_info.floor_num;
				})
				.value();

			angular.copy(sortedMarks[0], $scope.currentFloor);
			floorSelectorService.setCurrentFloor(sortedMarks[0]);
			floor = floorSelectorService.currentFloor.floor_num || floorSelectorService.currentFloor.loc_info.floor_num;
		}
		mapManager.turnOnOverlay(String(floor).concat('-maps'));
	}

	function updateLandmarks(landmarks) {
		var markers = landmarks.map(function(l) {
			return mapManager.markerFromLandmark(l, $scope.world)
		});
		var floor = floorSelectorService.currentFloor.floor_num ? 
								String(floorSelectorService.currentFloor.floor_num) :
								String(floorSelectorService.currentFloor.loc_info.floor_num);

		landmarks.forEach(function(m) {
			mapManager.newMarkerOverlay(m);
		});
		
		mapManager.setCenterFromMarkersWithAperture(markers, $scope.aperture.state);

		mapManager.setMarkers(markers);

		mapManager.turnOnOverlay(floor.concat('-landmarks'));

	}

	function updateFloorIndicator(landmarks) {
		var floor = floorSelectorService.currentFloor.floor_num || floorSelectorService.currentFloor.loc_info.floor_num,
				resultFloors = floorSelectorService.landmarksToFloors(landmarks);
		var floors = floorSelectorService.floors.map(function(f) {
			return f[0].floor_num;
		})
		var i = floors.indexOf(floor);

		floorSelectorService.setSelectedIndex(i);
		floorSelectorService.updateIndicator(true);
	}

}]);