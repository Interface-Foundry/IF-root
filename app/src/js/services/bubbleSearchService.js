app.factory('bubbleSearchService', bubbleSearchService);

bubbleSearchService.$inject = ['$http'];

function bubbleSearchService($http) {
	
	var data = [];

	return {
		data: data,
		search: search
	};
	
	function search(bubbleId, input) {
		return $http.get('/api/bubbles/' + bubbleId + '/bubblesearch', {
			params: {
				search: input
			}
		}).then(function(response) {
			angular.copy(response.data, data);
		});
	}

}