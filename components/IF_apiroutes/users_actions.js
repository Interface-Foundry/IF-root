var express = require('express');
var app = express.Router();
var db = require('../IF_schemas/db');
var async = require('async')
var rsvp = require('rsvp');
/**
 * This should be mounted at /api/users
 */

var defaultResponse = {
  status: '(⌒‿⌒)'
};

var notImplemented = {
  status: 'not implemented ＼(º □ º 〃)/'
};

app.use('/:mongoId/:action', function(req, res, next) {
  if (!req.user) {
    return next('You must log in first');
  }

  db.Users.findById(req.params.mongoId, function(err, user) {
    if (err) {
      err.niceMessage = 'Could not find user';
      return next(err);
    } else if (!user) {
      return next('Could not find user');
    }

    // target user is the user who is being "followed" or whatever
    req.targetUser = user;

    next();
  });
});

app.post('/:mongoId/follow', function(req, res, next) {
  req.user.update({$addToSet: {following: req.params.mongoId}}, function(err) {
    if (err) {
      err.niceMessage = 'Could not follow ' + req.targetUser.name + '. Please try again :)';
      return next(err);
    }
    res.send(defaultResponse);
  });
});

app.post('/:mongoId/unfollow', function(req, res, next) {
  req.user.update({$pull: {following: req.params.mongoId}}, function(err) {
    if (err) {
      err.niceMessage = 'Could not unfollow ' + req.targetUser.name + '. Please try again to unfollow that horrible wretched person :)';
      return next(err);
    }
    res.send(defaultResponse);
  });
});

app.get('/notifications', function(req, res, next) {
  if (!req.user) {
    return next('You must log in first');
  }

  res.send(notImplemented);
});

module.exports = app;