angular.module('tidepoolsServices')
    .factory('userManager', ['$rootScope', '$http', '$resource', '$q', 
    	function($rootScope, $http, $resource, $q) {
    	
var userManager = {
	userRes: $resource('/api/updateuser', {})
}

userManager.getUser = function() {
	var deferred = $q.defer();
	
	var user = userManager._user;
	if (user) {
		deferred.resolve(user);
	} else {
		$http.get('/api/user/loggedin').success(function(user){
			userManager._user = user;
			deferred.resolve(user);
		});
	}
	return deferred.promise;
}

userManager.saveUser = function(user) {
	userManager.userRes.save(user, function() {
		console.log('saveUser() succeeded');
	});
}


return userManager;
}]);