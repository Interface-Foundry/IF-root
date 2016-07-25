'use strict';

/* Note: using staging server url, remove .testing() for production
Using .testing() will overwrite the debug flag with true */
var LEX = require('letsencrypt-express').testing();

// Change these two lines!
var DOMAIN = 'myservice.example.com';
var EMAIL = 'user@example.com';

var lex = LEX.create({
  configDir: require('os').homedir() + '/letsencrypt/etc'
, approveRegistration: function (hostname, approve) { // leave `null` to disable automatic registration
    if (hostname === DOMAIN) { // Or check a database or list of allowed domains
      approve(null, {
        domains: [DOMAIN]
      , email: EMAIL
      , agreeTos: true
      });
    }
  }
});

// A happy little express app
var express = require('express');
var app = express();

app.use(function (req, res) {
  res.send({ success: true });
});

lex.onRequest = app;

lex.listen([80], [443, 5001], function () {
  var protocol = ('requestCert' in this) ? 'https': 'http';
  console.log("Listening at " + protocol + '://localhost:' + this.address().port);
});
