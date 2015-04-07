'use strict';

app.factory('superuserService', superuserService);

superuserService.$inject = ['$location'];

function superuserService($location) {
	
	var currentRoute = '',
			routes = ['Announcements', 'Contests', 'Entries'];

	return {
		changeRoute: changeRoute,
		getCurrentRoute: getCurrentRoute,
		routes: routes
	};

	function changeRoute(newRoute, region) {
		currentRoute = newRoute;
		$location.path('/su/' + newRoute.toLowerCase() + '/' + region.toLowerCase());
	}

	function getCurrentRoute() {
		currentRoute = currentRoute.length ? currentRoute :
								findRoute();
		return currentRoute;
	}

	function findRoute() {
		var path = $location.path();
		var len = path.slice(4).indexOf('/');
		return path.slice(4)[0].toUpperCase() + path.slice(5, len + 4);
	}

}