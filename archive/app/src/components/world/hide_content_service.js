'use strict';

app.factory('hideContentService', hideContentService);

hideContentService.$inject = ['mapManager'];

function hideContentService(mapManager) {

	return {
		hide: hide
	}
	
	function hide(cb) {
		// hide elements we don't want to see
		// angular.element('.main-nav').css('display', 'none');
		angular.element('.marble-page').css('display', 'none');
		angular.element('.world-title').css('display', 'none');
		angular.element('.marble-contain-width').css('display', 'none');
		
		// add grey splash to page with img
		var splash = angular.element('#splash');
		var imgs = angular.element('#splash img');
		_.defer(function() {
			imgs[0].classList.add('splash-fade-in');
			imgs[1].classList.add('splash-fade-in');
			cb();
		});

		// zoom map way out
		mapManager.center.zoom = 2;
		mapManager.center.lat = 0;
	}
}