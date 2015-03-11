'use strict';

app.factory('bubbleSearchService', bubbleSearchService);

bubbleSearchService.$inject = ['$http'];

function bubbleSearchService($http) {
	
	var data = [];

	return {
		data: data,
		search: search,
		defaultText: 'What are you looking for?'
	};
	
	function search(searchType, bubbleID, input) {
		var params = {
			worldID: bubbleID,
			catName: input,
			textSearch: input
		};

		return $http.get('/api/bubblesearch/' + searchType, {params:params})
			.then(function(response) {
				angular.copy(response.data, data);
				return data;
			}, function(error) {
				console.log(error);
			});
	}

}