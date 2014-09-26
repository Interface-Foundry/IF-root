angular.module('IF-directives', [])
.directive('fitFont', function($rootScope) {
	return {
		restrict: 'A',
		link: function($scope, $element, attrs) {
			var fontSize = parseInt($element.css('font-size'));
			var domElement = $element[0];
			var ears = []; //listeners
			
			function hasOverflow(e) {
				if (e.offsetHeight < e.scrollHeight || e.offsetWidth < e.scrollWidth) {
					return true;
					} else {
					return false;
				}
			}
			
			function resolveOverflow() {
				while (hasOverflow(domElement) && fontSize > 12) {
					fontSize--;
					$element.css('font-size', fontSize+'px');
				} 
			}
			
			ears.push(
			$scope.$watch( //watch for resizes
				function() {
					return domElement.clientWidth;
				}, 
				function (newWidth, oldWidth) {
					if (newWidth != oldWidth ) {
					if (newWidth < oldWidth) {
							resolveOverflow();
						} else {
							do {
								fontSize++;
								$element.css('font-size', fontSize+'px');
							} while(hasOverflow(domElement)==false);
							resolveOverflow();
						}			
					}
			}))
			
			ears.push(
			$scope.$watch('world.name', function(value) {
				resolveOverflow();
			}))
			
		$scope.$on("$destroy", function() {
				for (var i = 0, len = ears.length; i < len; i++) {
					ears[i].pop()();
				}
			});
		}
	}
});
