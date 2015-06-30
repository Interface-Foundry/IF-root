'use strict';

var express = require('express'),
  app = express.Router(),
  db = require('../IF_schemas/db');


app.get('/:mongoId', function(req, res, next) {
  db.Users.findById(req.params.mongoId, function(err, user) {
    if (err || !user) {
      err.niceMessage = 'Could not find user';
      return next(err);
    }
    res.send(user);
  });
});

module.exports = app;