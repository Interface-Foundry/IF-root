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
            var username = $q.defer(),
                password = $q.defer(),
                fbToken = $q.defer();

            lockerManager.keychain.getForKey(function(value) {
                username.resolve(value);
            }, function(error) {
                username.resolve(undefined);
                console.log(error);
            }, 'username', 'Kip');

            lockerManager.keychain.getForKey(function(value) {
                password.resolve(value);
            }, function(error) {
                password.resolve(undefined);
                console.log(error);
            }, 'password', 'Kip');

            lockerManager.keychain.getForKey(function(value) {
                fbToken.resolve(value);
            }, function(error) {
                fbToken.resolve(undefined);
                // console.log(error);
            }, 'fbToken', 'Kip');

            return $q.all({
                username: username.promise,
                password: password.promise,
                fbToken: fbToken.promise
            });

        }

   
         // Removes a value for a key and servicename


        lockerManager.removeCredentials = function(usertype) {
            var username = $q.defer(),
                password = $q.defer(),
                fbToken = $q.defer();
        
            if (usertype == 'facebook') {
                console.log('clearing keychain for facebook.')
                lockerManager.keychain.removeForKey(function(success) {
                    console.log('keychain cleared!', success)
                    fbToken.resolve(success);
                }, function(error) {
                    console.log('faield clearing keychain', error);
                    fbToken.reject(error);
                }, 'fbToken', 'Kip');
                return fbToken;
            } else {
                lockerManager.keychain.removeForKey(function(success) {
                    console.log('keychain cleared!', success)
                    username.resolve(success);
                }, function(error) {
                    console.log('faield clearing keychain', error);
                    username.reject(error);
                }, 'username', 'Kip');
                lockerManager.keychain.removeForKey(function(success) {
                    console.log('keychain cleared!', success)
                    password.resolve(success);
                }, function(error) {
                    console.log('faield clearing keychain', error);
                    password.reject(error);
                }, 'password', 'Kip');
                return username
            }
        }

        //saves username and password. Should be changed to use a map instead of args?

        lockerManager.saveCredentials = function(username, password) {
            var usernameSuccess = $q.defer(),
                passwordSuccess = $q.defer();

            lockerManager.keychain.setForKey(function(success) {
                    usernameSuccess.resolve(success);
                }, function(error) {
                    usernameSuccess.reject(error);
                },
                'username', 'Kip', username);

            lockerManager.keychain.setForKey(function(success) {
                    passwordSuccess.resolve(success);
                }, function(error) {
                    passwordSuccess.reject(error);
                },
                'password', 'Kip', password);

            return $q.all([usernameSuccess, passwordSuccess]);
        }


        //saves the FB token
        lockerManager.saveFBToken = function(fbToken) {
            var deferred = $q.defer();
            lockerManager.keychain.setForKey(function(success) {
                    console.log('SUCCESS SET FBOOK TOKEN');
                    console.log(success);
                    deferred.resolve(success);
                }, function(error) {
                    console.log('ERROR SET FBOOK TOKEN');
                    console.log(error);
                    deferred.reject(error);
                },
                'fbToken', 'Kip', fbToken);

            return deferred;
        }

        //@ENDIF


        return lockerManager;

    }])