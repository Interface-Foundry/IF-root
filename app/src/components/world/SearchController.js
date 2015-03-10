app.controller('SearchController', ['$scope', '$location', '$routeParams', '$timeout', 'apertureService', 'worldTree', 'mapManager', 'bubbleTypeService', 'worldBuilderService', 'bubbleSearchService', function($scope, $location, $routeParams, $timeout, apertureService, worldTree, mapManager, bubbleTypeService, worldBuilderService, bubbleSearchService) {

	$scope.aperture = apertureService;
	$scope.bubbleTypeService = bubbleTypeService
	$scope.groups;
	$scope.world;
	$scope.style;
	$scope.showAll;
	$scope.showCategory;
	$scope.showText;
	$scope.searchBarText;
	
	var map = mapManager;

	$scope.aperture.set('third');

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
			$scope.showCategory = true;
			$scope.searchBarText = routeParams.category;
			searchType = 'category';
			input = routeParams.category;
		} else if (routeParams.text) {
			$scope.showText = true;
			$scope.searchBarText = routeParams.text;
			searchType = 'text';
			input = routeParams.text;
		} else {
			if ($location.path().slice(-3) === 'all') { // last 3 letters
				$scope.showAll = true;
				$scope.searchBarText = 'All';
				searchType = 'all';
				input = 'null';
			} else { // generic search
				$scope.showAll = false;
				$scope.showCategory = false;
				$scope.showText = false;
				$scope.searchBarText = 'What are you looking for?';
			}
		}

		if (searchType) {
			bubbleSearchService.search(searchType, $scope.world._id, input)
				.then(function(response) {
					$scope.groups = groupResults(bubbleSearchService.data);
				});
		}
	}

}]);