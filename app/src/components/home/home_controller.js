app.controller('HomeController', ['$scope', '$rootScope', '$location', 'worldTree', 'styleManager', 'mapManager', 'geoService', 'ifGlobals', function ($scope, $rootScope, $location, worldTree, styleManager, mapManager, geoService, ifGlobals) {
var map = mapManager, style = styleManager;

style.resetNavBG();
map.resetMap();

$scope.loadState = 'loading';
$scope.kinds = ifGlobals.kinds;

$scope.select = function(bubble) {
	if ($scope.selected == bubble) {
		$location.path('w/'+bubble.id);
	} else {
	$scope.selected = bubble;
	$scope.map.on = true;
	map.setMarkerFocus(bubble._id);
	map.setCenterWithFixedAperture(bubble.loc.coordinates, 18, 0, 240);
	}
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
				iconUrl: 'img/marker/bubble-marker-50.png',
				shadowUrl: '',
				iconSize: [35, 67],
				iconAnchor: [17, 67],
				popupAnchor: [0, -30]
			},
			_id: bubble._id	
		});
		}
	});
	map.setCenterWithFixedAperture([geoService.location.lng, geoService.location.lat], 18, 0, 240);
}

//LISTENERS//

$scope.$watch('map.on', function(newVal, oldVal) {
	switch (newVal) {
		case true:
			style.navBG_color = 'rgba(245, 67, 54, 0.96)';
		break;
		case false:
			style.resetNavBG();
		break;
	}
})

$rootScope.$on('leafletDirectiveMarker.click', function(event, args) {
	var bubble = $scope.bubbles.find(function(element, index, array) {
		if (element._id==args.markerName) {
			return true;
		} else { 
			return false;
		}
	});
	$scope.select(bubble);
});

//INIT

worldTree.getNearby().then(function(data) {
	$scope.$evalAsync(function($scope) {
		$scope.homeBubbles = data['150m'] || [];
		$scope.nearbyBubbles = data['2.5km'] || [];
		
		if ($scope.nearbyBubbles.length>0 && $scope.homeBubbles.length>0) {
			$scope.bubbles = $scope.homeBubbles.concat($scope.nearbyBubbles);
		} else if ($scope.nearbyBubbles.length>0) {
			$scope.bubbles = $scope.nearbyBubbles;
		} else if ($scope.homeBubbles.length>0) {
			$scope.bubbles = $scope.homeBubbles;
		} else {
			$scope.bubbles = [];
		}
		
		$scope.loadState = 'success';
		initMarkers();
	});
}, function(reason) {
	//failure
	console.log(reason);
	$scope.loadState = 'failure';
});

}]);