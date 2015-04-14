var mongoose = require('mongoose');
var Analytics = require('./analytics_schema.js');
var AnonUser = require('./anon_user_schema.js');

mongoose.connect('mongodb://localhost/if');

var userid = '551427e8cbe66207224fea26';
var baduserid = '561427e8cbe66207224fea26';

var a = new Analytics({
	analyticsUserId: userid,
	loc: {type: 'Point', coordinates: [0, 0]}
});

a.save(function(err) {
	if (err) {
		console.log(err);
	} else {
		console.log('success');
	}
});
