app.directive('compassButton', function(worldTree) {
	return {
		restrict: 'EA',
		scope: true,
		link: function(scope, element, attrs) {
			
			scope.compassOn = function($event, val) {
				console.log('compassOn');
				if (val!=undefined) {scope.compassState = val}
				
				if ($event) {
					console.log('compassOn:event');

					$event.stopPropagation();
					$('html').on('click', function(e) {
						console.log('compassOn:html click');

						scope.compassState = false;
						scope.$digest();
						$('html').off('click');
					})
				}
			}
			
			console.log('linking compass button');
			worldTree.getNearby().then(function(data) {
				console.log('compassButton', data);
				scope.nearbyBubbles = data['150m'];
			}, function(reason) {console.log(reason)});
		}
	}
});