'use strict';

app.directive('categoryWidgetSr', categoryWidgetSr);

categoryWidgetSr.$inject = ['bubbleSearchService'];

function categoryWidgetSr(bubbleSearchService) {
	return {
		restrict: 'E',
		scope: {
			aperture: '=aperture',
			categories: '=categories',
			style: '=style',
			world: '=world'
		},
		templateUrl: function(elem, attrs) {
			if (attrs.aperture === 'full') {
				return 'components/world/category_widget/category.widget.fullaperture.html'
			} else {
				return 'components/world/category_widget/category.widget.noaperture.html'
			}
		},
		controller: 'CategoryWidgetController as catCtrl'
	};
}