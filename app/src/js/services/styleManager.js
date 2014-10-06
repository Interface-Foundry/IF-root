'use strict';

angular.module('tidepoolsServices')

	.factory('styleManager', [
		function() {
var styleManager = {
	navBG_color: 'rgba(92,107,191,0.96)' 
	//---local settings---
	/*bodyBG_color: '#FFF',
	titleBG_color,
	//text settings
	title_color,
	worldTitle_color,
	landmarkTitle_color		*/
}

styleManager.resetNavBG = function() {
	styleManager.navBG_color = 'rgba(0,188,212,0.96)';
}

return styleManager;
		}
	]);