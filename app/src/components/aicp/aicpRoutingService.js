'use strict';

app.factory('aicpRoutingService', aicpRoutingService);

aicpRoutingService.$inject = ['$location', '$routeParams'];

function aicpRoutingService($location, $routeParams) {
	return {
		route: route
	}

  // reroutes /w/aicpweek2015 to specific AICP bubble based on the current day
	function route() {
		var today = moment().dayOfYear();
    var path = $location.path();

    if (today < 138) {
      $location.path(path + '');
      return {worldURL: 'aicpweek2015'};
    } else if (today === 156) {
      $location.path(path + '_thursday');
    } else if (today === 155) {
      $location.path(path + '_wednesday');
    } else {
      $location.path(path + '_tuesday');
    }
  }
}

app.constant('rerouteData', {worldURL: ''})