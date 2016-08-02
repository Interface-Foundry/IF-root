var express = require('express');
var bodyParser = require('body-parser');
var app = express();
// use sync version of exec
// TODO upgrade to node.js 0.12.0 in order for this to work
var exec = require('child_process').execSync;

app.use(bodyParser.json({extended: true}));

/**
 * Github is configured to post to this route when anyone
 * pushes anything to any branch
 */
app.post('/gitpush', function(req, res) {
	res.send(200);
	if (req.body.ref && req.body.ref.indexOf('Kip') > -1) {
		console.log(req.body);
		deploy();
    	test();
	}
});

/**
 * Deploys new code to pikachu after a commit to the githubs
 */
var deploy = function() {
	console.log('Deploying new code to pikachu');
	exec('bash pikachu_deploy.sh');
};

/**
 * Runs all the tests we have set up
 */
var test = function() {
  console.log('running tests');
  exec('npm test');
};

app.listen(9090);
