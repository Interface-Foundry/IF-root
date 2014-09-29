'use strict';

angular.module('tidepoolsServices')
	.factory('ifGlobals', [
	
function() {
var ifGlobals = {
	kinds: {
		Convention: {name: 'Convention', hasTime: true, img: 'convention.png'},
		Event: {name: 'Event', hasTime: true, img: 'event.png'},
		Neighborhood: {name: 'Neighborhood', hasTime: false, img: 'neighborhood.png'},
		Venue: {name: 'Venue', hasTime: false, img: 'venue.png'},
		Park: {name: 'Park', hasTime: false, img: 'park.png'},
		Retail: {name: 'Retail', hasTime: false, img: 'retail.png'},
		Campus: {name: 'Campus', hasTime: false, img: 'campus.png'},
		Home: {name: 'Home', hasTime: false, img: 'home.png'},
		Other: {name: 'Other', hasTime: false, img: 'other.png'}
	}
}

return ifGlobals;
}]);