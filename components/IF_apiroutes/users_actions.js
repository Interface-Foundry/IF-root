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

// req.user follows :mongoId user
app.post('/:mongoId/follow', function(req, res, next) {
    req.user.update({
        $addToSet: {
            following: req.params.mongoId
        }
    }, function(err) {
        if (err) {
            err.niceMessage = 'Could not follow ' + req.targetUser.name + '. Please try again :)';
            return next(err);
        }

        // add an activity
        var activity = new db.Activity({
            userIds: [req.user._id.toString(), req.targetUser._id.toString()],
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
    req.user.update({
        $pull: {
            following: req.params.mongoId
        }
    }, function(err) {
        if (err) {
            err.niceMessage = 'Could not unfollow ' + req.targetUser.name + '. Please try again to unfollow that horrible wretched person :)';
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

app.get('/:mongoId/activity/me', function(req, res, next) {
    if (!req.user) {
        return next('Must be logged in to get activity')
    }

    db.Activities.find({
            userIds: req.user._id.toString()
        })
        .sort({
            activityTime: -1
        })
        .limit(10)
        .execAsync()
        .then(function(activities) {
            res.send({
                results: activities,
                links: {}
            });
        }).catch(next);
});

app.get('/:mongoId/activity/followers', function(req, res, next) {
    if (!req.user) {
        return next('Must be logged in to get activity')
    }
    //needs testing
    db.Users.findById(req.user._id).then(function(user) {
        var followers = user.followers.join(' ')
        db.Activities.find({
                $text: {
                    $search: followers
                }
            }, {
                score: {
                    $meta: "textScore"
                }
            })
            .sort({
                score: {
                    $meta: 'textScore'
                }
            })
            .sort({
                activityTime: -1
            })
            .limit(10)
            .execAsync()
            .then(function(activities) {
                res.send({
                    results: activities,
                    links: {}
                });
            }).catch(next);
    })
});

//get all snaps for user in collage screen
app.get('/:mongoId/snaps', function(req, res, next) {
    if (!req.user) {
        return next('Must be logged in.')
    }
    db.Landmarks.find({
            owner: {
                mongoId: req.params.mongoId.toString()
            }
        })
        .sort({
            _id: -1
        })
        .limit(30)
        .execAsync()
        .then(function(snaps) {
            res.send({
                results: snaps,
                links: {}
            });
        }).catch(next);
});

//get all snaps and looks for user
app.get('/:mongoId/getAll', function(req, res, next) {
    if (!req.user) {
        return next('Must be logged in.')
    }
    db.Looks.find({
            owner: {
                mongoId: req.params.mongoId.toString()
            }
        })
        .sort({
            _id: -1
        })
        .limit(30)
        .execAsync()
        .then(function(looks) {
            db.Landmarks.find({
                    owner: {
                        mongoId: req.params.mongoId.toString()
                    }
                })
                .sort({
                    _id: -1
                })
                .limit(30)
                .execAsync()
                .then(function(snaps) {
                    var all = looks.concat(snaps)
                    res.send({
                        results: all,
                        links: {}
                    });
                }).catch(next);
        }).catch(next);
});

app.get('/notifications', function(req, res, next) {
    if (!req.user) {
        return next('You must log in first');
    }

    res.send(notImplemented);
});

module.exports = app;