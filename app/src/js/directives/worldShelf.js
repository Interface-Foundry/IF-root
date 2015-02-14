app.directive('worldShelf', ['$document', 'apertureService', function($document, apertureService) {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
/*
			$document.on('keydown', function(e) {
				if (e.keyCode===8 && apertureService.state==='aperture-full') {
					e.stopPropagation();
					e.preventDefault();
					scope.$apply(function() {
						apertureService.toggle('full');
					});
				}	
			})	
*/
		}
	}
}]);