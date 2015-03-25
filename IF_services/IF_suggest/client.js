var request = require('request');
var suggestionServer = '127.0.0.1:8888';

/**
 * Sends a request to the python server to generate a recommendation
 */
var getSuggestion = function(user, search, callback) {
	var formData = {
		userId: user._id ? user._id.toString() : null,
		searchLocation: user.currentLocation, // TODO keep track of user loc in req.user object
		searchRadius: search.radius || 1000, // meters
		searchCategory: search.category || null
	};
	
	request.post({url: suggestionServer, formData: formData}, callback);
};

module.exports = {
	getSuggestion: getSuggestion
};
