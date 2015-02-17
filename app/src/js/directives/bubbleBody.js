app.directive('bubbleBody', function(apertureService) {
	return {
		restrict: 'A',
		scope: true,
		link: function(scope, element, attrs) {
			//basically just handles scroll stuff
			var handleScroll = _.throttle(function() {
				var st = element.scrollTop();
				
				if (st === 0 && apertureService.state != 'aperture-third') {
					apertureService.set('third');
				} else if (apertureService.state != 'aperture-off') {
					apertureService.set('off');
				}
			}, 100);
			
			element.on('scroll', handleScroll);
			
			scope.$on('$destroy', function() {
				element.off('scroll');
			});
		}
	}
});