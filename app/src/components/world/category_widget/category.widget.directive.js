'use strict';

app.directive('categoryWidgetSr', categoryWidgetSr);

categoryWidgetSr.$inject = ['bubbleSearchService', '$location', 'mapManager'];

function categoryWidgetSr(bubbleSearchService, $location, mapManager) {
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
				bubbleSearchService.search('category', scope.bubbleId, category)
				.then(function(response) {
					updateLandmarks();
				});
				if (index !== undefined) {
					scope.selectedIndex = index;
				}
				$location.path('/w/' + scope.bubbleId + '/search/category/' + category);
			}

			function updateLandmarks() {
				var landmarks = bubbleSearchService.data,
						markers = landmarks.map(mapManager.markerFromLandmark);

				landmarks.forEach(function(m) {
					mapManager.newMarkerOverlay(m);
				});
				
				// mapManager.setCenterFromMarkers(markers);
				mapManager.setMarkers(markers);

				turnOnOverlays(landmarks);
			}

			function turnOnOverlays(landmarks) {
				_.chain(landmarks)
					.map(function(l) {
						return l.loc_info ? l.loc_info.floor_num : 1;
					})
					.uniq()
					.value()
					.forEach(function(l) {
						mapManager.toggleOverlay(String(l).concat('-landmarks'));
					});
			}
		}
	};
}