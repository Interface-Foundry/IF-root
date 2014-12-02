app.directive('fitFont', function($rootScope) {
	return {
		restrict: 'A',
		scope: true,
		link: function($scope, $element, attrs) {
			console.log('link', $element);
			var fontSize = parseInt($element.css('font-size'));
			var domElement = $element[0];
			var ears = []; //listeners
			
			//FUNCTIONS
			
			function hasOverflow(e) {
				if (e.offsetHeight < e.scrollHeight || e.offsetWidth < e.scrollWidth) {
					return true;
				} else {
					return false;
				}
			}
			
			function shrinkFont() {
				console.log('shrinkFont', hasOverflow(domElement), fontSize);
				while (hasOverflow(domElement) && fontSize > 12) {
					fontSize--;
					$element.css('font-size', fontSize+'px');
				}
			}
			
			function growFont() {
				console.log('growFont', hasOverflow(domElement), fontSize);

				while(!hasOverflow(domElement) && fontSize < 40) {
					fontSize++;
					$element.css('font-size', fontSize+'px');
				}
				shrinkFont();
			}
			
			function updateAfterChange(newWidth, oldWidth) {
				if (newWidth < oldWidth) {
					shrinkFont();
				} else {
					growFont();
				}
			}
			
			//LISTENERS
			
			ears.push(
			$scope.$watch( //watch for resizes
				function() {
					return domElement.clientWidth;
				}, 
				function (newWidth, oldWidth) {
					if (newWidth != oldWidth ) {
						updateAfterChange(newWidth, oldWidth);
					}
			}));
	
			//Watch for changes to contents
			ears.push(
			$scope.$watch(
				function() {
					return domElement.innerText;
				},
				function (newText, oldText) {
					growFont();
				})
			)
	
			$scope.$on("$destroy", function() {
				for (var i = 0, len = ears.length; i < len; i++) {
					ears[i]();
				}
			});
			
		}
	}
});
