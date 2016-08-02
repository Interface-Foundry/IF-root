var db = require('db');
var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var uuid = require('uuid');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var secret = 'SlytherinOrGTFO';  // lol
var open = require('open');
var expiresInMinutes = 10 * 365 * 24 * 60; // 10 years

app.use(function(req, res, next) {
  console.log(app.mountpath + req.path);
  next();
})

// Use cookie session ids
app.use(cookieParser());
app.use(bodyParser.json());

app.use(express.static(__dirname + '/static'));

// Use the same authentication as regular kip
app.use('/', require('../IF_auth/new_auth'));

app.get('/logout', function(req, res) {
  res.send('not implemented');
})

app.get('/login', function(req, res) {
  res.sendfile(__dirname + '/login.html');
})

app.use('*', function(req, res, next) {
  debugger;
  if (!req.isAdmin) {
    console.log('redirecting to ', app.mountpath + '/login');
    res.redirect(app.mountpath + '/login');
  } else {
    next();
  }
})

// get the reset page
app.get('/', function(req, res, next) {
    res.sendfile(__dirname + '/admin.html');
});

if (!module.parent) {
    app.listen(8081, function() {
        console.log('app listening on port 8081');
        open('http://localhost:8081');
    })
} else {
    module.exports = app;
}
