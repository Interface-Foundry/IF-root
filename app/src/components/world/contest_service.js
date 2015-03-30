'use strict';

app.service('contestService', contestService);

contestService.$inject = ['$http'];

function contestService($http) {
	
	return {
		getPictures: getPictures
	};

	function getPictures(start, worldId, hashTag) {
		return $http.get(/* '/api/worldId/contest/start/hashTag...?' */);
	}

}