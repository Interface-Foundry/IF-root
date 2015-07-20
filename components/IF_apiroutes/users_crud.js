'use strict';

var express = require('express'),
    app = express.Router(),
    db = require('../IF_schemas/db');

// sets req.targetMongoId and req.targetUser
app.use('/:mongoId*', function (req, res, next) {
    if (req.params.mongoId === 'me') {
        if (req.user && req.user._id) {
            req.targetMongoId = req.user._id;
            req.targetUser = req.user;
            next();
        } else {
            return next('Hi! You need to log in to access this route. (´• ω •`)ﾉ');
        }
    } else {
        req.targetMongoId = req.params.mongoId;
        db.Users.findById(req.targetMongoId, function (e, user) {
            if (e || !user) {
                var err = e || {};
                err.niceMessage = 'Could not find user ＼(º □ º 〃)/';
                return next(err);
            }

            req.targetUser = user;
            next();
        });
    }
});

/**
 * GET /api/users/:mongoId
 */
app.get('/:xmongoId', function (req, res, next) {
    res.send(req.targetUser);
});

/**
 * GET /api/users/:mongoId/activity
 */
app.get('/:xmongoId/activity', function (req, res, next) {
    db.Activities.find({
        userIds: req.targetMongoId
    })
        .sort({
            activityTime: -1
        })
        .limit(30)
        .execAsync()
        .then(function (activities) {
            res.send({
                results: activities,
                links: {}
            });
        }).catch(next);
});

/**
 * GET /api/users/:mongoId/followers/activity
 * GET /api/users/:mongoId/following/activity
 *
 * (This route handles both)
 */
app.get('/:xmongoId/:followxxx/activity', function (req, res, next) {
    if (['followers', 'following'].indexOf(req.params.followxxx) < 0) {
        return next();
    }

    db.Activities.find({
        userIds: {$in: req.user[req.params.followxxx]}
    })
        .sort({
            activityTime: -1
        })
        .limit(30)
        .execAsync()
        .then(function (activities) {
            res.send({
                results: activities,
                links: {}
            });
        }).catch(next);
});

/**
 * GET /api/users/:mongoId/faves
 * Returns all faved snaps and looks for a user
 * TODO return faved looks and snaps by time FAVED not created
 * (could do this easily with the help of the activity collection)
 */
app.get('/:xmongoId/faves', function (req, res, next) {
    db.Landmarks.find({
        '_id': {$in: req.targetUser.faves}
    })
        .sort({
            'time.created': -1
        })
        .limit(30)
        .execAsync()
        .then(function (snaps) {
            return db.Looks.find({
                _id: {$in: req.targetUser.faves}
            })
                .sort({
                    'created': -1
                })
                .limit(30)
                .execAsync()
                .then(function(looks) {
                    var faves = snaps.concat(looks);
                    res.send({
                        results: faves,
                        links: {}
                    });
                });
        }).catch(next);
});

/**
 * GET /api/users/:mongoId/snaps
 */
app.get('/:xmongoId/snaps', function (req, res, next) {
    db.Landmarks.find({
        'owner.mongoId': req.targetMongoId,
        world: false
    })
        .sort({
            'time.created': -1
        })
        .limit(30)
        .execAsync()
        .then(function (snaps) {
            res.send({
                results: snaps,
                links: {}
            });
        }).catch(next);
});

/**
 * GET /api/users/:mongoId/looks
 */
app.get('/:xmongoId/looks', function (req, res, next) {
    db.Looks.find({
        'owner.mongoId': req.targetMongoId
    })
        .sort({
            'created': -1
        })
        .limit(30)
        .execAsync()
        .then(function (looks) {
            res.send({
                results: looks,
                links: {}
            });
        }).catch(next);
});

/**
 * GET /api/users/:mongoId/getAll
 * gets all snaps AND looks for a user.  pretty crazy, huh?
 */
app.get('/:xmongoId/getAll', function (req, res, next) {
    db.Looks.find({
        owner: {
            mongoId: req.targetMongoId.toString()
        }
    })
        .sort({
            created: -1
        })
        .limit(30)
        .execAsync()
        .then(function (looks) {
            return db.Landmarks.find({
                owner: {
                    mongoId: req.targetMongoId.toString()
                }
            })
                .sort({
                    'time.created': -1
                })
                .limit(30)
                .execAsync()
                .then(function (snaps) {
                    var all = looks.concat(snaps)
                    res.send({
                        results: all,
                        links: {}
                    });
                });
        }).catch(next);
});

/**
 * GET /api/users/:mongoId/followers
 * GET /api/users/:mongoId/following
 */
app.get('/:xmongoId/:followxxx', function(req, res, next) {
    if (['followers', 'following'].indexOf(req.params.followxxx) < 0) {
        return next();
    }

    // get the last 30 from the followers/following string array
    var follows = req.targetUser[req.params.followxxx].slice(-30);
    db.Users.find({
            _id: {$in: follows}
        })
        .execAsync()
        .then(function(users) {
            res.send({
                results: users,
                links: {}
            });
        }).catch(next);
});

module.exports = app;