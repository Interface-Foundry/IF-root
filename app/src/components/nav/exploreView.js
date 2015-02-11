app.directive('exploreView', ['worldTree', '$rootScope', function(worldTree, $rootScope) {
	return {
		restrict: 'EA',
		scope: true,
		link: function (scope, element, attrs) {
			scope.loadState = 'loading';
			
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