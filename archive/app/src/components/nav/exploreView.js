// DEPRACATED
app.directive('exploreView', ['worldTree', '$rootScope', 'ifGlobals', function(worldTree, $rootScope, ifGlobals) {
	return {
		restrict: 'EA',
		scope: true,
		link: function (scope, element, attrs) {
			scope.loadState = 'loading';
			scope.kinds = ifGlobals.kinds;

			// ng-if in index.html will recompile link function everytime the explore-view DOM element is loaded
			worldTree.getNearby().then(function(data) {
				scope.homeBubbles = data['150m'] || [];
				scope.nearbyBubbles = data['2.5km'] || [];			
				scope.loadState = 'success';
			}, function(reason) {
				scope.loadState = 'failure'; 
			});
	
		},
		templateUrl: 'components/nav/exploreView.html' 
	}
}])