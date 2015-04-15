app.factory('localStore', ['$http', '$q', function($http, $q) {
	
	var hasLocalStorage = (typeof localStorage !== 'undefined');

	// aaaand another check just to make absolutely sure they have local storage
	if (hasLocalStorage) {
		try {
			localStorage.author = "interfacefoundry.com ♥ ♥ ♥";
		} catch (e) {
			hasLocalStorage = false;
		}
	}
	
	var id; // id for when the user doesn't have localStorage

	/**
	 * Returns a promise that is resolved with an anonymous id
	 */
	function getID() {
		// get the ID if it's in localStorage
		if (typeof Storage !== 'undefined') {
			if ((new RegExp("^[0-9a-fA-F]{24}$")).test(localStorage.id)) {
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
		return $http.post('/api/anon_user/create', data, {server: true})
			.then(function(res) {
				return res.data[0];
			});
	}
	
	
	/**
	 * Location Buffer
	 */
	 var _locationBuffer = [];
	 var locationBuffer = {
		 push: function(data) {
			_locationBuffer.push(data);
			
			if (typeof localStorage !== 'undefined') {
				localStorage.setItem("locationBuffer", JSON.stringify(_locationBuffer));
			}
		 },
		 getLength: function() {
			var l;
			 if (hasLocalStorage) {
				 try {
					 l = JSON.parse(localStorage.locationBuffer).length;
				 } catch (e) {
					 localStorage.locationBuffer = "[]";
					 l = 0;
				 }
				 return l;
			 } else {
				 return _locationBuffer.length;
			 }
		 },
		 flush: function() {
			// use localstorage if they have it
			if (typeof localStorage !== 'undefined') {
				try {
					_locationBuffer = JSON.parse(localStorage.getItem("locationBuffer"));
				}
				catch (e) {
					// welp... start over.
					localStorage.setItem("locationBuffer", "[]");
					locationBuffer = [];
					return [];
				}
			}
			var lb = angular.copy(_locationBuffer);
			_locationBuffer = [];
			return lb;
		 }
	 };
	
	var localStore = {
		getID: getID,
		locationBuffer: locationBuffer
	};
	
	return localStore;
}]);
