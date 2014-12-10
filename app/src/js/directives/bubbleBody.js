app.directive('bubbleBody', function(apertureService) {
	return {
		restrict: 'A',
		scope: true,
		link: function(scope, element, attrs) {
			var st;
			//@IFDEF WEB
			element.on('mousewheel', function(event) {
				st = element.scrollTop()
				if (st == 0 && event.deltaY*event.deltaFactor > 30) {
					apertureService.set('third');
				}
				if (st == 0 && event.deltaY < 0) {
					apertureService.set('off');
				}
			});
			//@ENDIF
			
			scope.$on('$destroy', function() {
				element.off('mousewheel');
			});
		}
	}
});