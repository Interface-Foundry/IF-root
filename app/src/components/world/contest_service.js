'use strict';

app.service('contestService', contestService);

contestService.$inject = ['$http'];

function contestService($http) {
	
	return {
		getPictures: getPictures
	};

	function getPictures(worldId, hashTag) {
		return $http.get(/* '/api/worldId/contest/hashTag...?' */);
	}

}