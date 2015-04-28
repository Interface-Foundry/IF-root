'use strict';

app.factory('bubbleSearchService', bubbleSearchService);

bubbleSearchService.$inject = ['$http', 'analyticsService'];

function bubbleSearchService($http, analyticsService) {
	
	var data = [];

	return {
		data: data,
		search: search,
		defaultText: {
			global: 'Search around me',
			bubble: 'Search within ',
			none: 'No results'
		}
	};
	
	function search(searchType, bubbleID, input) {
		var params = {
			worldID: bubbleID,
			catName: input,
			textSearch: input
		};
		
		analyticsService.log('search.' + searchType, params);

		return $http.get('/api/bubblesearch/' + searchType, {server: true, params:params})
			.then(function(response) {
				angular.copy(response.data, data);
				return data;
			}, function(error) {
				console.log(error);
			});
	}

}
