var config = require('../../config');
var mongoose = require('mongoose');
var db = mongoose.createConnection(config.mongodb.url);

module.exports = db;