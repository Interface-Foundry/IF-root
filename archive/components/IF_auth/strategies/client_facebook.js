'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
	CustomStrategy = require('./../custom_strategy/custom_strategy').Strategy,
	User = require('mongoose').model('User'),
	users = require('../../app/controllers/users.server.controller');

module.exports = function() {
	console.log('here we are');
	// Use local strategy
	passport.use(new CustomStrategy({
			userId: 'userId',
			accessToken: 'accessToken'
		},
		function(userId, accessToken, response, done) {
			console.log('in the authentication function');
			if (response.error){
				return done(null, false, {
					message: response.error.message
				});
			}


			console.log(userId);

			try {
				var userObject = JSON.parse(response);
			} catch (e) {
				console.error('could not parse facebook json in client strategy');
				console.error(response);
			}
			console.log(userObject.id);

			if (userId !== userObject.id){
				return done(null, false, {
					message: 'Incorrect Access Token'
				});
			}

			var providerData = {};
			providerData.json = userObject;
			providerData.accessToken = accessToken;

			var providerUserProfile = {
				firstName: userObject.first_name,
				lastName: userObject.last_name,
				displayName: userObject.name,
				email: userObject.email || '',
				username: userObject.username,
				provider: 'facebook_client',
				providerIdentifierField: 'id',
				providerData: providerData
			};

			console.log(providerUserProfile);

			users.saveFacebookUserProfile(providerUserProfile, done);
		}
	));
};
