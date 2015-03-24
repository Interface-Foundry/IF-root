angular.module('tidepoolsServices')
    .factory('userManager', ['$rootScope', '$http', '$resource', '$q', '$location', 'dialogs', 'alertManager', 'lockerManager', 'ifGlobals', 'worldTree', 'contest', 
    	function($rootScope, $http, $resource, $q, $location, dialogs, alertManager, lockerManager, ifGlobals, worldTree, contest) {
var alerts = alertManager;
   
   
   //deals with loading, saving, managing user info. 
   
var userManager = {
	//@IFDEF WEB
	userRes: $resource('/api/updateuser'),
	//@ENDIF
	//@IFDEF PHONEGAP
	userRes: $resource('https://bubbl.li/api/updateuser'),
	//@ENDIF
	loginStatus: false,
	login: {},
	signup: {}
}


userManager.getUser = function() { //gets the user object
	var deferred = $q.defer();

	var user = userManager._user; //user cached in memory 
	if (user) {  
		deferred.resolve(user);
	} else {
		$http.get('/api/user/loggedin', {server: true}).
		success(function(user){
			if (user && user!=0) {
				console.log(user);
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

userManager.saveUser = function(user) { //saves user object then updates memory cache
	userManager.userRes.save(user, function() {
		console.log('saveUser() succeeded');
		userManager._user = user;
	});
}

userManager.getDisplayName = function() { //gets a first name to display in the UI from wherever.
	if (userManager._user) {
		var user = userManager._user;	
		if (user.name) {displayName = user.name}
		else if (user.facebook && user.facebook.name) {displayName = user.facebook.name}
		else if (user.twitter && user.twitter.displayName) {displayName = user.twitter.displayName} 
		else if (user.meetup && user.meetup.displayName) {displayName = user.meetup.displayName}
		else if (user.local && user.local.email) {displayName = user.local.email.substring(0, user.local.email.indexOf("@"))}
		else {displayName = "Me"; console.log("how did this happen???");}
			
		var i = displayName.indexOf(" ");
		if (i > -1) {
			var _displayName = displayName.substring(0, i);
		} else {
			var _displayName = displayName;
		}
		
		return _displayName;
	} else {
		return undefined;
	}
}

userManager.checkLogin = function() { //checks if user is logged in with side effects. would be better to redesign.
	console.log('checklogin');
    var deferred = $q.defer();
      
	userManager.getUser().then(function(user) {
	  	console.log('getting user');
		  userManager.loginStatus = true;
		  $rootScope.user = user;
		  if (user._id){
			  $rootScope.userID = user._id;
			  userManager._user = user;
		  }
		  worldTree.getUserWorlds();
		  deferred.resolve(1);
	  }, function(reason) {
		  console.log(reason);
		  userManager.loginStatus = false;
		  deferred.reject(0);
	});
	
	$rootScope.$broadcast('loginSuccess');
		  
    return deferred.promise;
};

userManager.signin = function(username, password) { //given a username and password, sign in 
	console.log('signin');
	var deferred = $q.defer();
	var data = {
		email: username,
		password: password
	}
	
	//@IFDEF WEB
	$http.post('/api/user/login', data, {server: true})
		.success(function(data) {
			userManager.loginStatus = true;
			deferred.resolve(data);
		})
		.error(function(data, status, headers, config) {
			console.error(data, status, headers, config);
			deferred.reject(data); 
		})
	//@ENDIF
	
	//@IFDEF PHONEGAP
	ifGlobals.username = username;
	ifGlobals.password = password;
	$http.post('/api/user/login-basic', data, {server: true})
		.success(function(data) {
			userManager.loginStatus = true;
			ifGlobals.loginStatus = true;
			
			deferred.resolve(data);
		})
		.error(function(data, status, headers, config) {
			console.error(data, status, headers, config);
			deferred.reject(data); 
		})
	//@ENDIF
	
	return deferred.promise;
}

userManager.fbLogin = function() { //login based on facebook approval
	var deferred = $q.defer();
	
	facebookConnectPlugin.login(['public_profile', 'email'], 
		function(success) {
			var fbToken = success.authResponse.accessToken;
			var authHeader = 'Bearer ' + fbToken;
			console.log(success);
			$http.get('/auth/bearer', {server: true, headers: {'Authorization': authHeader}}).then(function(success) {
				lockerManager.saveFBToken(fbToken)
				ifGlobals.fbToken = fbToken;
				deferred.resolve(success);
			}, function(failure) {
				deferred.reject(failure);
			})
		}, 
		function(failure) {
			alerts.addAlert('warning', "Please allow access to Facebook!", true);
			deferred.reject(failure);
		})
	
	return deferred.promise;
}

userManager.logout = function() { 
	$http.get('/api/user/logout', {server: true});
	userManager.loginStatus = false;
	$location.path('/');
	alerts.addAlert('success', "You're signed out!", true);
}

userManager.login.login = function() { //login based on login form
	console.log('login');
    var data = {
      email: userManager.login.email,
      password: userManager.login.password
    }
    userManager.signin(data.email, data.password).then(function(success) {
	    console.log(success);
		userManager.checkLogin();
		alerts.addAlert('success', "You're signed in!", true);
		userManager.login.error = false;
		//@IFDEF WEB
		dialogs.show = false;
		//@ENDIF
		//@IFDEF KEYCHAIN
		dialogs.showDialog('keychainDialog.html');
		//@ENDIF
		contest.login(new Date); // for wtgt contest
	}, function (err) {
		if (err) {
			console.log('failure', err);
		}
		userManager.login.error = true;
	});
}

userManager.signup.signup = function() { //signup based on signup form 
	var data = {
      email: userManager.signup.email,
      password: userManager.signup.password
    }

    $http.post('/api/user/signup', data, {server: true})
    .success(function(user) {
	    dialogs.show = false;
		userManager.checkLogin();
		alertManager.addAlert('success', "You're logged in!", true);
		userManager.signup.error = undefined;	
	})
	.error(function(err) {
	if (err) {
		userManager.signup.error = "Error signing up!";
        alertManager.addAlert('danger',err, true);   
	}
	});
}

userManager.saveToKeychain = function() { 
	lockerManager.saveCredentials(userManager.login.email, userManager.login.password);
}

return userManager;
}]);