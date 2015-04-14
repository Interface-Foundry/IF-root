'use strict';

app.service('announcementsService', announcementsService);

announcementsService.$inject = ['$http'];

function announcementsService($http) {
	
	return {
		get: get
	};

	function get() {
		return $http.get('api/announcements/global', {server: true});
	}
}
