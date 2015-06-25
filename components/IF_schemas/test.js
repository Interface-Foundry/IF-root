var mongoose = require('mongoose');
var Analytics = require('./analytics_schema.js');
var AnonUser = require('./anon_user_schema.js');

mongoose.connect('mongodb://localhost/if');

var userid = '551427e8cbe66207224fea26';
var baduserid = '561427e8cbe66207224fea26';

var db = require('./db');

db.Landmarks.findOne({}, function(e, l) {
	l.update({$push: {'tags': 'clothing'}}, function(e) {
		db.Landmarks.findOne({_id: l._id}, function(e, l2) {
			console.log(l2.tags);
			debugger;
		})
	});
});