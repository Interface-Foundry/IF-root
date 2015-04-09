'use strict';

app.controller('FourOhFourController', FourOhFourController);

FourOhFourController.$inject = ['mapManager', 'apertureService'];

function FourOhFourController(mapManager, apertureService) {
	mapManager.center.zoom = 2;
	apertureService.set('full')
}