'use strict';

app.controller('ContestController', ContestController);

ContestController.$inject = ['$routeParams', 'contestService'];

function ContestController($routeParams, contestService) {
	var vm = this;

	vm.dummyData = dummyData;
	vm.hashTag = $routeParams.hashTag;
	vm.loadPictures = loadPictures;
	vm.pictures = [];
	vm.worldId = $routeParams.worldURL;

	// activate();
	dummyData()
	function activate() {
		contestService.getPictures(0, vm.worldId, vm.hashTag)
		.then(function(response) {
			angular.copy(response.data, vm.pictures);
		});
	}

	function loadPictures() {
		contestService.getPictures(vm.pictures.length, vm.worldId, vm.hashTag)
		.then(function(response) {
			vm.pictures = vm.pictures.concat(response.data);
		});
	}

	function dummyData() {
		console.log("FILLING DUMMY DATA")
		for (var i = 0; i < 20; i++) {
			vm.pictures.push('data' + i);
		}
	}
}