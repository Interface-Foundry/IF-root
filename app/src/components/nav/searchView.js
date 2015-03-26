app.directive('searchView', ['$http', '$routeParams', 'geoService', function($http, $routeParams, geoService) {
	return {
		restrict: 'EA',
		scope: true,
		link: function(scope, element, attrs) {

			scope.routeParams = $routeParams;
			scope.loading = false; // for showing loading animation

			scope.search = function(searchText) {
				scope.lastSearch = searchText;
				scope.loading = true;
				scope.searchResult = []; // clear last results

				geoService.getLocation().then(function(coords) {
					scope.searching = $http.get('/api/textsearch', {server: true, params: 
						{textQuery: searchText, userLat: coords.lat, userLng: coords.lng, localTime: new Date()}})
						.success(function(result) {
							if (!result.err) {
								scope.searchResult = result;
							} else {
								scope.searchResult = [];
							}
							scope.loading = false;
						})
						.error(function(err) {
							console.log(err)
							scope.loading = false;
						});
				});		
			}
			
			scope.searchOnEnter = function($event, searchText) {
				if ($event.keyCode === 13) {
					scope.search(searchText);
				}
			}
		},
		templateUrl: 'components/nav/searchView.html' 
	}
}])