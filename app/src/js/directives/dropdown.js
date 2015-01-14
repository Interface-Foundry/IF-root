app.directive('dropdown', function() {
	return {
		restrict: 'A',
		scope: true,
		link: function(scope, element, attrs) {
			var wrapper = angular.element(element.children()[1]); // ul containing options (li)
			var offset = element.offset();
			wrapper.offset({top:0, left:0});
			
			element.on('click', function() {
				wrapper.css({'display': 'initial', 'margin-left': 0});
			});
			wrapper.on('click', function(event) {
				event.stopPropagation();
				wrapper.css('display', 'none');
			});
		}
	};
});