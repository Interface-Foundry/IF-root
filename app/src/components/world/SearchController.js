app.controller('SearchController', ['$scope', '$routeParams', '$timeout', 'apertureService', 'worldTree', 'mapManager', 'bubbleTypeService', 'worldBuilderService', 'bubbleSearchService', function($scope, $routeParams, $timeout, apertureService, worldTree, mapManager, bubbleTypeService, worldBuilderService, bubbleSearchService) {

	$scope.aperture = apertureService;
	$scope.bubbleTypeService = bubbleTypeService
	$scope.groups;
	$scope.world;
	$scope.style;
	$scope.showAll;
	$scope.showCategory;
	$scope.showText;
	
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
				});
		}
	}

}]);