'use strict';

app.directive('categoryWidgetSr', categoryWidgetSr);

categoryWidgetSr.$inject = ['bubbleSearchService', '$location'];

function categoryWidgetSr(bubbleSearchService, $location) {
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
			scope.groupedCategories = _.groupBy(scope.categories, 'name');
			scope.selectedIndex;

			scope.search = function(category, index) {
				bubbleSearchService.search('category', scope.bubbleId, category);
				if (index !== undefined) {
					scope.selectedIndex = index;
				}
				// $location.path('/w/' + scope.bubbleId + '/results/category?catName=' + category);
			}

		}
	};
}