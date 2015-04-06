app.directive('clickToEdit', [function() {
	// attach to input element. selects input text on click

	return {
		restrict: 'A',
		scope: true,
		link: link
	};

	function link(scope, elem, attrs) {

		elem.on('click', function() {
			elem.select();
			elem.focus();
		});

		// [optional] reset input value to initial value when empty
		if (attrs.initialVal) {
			var initialVal = attrs.initialVal;
			elem.on('blur', function() {
				if (angular.element(elem).val() === '') {
					angular.element(elem).val(initialVal);
				}
			});
		}
	}

}]);