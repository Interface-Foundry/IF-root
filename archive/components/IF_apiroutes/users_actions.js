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

app.use('/:x/:action', function(req, res, next) {
    if (!req.user) {
        return next('Hi. You must log in first. (´• ω •`)ﾉ');
    }

    if (req.targetMongoId === req.user._id.toString()) {
        return next('You can\'t ' + req.params.action + ' yourself (・_・//)');
    }

    next();
});

// req.user follows :mongoId user
app.post('/:mongoId/follow', function(req, res, next) {
    req.targetUser.update({
        $addToSet: {
            followers: req.userId
        }
    }, function(err) {
        if (err) {
            next(err);
        }
    });

    req.user.update({
        $addToSet: {
            following: req.targetMongoId
        }
    }, function(err) {
        if (err) {
            err.niceMessage = 'Could not follow ' + req.targetUser.name + '. Please try again (⌒‿⌒)';
            return next(err);
        }

        // add an activity
        var activity = new db.Activity({
            userIds: [req.user._id.toString(), req.targetMongoId],
            activityAction: 'user.follow',
            privateVisible: true,
            publicVisible: true,
            data: {
                follower: req.user.getSimpleUser(),
                followed: req.targetUser.getSimpleUser()
            },
            seenBy: [req.user._id.toString()]
        });

        activity.saveAsync().then(function() {
            res.send(defaultResponse);
        }).catch(next);
    });
});

app.post('/:mongoId/unfollow', function(req, res, next) {
    req.targetUser.update({
        $pull: {
            followers: req.userId
        }
    }, function(e) { if (e) { next(e) }});

    req.user.update({
        $pull: {
            following: req.targetMongoId
        }
    }, function(err) {
        if (err) {
            err.niceMessage = 'Could not unfollow ' + req.targetUser.name + '. Please try again to unfollow that horrible wretched person (⌒‿⌒)';
            return next(err);
        }

        // add an activity
        var activity = new db.Activity({
            userIds: [req.user._id.toString(), req.targetUser._id.toString()],
            activityAction: 'user.unfollow',
            privateVisible: false,
            publicVisible: false,
            data: {
                follower: req.user.getSimpleUser(),
                followed: req.targetUser.getSimpleUser()
            },
            seenBy: [req.user._id.toString()]
        });

        activity.saveAsync().then(function() {
            res.send(defaultResponse);
        }).catch(next);

    });
});


module.exports = app;