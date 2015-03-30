'use strict';

app.controller('SuperuserEntriesController', SuperuserEntriesController);

SuperuserEntriesController.$inject = ['$scope', 'Entries','$routeParams', '$location', 'superuserService'];

function SuperuserEntriesController($scope, Entries, $routeParams, $location, superuserService) {

	$scope.currentRoute = superuserService.getCurrentRoute();
	$scope.entries = [];
	$scope.region = $routeParams.region;
	$scope.routes = superuserService.routes;
	
	activate();

	function activate() {
		Entries.query({
			id: $scope.region
		}, {
			number: $scope.entries.length
		}).$promise
    .then(function(response) {
      $scope.entries = response;
    });
	}

	$scope.changeRoute = function() {
		superuserService.changeRoute($scope.currentRoute, $scope.region);
	}

}