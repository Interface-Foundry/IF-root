'use strict';

angular.module('tidepoolsServices')
	.factory('ifGlobals', [
	
function() {
var ifGlobals = {
	kinds: {
		Convention: {name: 'Convention', hasTime: true, img: 'convention.png', icon: 'convention.svg'},
		Event: {name: 'Event', hasTime: true, img: 'event.png', icon: 'event.svg'},
		Neighborhood: {name: 'Neighborhood', hasTime: false, img: 'neighborhood.png', icon: 'neighborhood.svg'},
		Venue: {name: 'Venue', hasTime: false, img: 'venue.png', icon: 'venue.svg'},
		Park: {name: 'Park', hasTime: false, img: 'park.png', icon: 'park.svg'},
		Retail: {name: 'Retail', hasTime: false, img: 'retail.png', icon: 'retail.svg'},
		Campus: {name: 'Campus', hasTime: false, img: 'campus.png', icon: 'campus.svg'},
		Home: {name: 'Home', hasTime: false, img: 'home.png', icon: 'home.svg'},
		Other: {name: 'Other', hasTime: false, img: 'other.png'}
	}
}

return ifGlobals;
}]);