app.directive('exploreView', ['worldTree', '$rootScope', 'ifGlobals', function(worldTree, $rootScope, ifGlobals) {
	return {
		restrict: 'EA',
		scope: true,
		link: function (scope, element, attrs) {
			scope.loadState = 'loading';
			scope.kinds = ifGlobals.kinds;

			
			$rootScope.$on('viewTabSwitch', function(event, tab) {
				if (tab === 'explore') {
					scope.loadState = 'loading';
					worldTree.getNearby().then(function(data) {
						scope.homeBubbles = data['150m'] || [];
						scope.nearbyBubbles = data['2.5km'] || [];			
						scope.loadState = 'success';
					}, function(reason) {
						scope.loadState = 'failure'; 
					});
				}
			});
	
		},
		templateUrl: 'components/nav/exploreView.html' 
	}
}])