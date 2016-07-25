'use strict';

app.controller('FourOhFourController', FourOhFourController);

FourOhFourController.$inject = ['$scope', 'mapManager', 'apertureService', 'navService'];

function FourOhFourController($scope, mapManager, apertureService, navService) {
	mapManager.center.zoom = 2;
	mapManager.center.lat = 0;
	apertureService.set('full');

	navService.backPages = -2;

	$scope.$on('$destroy', function() {
		navService.backPages = -1;
	});
}