'use strict';

var express = require('express'),
    app = express.Router(),
    db = require('../IF_schemas/db'),
    _ = require('lodash'),
    upload = require('../../IF_services/upload');

// Gets all the usernames
app.get('/usernames', function(req, res, next) {
    db.Users
        .find({})
        .select('profileID')
        .exec(function(err, users) {
            if (err) {
                next(err);
            } else {
                res.send(users.reduce(function(hash, u) {
                    hash[u.profileID] = u._id;
                    return hash;
                }, {}));
            }
        });
});

// sets req.targetMongoId and req.targetUser
app.use('/:mongoId*', function(req, res, next) {
    if (req.params.mongoId === 'me') {
        if (req.user && req.user._id) {
            req.targetMongoId = req.user._id.toString();
            req.targetUser = req.user;
            next();
        } else {
            return next('Hi! You need to log in to access this route. (´• ω •`)ﾉ');
        }
    } else {
        req.targetMongoId = req.params.mongoId;
        db.Users.findById(req.targetMongoId, function(e, user) {
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
app.get('/:xmongoId', function(req, res, next) {
    res.send(req.targetUser);
});

/**
 * PUT /api/users/:mongoId
 */
app.put('/:xmongoId', function(req, res, next) {
    if (req.userId !== req.targetMongoId) {
        return next({niceMessage: "Sorry, you can't update other people's profiles."})
    } else if (req.targetMongoId !== req.body._id) {
        return next({niceMessage: "Sorry, you can't update other people's profiles."}, {devMessage: "target and body user id mismatch."})
    }
    if (req.body.profileID) {
        req.body.profileID = req.body.profileID.toLowerCase();
    }

    _.merge(req.user, req.body);

    req.user.save(function(err, user) {
        if (err) {
            return next(err);
        }

        res.send(user);
    })
});


/**
 * POST /api/users/avatar
 * Change my avatar
 */
app.post('/:xmongoId/avatar', function(req, res, next) {
    if (!req.userId) {
        return next('You must log in to change your avatar');
    } else if (!req.body.base64) {
        return next('Please select a picture to upload');
    }

    // upload to s3
    upload.uploadPicture(req.user.profileID, req.body.base64)
        .then(function(imgURL) {
                res.send({avatar: imgURL});
            }, function(err) {
                if (err) {
                    err.niceMessage = 'Error uploading image';
                    return next(err);
                }
            })
});

/**
 * GET /api/users/:mongoId/activity
 */
app.get('/:xmongoId/activity', function(req, res, next) {
    db.Activities.find({
            userIds: req.targetMongoId,
            privateVisible: true,
            publicVisible: true
        })
        .sort({
            activityTime: -1
        })
        .limit(30)
        .execAsync()
        .then(function(activities) {
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
app.get('/:xmongoId/:followxxx/activity', function(req, res, next) {
    if (['followers', 'following'].indexOf(req.params.followxxx) < 0) {
        return next();
    }

    db.Activities.find({
            userIds: {
                $in: req.user[req.params.followxxx]
            }
        })
        .sort({
            activityTime: -1
        })
        .limit(30)
        .execAsync()
        .then(function(activities) {
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
app.get('/:xmongoId/faves', function(req, res, next) {
    db.Landmarks.find({
            '_id': {
                $in: req.targetUser.faves
            }
        })
        .sort({
            'time.created': -1
        })
        .limit(30)
        .execAsync()
        .then(function(snaps) {
            return db.Looks.find({
                    _id: {
                        $in: req.targetUser.faves
                    }
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
app.get('/:xmongoId/snaps', function(req, res, next) {
    console.log('targetMongoId:', req.targetMongoId)
    db.Landmarks.find({
            'owner.mongoId': req.targetMongoId,
            world: false
        })
        .sort({
            'time.created': -1
        })
        .limit(30)
        .execAsync()
        .then(function(snaps) {
            //For snaps without user inputted tags, show the auto-tags instead
            snaps.forEach(function(snap) {
                if (snap.itemTags.text.length < 1) {
                    snap.itemTags.text = snap.itemTags.auto
                }
            })
            res.send({
                results: snaps,
                links: {}
            });
        }).catch(next);
});

/**
 * GET /api/users/:mongoId/looks
 */
app.get('/:xmongoId/looks', function(req, res, next) {
    db.Looks.find({
            'owner.mongoId': req.targetMongoId
        })
        .sort({
            'created': -1
        })
        .limit(30)
        .execAsync()
        .then(function(looks) {
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
app.get('/:xmongoId/getAll', function(req, res, next) {
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
        .then(function(looks) {
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
                .then(function(snaps) {
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
            _id: {
                $in: follows
            }
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
