'use strict';

app.directive('categoryWidgetSr', categoryWidgetSr);

categoryWidgetSr.$inject = ['bubbleSearchService', '$location', 'mapManager', '$route',
												  	'floorSelectorService'];

function categoryWidgetSr(bubbleSearchService, $location, mapManager, $route,
													floorSelectorService) {
	return {
		restrict: 'E',
		scope: {
			aperture: '=aperture',
			categories: '=categories',
			style: '=style',
			populateSearchView: '=',
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
			scope.mapManager = mapManager;
			scope.selectedIndex = null;

			function updateIndex(index) {
				if (index === scope.selectedIndex) {
					// hide landmarks
					mapManager.groupOverlays('landmarks').forEach(function(o) {
						mapManager.turnOffOverlay(o.name)
					});
					// scope.mapManager.
					floorSelectorService.showLandmarks = false;
					// unselect category
					scope.selectedIndex = null;
					// do not run search
					return false;
				}

				if (index !== null) {
					scope.selectedIndex = index;
				}
				return true;
			}

			scope.search = function(category, index) {

				if (!updateIndex(index)) {
					return;
				}
				// show landmarks
				floorSelectorService.showLandmarks = true;
				if ($location.path().indexOf('search') > 0) {
					scope.populateSearchView(category, 'category');
					$location.path('/w/' + scope.bubbleName + '/search/category/' + encodeURIComponent(category), false);
				} else {
					$location.path('/w/' + scope.bubbleName + '/search/category/' + encodeURIComponent(category), true);
				}
			}

			scope.searchAll = function() {
				if (!updateIndex('all')) {
					return;
				}

				floorSelectorService.showLandmarks = true;

				if ($location.path().indexOf('search') > 0) {
					scope.populateSearchView('All', 'all');
					$location.path('/w/' + scope.bubbleName + '/search/all', false);
				} else {
					$location.path('/w/' + scope.bubbleName + '/search/all', true);
				}
			}
		}
	};
}