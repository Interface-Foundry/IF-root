'use strict';

app.factory('hideContentService', hideContentService);

hideContentService.$inject = ['mapManager'];

function hideContentService(mapManager) {

	return {
		hide: hide
	}
	
	function hide(cb) {
		// hide elements we don't want to see
		angular.element('.main-nav').css('display', 'none');
		angular.element('.marble-page').css('display', 'none');
		angular.element('.world-title').css('display', 'none');
		angular.element('.marble-contain-width').css('display', 'none');
		
		// add grey splash to page with img
		var splash = angular.element('#splash');
		var img = document.createElement('img');
		img.src = 'http://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Temp_plate.svg/601px-Temp_plate.svg.png';
		splash.addClass('splash-img');
		splash.append(img);
		_.defer(function() {
			img.classList.add('splash-fade-in');
		});

		// zoom map way out
		mapManager.center.zoom = 2;
		mapManager.center.lat = 0;
	}
}