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
	},
	stickers: {
		Favorite: {name: 'Favorite', img: 'img/stickers/favorite.png', iconInfo: {
			iconUrl: 'img/stickers/favorite.png', iconSize: [100,100], iconAnchor: [50, 100], popupAnchor: [0, -80]}},
		FixThis: {name: 'Fix This', img: 'img/stickers/fixthis.png', iconInfo: {
			iconUrl: 'img/stickers/fixthis.png', iconSize: [100,100], iconAnchor: [50, 100], popupAnchor: [0, -80]}},
		Food: {name: 'Food', img: 'img/stickers/food.png', iconInfo: {
			iconUrl: 'img/stickers/food.png', iconSize: [100,100], iconAnchor: [50, 100], popupAnchor: [0, -80]}},
		ImHere: {name: "I'm Here", img: 'img/stickers/im_here.png', iconInfo: {
			iconUrl: 'img/stickers/im_here.png', iconSize: [100,100], iconAnchor: [50, 100], popupAnchor: [0, -80]}},
		Interesting: {name: 'Interesting', img: 'img/stickers/interesting.png', iconInfo: {
			iconUrl: 'img/stickers/interesting.png', iconSize: [100,100], iconAnchor: [50, 100], popupAnchor: [0, -80]}},
		WereHere: {name: "We're Here", img: 'img/stickers/were_here.png', iconInfo: {
			iconUrl: 'img/stickers/were_here.png', iconSize: [100,100], iconAnchor: [50, 100], popupAnchor: [0, -80]}}
	}
}

ifGlobals.getBasicHeader = function() {
	var string = ifGlobals.username+":"+ifGlobals.password;
	var encodedString = window.btoa(string);
	return "Basic "+encodedString;
}

return ifGlobals;
}]);