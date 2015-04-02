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
	}

}]);