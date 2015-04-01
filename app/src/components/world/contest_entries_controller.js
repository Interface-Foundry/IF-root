'use strict';

app.controller('ContestEntriesController', ContestEntriesController);

ContestEntriesController.$inject = ['$scope', '$routeParams', '$rootScope', 'Entries', 'worldTree', 'styleManager'];

function ContestEntriesController($scope, $routeParams, $rootScope, Entries, worldTree, styleManager) {

	$scope.hashTag = $routeParams.hashTag;
	$scope.loadEntries = loadEntries;
	$scope.entries = [];
	$scope.region = 'global';
	$scope.style;
	$scope.worldId = $routeParams.worldURL;

	activate();

	function activate() {
		loadEntries();

    worldTree.getWorld($routeParams.worldURL).then(function(data) {
			$scope.style = data.style;
			styleManager.navBG_color = $scope.style.navBG_color;
			// $rootScope.hideBack = false;
		});
	}

	function loadEntries() {
		Entries.resource.query({
			id: $scope.region
		}, {
			number: $scope.entries.length
		}).$promise
    .then(function(response) {
      $scope.entries = $scope.entries.concat(response);
    }, function(error) {
    	console.log('Error:', error);
    });
	}
}