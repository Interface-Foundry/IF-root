app.directive('searchView', ['$http', '$routeParams', 'geoService', 'analyticsService', function($http, $routeParams, geoService, analyticsService) {
	return {
		restrict: 'EA',
		scope: true,
		link: function(scope, element, attrs) {
			scope.routeParams = $routeParams;
			scope.search = function(searchText) {
				scope.lastSearch = searchText;
				geoService.getLocation().then(function(coords) {
					searchParams = {textQuery: searchText, userLat: coords.lat, userLng: coords.lng, localTime: new Date()}
				analyticsService.log("search.text", searchParams);
				
				scope.searching = $http.get('/api/textsearch', {server: true, params: searchParams})
					.success(function(result) {
						if (!result.err) {
							scope.searchResult = result;
						} else {
							scope.searchResult = [];
						}
					})
					.error(function(err) {console.log(err)});
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
