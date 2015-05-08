'use strict';

app.factory('aicpRoutingService', aicpRoutingService);

aicpRoutingService.$inject = ['$location'];

function aicpRoutingService($location) {
	return {
		route: route
	}

  // reroutes /w/aicpweek2015 to specific AICP bubble based on the current day
	function route() {
		var today = moment().dayOfYear();
    var path = $location.path();

    switch (today) {
      case 154:
        $location.path(path + '_thursday');
        break;
      case 155:
        $location.path(path + '_wednesday');
        break;
      default:
        $location.path(path + '_tuesday');
    }
	}
}