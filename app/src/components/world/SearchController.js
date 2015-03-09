app.controller('SearchController', ['$scope', '$routeParams', '$timeout', 'apertureService', 'worldTree', 'mapManager', 'bubbleTypeService', function($scope, $routeParams, $timeout, apertureService, worldTree, mapManager, bubbleTypeService) {

	$scope.aperture = apertureService;
	$scope.bubbleTypeService = bubbleTypeService
	$scope.groups;
	$scope.world;
	$scope.style;
	
	var map = mapManager;

	$scope.aperture.set('third');

	worldTree.getWorld($routeParams.worldURL).then(function(data) {
		$scope.world = data.world;
		$scope.style = data.style;

		// used for dummy data. this should actually be coming from http.get
		worldTree.getLandmarks($scope.world._id).then(function(data) {
			$scope.groups = groupResults(data);
		});
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

}]);