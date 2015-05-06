var express = require('express');
var bodyParser = require('body-parser');
var app = express();
// use sync version of exec
var exec = require('child_process').execSync;

app.use(bodyParser.json({extended: true}));

/**
 * Github is configured to post to this route when anyone
 * pushes anything to any branch
 */
app.post('/gitpush', function(req, res) { 
	if (req.body.ref && req.body.ref.indexOf('Bubblli') > -1) {
		console.log(req.body);
		deploy();
	}
	res.sendStatus(200);
});

/**
 * Get the current revision
 */
app.get('/revision', function(req, res) {
	console.log('revision');
	var rev = exec('git log -1');
	res.send(rev);
});


var deploy = function() {
	console.log('Deploying new code to pikachu');
	exec('bash pikachu_deploy.sh');
}

app.listen(9090);
