angular.module('tidepoolsServices')
    .factory('userManager', ['$rootScope', '$http', '$resource', '$q', '$location',
    	function($rootScope, $http, $resource, $q, $location) {
    	
var userManager = {
	userRes: $resource('/api/updateuser', {}),
	loginStatus: false,
	login: {}
}


userManager.getUser = function() {
	var deferred = $q.defer();
	console.log('user', userManager._user);
	var user = userManager._user;
	if (user) {
		deferred.resolve(user);
	} else {
		$http.get('http://localhost:2997/api/user/loggedin').
		success(function(user){
			if (user!=='0') {
				$rootScope.user = user; 
				userManager._user = user;
				deferred.resolve(user);
			} else {
				deferred.reject(0);
			}
		}).
		error(function(data, status, header, config) {
			//failure
			deferred.reject(data);
		});
	}
	return deferred.promise;
}

userManager.saveUser = function(user) {
	userManager.userRes.save(user, function() {
		console.log('saveUser() succeeded');
	});
}

userManager.getDisplayName = function() {
	var deferred = $q.defer();
	
	var displayName = userManager._displayName;
	if (displayName) {
		deferred.resolve(displayName);
	} else {
		userManager.getUser().then(function(user) {
			if (user.name) {displayName = user.name}
			else if (user.facebook && user.facebook.name) {displayName = user.facebook.name}
			else if (user.twitter && user.twitter.displayName) {displayName = user.twitter.displayName} 
			else if (user.meetup && user.meetup.displayName) {displayName = user.meetup.displayName}
			else if (user.local && user.local.email) {displayName = user.local.email.substring(0, user.local.email.indexOf("@"))}
			else { displayName = "Me"; console.log("how did this happen???");}
			
			displayName = displayName.substring(0, displayName.indexOf(" "));
			
			userManager._displayName = displayName;
			deferred.resolve(displayName);
		}, function(reason) {
			deferred.reject(reason);
		});
	}
	
	return deferred.promise;
}

userManager.checkLogin = function(){
      var deferred = $q.defer();
	  userManager.getUser().then(function(user) {
	  	console.log('getting user');
		  userManager.loginStatus = true;
		  $rootScope.user = user;
		  if (user._id){
			  $rootScope.userID = user._id;
			  userManager._user = user;
		  }
		  deferred.resolve(0);
		  //$rootScope.$digest();
	  }, function(reason) {
		  console.log(reason);
		  userManager.loginStatus = false;
		  deferred.reject(0);
		  //$rootScope.$digest();
	  });
	  
	  userManager.getDisplayName().then(function(displayName) {
		  $rootScope.user.displayName = displayName;
	  });
	  
      return deferred.promise;
};

userManager.logout = function() {
	$http.get('http://localhost:2997/api/user/logout');
	userManager.loginStatus = false;
	$location.path('/');
}

userManager.login.login = function() {
	console.log('login');
    var data = {
      email: userManager.login.email,
      password: userManager.login.password
    }
    
	$http.post('http://localhost:2997/api/user/login', data).
	success(function(user){
		if (user) {
			userManager.checkLogin();
		}
	}).
	error(function(err){
		if (err){
			$scope.alerts.addAlert('danger',err);
		}
	});
}

userManager.signup = function() {
	
}


return userManager;
}]);