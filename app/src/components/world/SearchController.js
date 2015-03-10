app.controller('SearchController', ['$scope', '$routeParams', '$timeout', 'apertureService', 'worldTree', 'mapManager', 'bubbleTypeService', 'worldBuilderService', 'bubbleSearchService', 'floorSelectorService', function($scope, $routeParams, $timeout, apertureService, worldTree, mapManager, bubbleTypeService, worldBuilderService, bubbleSearchService, floorSelectorService) {

	$scope.aperture = apertureService;
	$scope.bubbleTypeService = bubbleTypeService;
	$scope.currentFloor = floorSelectorService.currentFloor;
	$scope.groups;
	$scope.world;
	$scope.selectedIndex;
	$scope.style;
	$scope.showAll;
	$scope.showCategory;
	$scope.showFloors;
	$scope.showText;
	
	var map = mapManager;

	// $scope.aperture.set('third');

	worldTree.getWorld($routeParams.worldURL).then(function(data) {
		$scope.world = data.world;
		$scope.style = data.style;

		worldBuilderService.loadWorld($scope.world);

		populateSearchView($routeParams);
	
	});

	function groupResults(data) {
		var groups = _.chain(data)
			// group landmarks by first letter
			.groupBy(function(result) {
				return result.name[0].toUpperCase();
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
		return groups;
	}

	function populateSearchView(routeParams) {
		var searchType;
		var input;
		if (routeParams.category) {
			if (routeParams.category === 'all') {
				$scope.showAll = true;
				searchType = 'all';
			}
			$scope.showCategory = true;
			searchType = 'category';
			input = routeParams.category;
		} else if (routeParams.text) {
			$scope.showText = true;
			searchType = 'text';
			input = routeParams.text;
		} else { // generic search
			$scope.showAll = false;
			$scope.showCategory = false;
			$scope.showText = false;
		}

		if (searchType) {
			bubbleSearchService.search(searchType, $scope.world._id, input)
				.then(function(data) {
					$scope.groups = groupResults(bubbleSearchService.data);
					updateMap(bubbleSearchService.data);
				});
		}
	}

	function updateSelectedIndex() {

	}

	function updateMap(landmarks) {
		// check if results on more than 1 floor and if so open selector
		if (floorSelectorService.landmarksToFloors(landmarks).length > 1) {
			floorSelectorService.showFloors = true;
			$scope.showFloors = floorSelectorService.showFloors;
		} else {
			floorSelectorService.showFloors = false;
			$scope.showFloors = floorSelectorService.showFloors;
		}
		// floor map / current floor should not change

		// create landmarks for all that match search, but only show landmarks on current floor
		updateLandmarks(landmarks);
	}

	function updateLandmarks(landmarks) {
		var markers = landmarks.map(mapManager.markerFromLandmark),
				floor = String(floorSelectorService.currentFloor.floor_num);

		landmarks.forEach(function(m) {
			mapManager.newMarkerOverlay(m);
		});
		
		// mapManager.setCenterFromMarkers(markers);
		mapManager.setMarkers(markers);
		mapManager.toggleOverlay(floor.concat('-landmarks'));

	}

}]);