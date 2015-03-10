'use strict';

app.directive('categoryWidgetSr', categoryWidgetSr);

categoryWidgetSr.$inject = ['bubbleSearchService', '$location', 'mapManager', 'apertureService', '$route'];

function categoryWidgetSr(bubbleSearchService, $location, mapManager, apertureService, $route) {
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
				return 'components/world/category_widget/category.widget.fullaperture.html';
			} else {
				return 'components/world/category_widget/category.widget.noaperture.html';
			}
		},
		link: function(scope, elem, attrs) {
			scope.bubbleId = scope.world._id;
			scope.bubbleName = scope.world.id;
			scope.groupedCategories = _.groupBy(scope.categories, 'name');
			scope.selectedIndex;

			scope.search = function(category, index) {
				if (index !== undefined) {
					scope.selectedIndex = index;
				}
				$location.path('/w/' + scope.bubbleName + '/search/category/' + category, false);
			}
		}
	};
}