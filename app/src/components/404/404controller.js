'use strict';

app.controller('FourOhFourController', FourOhFourController);

FourOhFourController.$inject = ['mapManager', 'apertureService'];

function FourOhFourController(mapManager, apertureService) {
	mapManager.center.zoom = 2;
	mapManager.center.lat = 0;
	apertureService.set('full');
}