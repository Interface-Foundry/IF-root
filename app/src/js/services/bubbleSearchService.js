app.factory('bubbleSearchService', bubbleSearchService);

bubbleSearchService.$inject = ['$http'];

function bubbleSearchService($http) {
	
	var data = [];

	return {
		data: data,
		search: search
	};
	
	function search(searchType, bubbleID, input) {
		var params = {
			worldID: bubbleID,
			category: input
		};

		return $http.get('/api/bubblesearch/' + searchType, params)
			.then(function(response) {
				angular.copy(response.data, data);
			});
	}

}