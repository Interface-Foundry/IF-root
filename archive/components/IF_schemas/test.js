var userid = '551427e8cbe66207224fea26';
var baduserid = '561427e8cbe66207224fea26';

var db = require('./db');

db.Landmarks.findOne({world: false}, function(err, l) {
	console.log(l);
})