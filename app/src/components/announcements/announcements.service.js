'use strict';

app.service('announcementsService', announcementsService);

announcementsService.$inject = ['$http'];

function announcementsService($http) {
	
	return {
		get: get
	};

	function get() {
		$http.get('api/announcements/global');
	}
}
