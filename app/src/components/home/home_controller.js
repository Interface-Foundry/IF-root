app.controller('HomeController', ['$scope', '$rootScope', '$location', 'worldTree', 'styleManager', 'mapManager', 'geoService', 'ifGlobals', 'bubbleSearchService', 'welcomeService', '$timeout', 'navService', 'landmarkIsVisibleFilter', function ($scope, $rootScope, $location, worldTree, styleManager, mapManager, geoService, ifGlobals, bubbleSearchService, welcomeService, $timeout, navService, landmarkIsVisibleFilter) {
var map = mapManager, style = styleManager;

style.resetNavBG();
map.resetMap();

$scope.bubbles = [];
$scope.loadState = 'loading';
$scope.kinds = ifGlobals.kinds;
$scope.searchBarText = bubbleSearchService.defaultText.global;
$scope.welcomeService = welcomeService;
$scope.refresh = refresh;
navService.show('home');

$scope.select = function(bubble) {
	if (!bubble) {
		return;
	}
	$location.path('w/'+bubble.id);
}

$scope.go = function(path) {
	$location.path(path);
}

function refresh() {
	$scope.loadState = false;
	$scope.bubbles.length = 0;
	$timeout(function() {
		$scope.loadState = 'loading';
	}, 350)
	$timeout(function() {
		init();
	}, 700);
}

function initMarkers() {
	var bubbles = $scope.bubbles;
	bubbles.forEach(function(bubble, index, bubbles) {
		if (bubble) {
		map.addMarker(bubble._id, {
			lat:bubble.loc.coordinates[1],
			lng:bubble.loc.coordinates[0],
			draggable: false,
			message: '<a if-href="#w/'+bubble.id+'">'+bubble.name+'</a>',
			enable: 'leafletDirectiveMarker.click',
			icon: {
				iconUrl: 'img/marker/bubbleMarker_30.png',
				shadowUrl: '',
				iconSize: [24, 24],
				iconAnchor: [11, 11],
				popupAnchor: [0, -12]
			},
			_id: bubble._id	
		});
		}
	});
	map.setCenterWithFixedAperture([geoService.location.lng, geoService.location.lat], 18, 0, 240);
}

$scope.refreshButton = function(){
	$scope.loadState = 'loading';
	worldTree.clearCacheWorlds();
	init();
}


//INIT
init();
function init() {
	worldTree.getNearby().then(function(data) { 
		$scope.$evalAsync(function($scope) {
			nearbyBubbles = data['150m'] || []; // nearby
			aroundMeBubbles = data['2.5km'] || []; // around me

			$scope.bubbles = landmarkIsVisibleFilter(nearbyBubbles.concat(aroundMeBubbles));
			
			$scope.loadState = 'success';
			// initMarkers();
		});
	}, function(reason) {
		//failure
		console.log(reason);
		$scope.loadState = 'failure';
	});
}
}]);