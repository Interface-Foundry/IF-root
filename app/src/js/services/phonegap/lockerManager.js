'use strict';

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

lockerManager.getCredentials = function() {
	var username = $q.defer(), password = $q.defer();
	
	lockerManager.keychain.getForKey(function(value) {
		username.resolve(value);
	}, function(error) {
		username.reject(error);
	}, 'username', 'Bubbl.li');

	lockerManager.keychain.getForKey(function(value) {
		password.resolve(value);
	}, function(error) {
		password.reject(error)
	}, 'password', 'Bubbl.li');
	
	return $q.all({username: username.promise, password: password.promise});
}

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

//@ENDIF

	 
return lockerManager;
	   
}
])