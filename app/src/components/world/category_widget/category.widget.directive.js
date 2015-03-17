'use strict';

app.directive('categoryWidgetSr', categoryWidgetSr);

categoryWidgetSr.$inject = ['bubbleSearchService', '$location', 'mapManager', '$route',
												  	'floorSelectorService', 'categoryWidgetService'];

function categoryWidgetSr(bubbleSearchService, $location, mapManager, $route,
													floorSelectorService, categoryWidgetService) {
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
			scope.categoryWidgetService = categoryWidgetService;

			function updateIndex(index) {
				if (index === categoryWidgetService.selectedIndex) {
					// hide landmarks
					mapManager.groupOverlays('landmarks').forEach(function(o) {
						mapManager.turnOffOverlay(o.name)
					});

					floorSelectorService.showLandmarks = false;
					floorSelectorService.showFloors = false;
					// unselect category
					categoryWidgetService.selectedIndex = null;
					// do not run search
					return false;
				}

				if (index !== null) {
					categoryWidgetService.selectedIndex = index;
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

			scope.getStyle = function(index) {
				if (index === categoryWidgetService.selectedIndex) {
					if (index === 'all') {
						return {
							'border-top': '4px solid ' + scope.style.titleBG_color,
							'margin-top': '-3px'
						};
					} else {
						return {
							'border-top': '4px solid ' + scope.style.titleBG_color,
							'margin-top': '1px'
						};
					}
				}
			}
		}
	};
}