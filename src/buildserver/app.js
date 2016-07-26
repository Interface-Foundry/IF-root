var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var morgan = require('morgan')
var request = require('request')
var async = require('async')
var _ = require('underscore')
var auth = require('basic-auth-connect')
var mongoose = require('mongoose');

// connect our DB
require('kip');
var Message = db.Message;
var Slackbots = db.Slackbots;

app.use(bodyParser.json());
app.use(morgan())
app.use(express.static(__dirname + '/public'));

app.use(auth('kip', 'vampirecat1200'))

app.listen(8000);