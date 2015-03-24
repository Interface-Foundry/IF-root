'use strict';

app.controller('ContestController', ContestController);

ContestController.$inject = ['$routeParams', 'contestService'];

function ContestController($routeParams, contestService) {
	var vm = this;

	vm.hashTag = $routeParams.hashTag;
	vm.pictures = [];
	vm.worldId = $routeParams.worldURL;

	// activate();

	function activate() {
		contestService.getPictures(vm.worldId, vm.hashTag)
		.then(function(response) {
			angular.copy(response.data, vm.pictures);
		});
	}
}