'use strict';

angular.module('tidepoolsServices')
	.factory('ifGlobals', [
	
function() {
var ifGlobals = {
	kinds: {
		Convention: {name: 'Convention', hasTime: true},
		Event: {name: 'Event', hasTime: true},
		Neighborhood: {name: 'Neighborhood', hasTime: false},
		Venue: {name: 'Venue', hasTime: false},
		Park: {name: 'Park', hasTime: false},
		Retail: {name: 'Retail', hasTime: false},
		Campus: {name: 'Campus', hasTime: false},
		Home: {name: 'Home', hasTime: false}
	}
}

return ifGlobals;
}]);