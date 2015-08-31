var app = require('express').Router();
var spawn = require('child_process').spawn;

// get current git branch and info
var branch;
var commit = '';

var branchProcess = spawn('git', ['symbolic-ref', '-q', 'HEAD']);
branchProcess.stdout.on('data', function(data) {
    branch = data.toString().replace('refs/heads/', '');
    console.log('on branch', branch);
});

var commitProcess = spawn('git', ['log', '--name-status', 'HEAD^..HEAD']);
commitProcess.stdout.on('data', function(data) {
    commit = commit + data;
    console.log('on commit', commit);
});

app.use(function(req, res, next) {
    console.log('hitting devops route');
    if (req.user && req.user.admin) {
        next();
    } else {
        next({devMessage: 'not admin for devops'})
    }
})

// shows you what commit we're running
app.get('/commit', function(req, res) {
    res.set('Content-Type', 'text/plain');
    res.send(commit);
});

module.exports = app;