app.factory('localStore', ['$http', function($http) {
	// used for localStorage (to track anon users)
	
	return {
		getID: getID,
		setID: setID,
		createID: createID
	}

	function getID() {
		if (typeof Storage !== 'undefined') {
			return localStorage.id || undefined;
		}
		return undefined;
	}

	function setID(id) {
		if (typeof Storage !== 'undefined') {
			localStorage.id = id;
		}
	}

	function createID() {
		var data = {
			userTime: new Date()
		}
		$http.post('/api/anon_user/create', data).
			success(function(data) {
				setID(data[0]);
				// console.log('success: ', data);
			}).
			error(function(data) {
				// console.log('error: ', data);
			});
	}

}]);