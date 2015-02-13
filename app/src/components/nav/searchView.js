app.directive('searchView', ['$http', function($http) {
	return {
		restrict: 'EA',
		scope: true,
		link: function(scope, element, attrs) {
			scope.search = function(searchText) {
				scope.lastSearch = searchText;
				scope.searching = $http.get('/api/textsearch', {server: true, params: {textQuery: searchText}})
					.success(function(result) {
						if (!result.err) {
							scope.searchResult = result;
						} else {
							scope.searchResult = [];
						}
					})
					.error(function(err) {console.log(err)});
					
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