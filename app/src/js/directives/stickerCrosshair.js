app.directive('stickerCrosshair', ['$window', function($window) {
	return {
		restrict: 'A',
		scope: true,
		link: function(scope, element, attrs) {
			function positionCrosshair() {
				var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
				w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0), 
				wOffset = 0,//50,
				hOffset = 0,//100,
				left = w/2 - wOffset,
				top = (h-220-40)/2+40 - hOffset;
				
				element[0].style.left = left + 'px';
				element[0].style.top = top + 'px';
			}
			
			$(window).on('resize', positionCrosshair);
			positionCrosshair();
			
		 
		}
	}
}]);