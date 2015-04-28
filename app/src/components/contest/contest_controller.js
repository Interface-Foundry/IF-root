'use strict';

app.controller('ContestController', ContestController);

ContestController.$inject = ['$scope', '$routeParams', '$sce', 'Contests'];

function ContestController($scope, $routeParams, $sce, Contests) {
	$scope.contest = {};
	$scope.region = $routeParams.region;

	activate();

	function activate() {
		Contests.get({
			id: $scope.region
		}).$promise
    .then(function(response) {
    	if (response._id) {
      	$scope.contest = response;
    	}
    }, function(error) {
    	console.log('Error:', error);
    });
	}
}