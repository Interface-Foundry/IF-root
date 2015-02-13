'use strict';

//Phonegap only!
//Uses the keychain plugin to store credentials on iOS. 
//Implementation should eventually be platform agnostic

angular.module('tidepoolsServices')
    .factory('lockerManager', ['$q', function($q) {
//@IFDEF WEB
var lockerManager = {
	supported: false
}
//@ENDIF

//@IFDEF KEYCHAIN
var lockerManager = {
	supported: true,
	keychain: new Keychain()
}

//getCredentials returns a promise->map of the available credentials. 
//	Consider reimplementing this to propogate errors properly; currently it doesn't reject promises
//	because all will return rejected if you do.

lockerManager.getCredentials = function() {
	var username = $q.defer(), password = $q.defer(), fbToken = $q.defer();
	
	lockerManager.keychain.getForKey(function(value) {
		username.resolve(value);
	}, function(error) {
		username.resolve(undefined);
		console.log(error);
	}, 'username', 'Bubbl.li');

	lockerManager.keychain.getForKey(function(value) {
		password.resolve(value);
	}, function(error) {
		password.resolve(undefined);
		console.log(error);
	}, 'password', 'Bubbl.li');
	
	lockerManager.keychain.getForKey(function(value) {
		fbToken.resolve(value);
	}, function(error) {
		fbToken.resolve(undefined);
		console.log(error);
	}, 'fbToken', 'Bubbl.li');
	
	return $q.all({username: username.promise, password: password.promise, fbToken: fbToken.promise});
}

//saves username and password. Should be changed to use a map instead of args?

lockerManager.saveCredentials = function(username, password) {
	var usernameSuccess = $q.defer(), passwordSuccess = $q.defer();
	
	lockerManager.keychain.setForKey(function(success) {
		usernameSuccess.resolve(success);
	}, function(error) {
		usernameSuccess.reject(error);
	},
	'username', 'Bubbl.li', username);
	
	lockerManager.keychain.setForKey(function(success) {
		passwordSuccess.resolve(success);
	}, function(error) {
		passwordSuccess.reject(error);
	},
	'password', 'Bubbl.li', password);
	
	return $q.all([usernameSuccess, passwordSuccess]);
}


//saves the FB token
lockerManager.saveFBToken = function(fbToken) {
	var deferred = $q.defer();
	lockerManager.keychain.setForKey(function(success) {
		deferred.resolve(success);
	}, function(error) {
		deferred.reject(error);
	},
	'fbToken', 'Bubbl.li', fbToken);
	
	return deferred;
}

//@ENDIF

	 
return lockerManager;
	   
}
])