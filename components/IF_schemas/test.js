var mongoose = require('mongoose');
var Analytics = require('./analytics_schema.js');
var AnonUser = require('./anon_user_schema.js');

mongoose.connect('mongodb://localhost/if');

var userid = '551427e8cbe66207224fea26';
var baduserid = '561427e8cbe66207224fea26';

var db = require('./db');

db.Activity.getActivityForUserId(1234, function(err, acticity) {
	console.log(acticity);
})