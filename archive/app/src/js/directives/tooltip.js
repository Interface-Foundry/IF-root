angular.module('IF-directives', [])
.directive('ifTooltip', function($rootScope) {
	return {
		restrict: 'A',
		link: function($scope, $element, attrs) {
			console.log('linking if tooltip');
				
                new Drop({
                    target: $element[0],
                    content: 'testing 123',
                    position: 'bottom right',
                    openOn: 'click'
                });
            }	
		}
});
