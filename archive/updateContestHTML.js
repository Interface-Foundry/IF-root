var mongoose = require('mongoose');
global.config = require('./config');
mongoose.connect(global.config.mongodb.url);
var Contests = require('./components/IF_schemas/contest_schema');

var id = "552daf978f4e7e9573b0a552";
var htmlFileName = "contesthtml.html";


var fs = require('fs');

var contestHtml = fs.readFileSync(__dirname + '/' + htmlFileName);

Contests.update({}, {$set: {htmlBody: contestHtml}}).exec(function() {
	console.log('done');
	process.exit(0);
});
