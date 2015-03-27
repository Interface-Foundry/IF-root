app.factory('localStore', ['$http', '$q', function($http, $q) {

	var localStore = {
		getID: getID
	};
	
	var id; // id for when the user doesn't have localStorage

	/**
	 * Returns a promise that is resolved with an anonymous id
	 */
	function getID() {
		// get the ID if it's in localStorage
		if (typeof Storage !== 'undefined') {
			if ((new RegExp("/^[0-9a-fA-F]{24}$")).test(localStorage.id)) {
				var defer = $q.defer();
				defer.resolve(localStorage.id);
				return defer.promise;
			} else {
				return createID().then(function(new_id) {
					localStorage.id = new_id;
					return new_id;
				});
			}
		} else {
			// no localStorage :(
			if ((new RegExp("/^[0-9a-fA-F]{24}$")).test(id)) {
				var defer = $q.defer();
				defer.resolve(id);
				return defer.promise;
			} else {
				return createID().then(function(new_id) {
					id = new_id;
					return id;
				});
			}
		}
	}

	/**
	 * Returns a promise that is resolved with a new id
	 */
	function createID() {
		var data = {
			userTime: new Date()
		}
		return $http.post('/api/anon_user/create', data)
			.then(function(res) {
				return res.data[0];
			});
	}
	
	return localStore;
}]);
