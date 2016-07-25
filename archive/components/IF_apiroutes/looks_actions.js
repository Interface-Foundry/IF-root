var express = require('express');
var app = express.Router();
var db = require('../IF_schemas/db');
var async = require('async');
var RSVP = require('rsvp');

var defaultResponse = {
    status: '(⌒‿⌒)'
};


// All of these actions require a look to be present in the database
// They also require you to be logged in (except the report route)
app.use('/:mongoId/:action', function(req, res, next) {
    if (!req.user && req.params.action !== 'report') {
        return next('You must log in first');
    }

    db.Looks.findById(req.params.mongoId, function(err, look) {
        if (err) {
            err.niceMessage = 'Could not find look';
            return next(err);
        } else if (!look) {
            return next('Could not find look');
        }

        req.look = look;
        req.ownsLook = look.owner.mongoId === req.user._id.toString();

        // create an activity object for this action, only save it to the db in each route, though
        req.activity = new db.Activity({
            userIds: [],
            activityTime: new Date(),
            activityAction: 'look.' + req.params.action.toLowerCase(),
            data: {},
            publicVisible: true,
            privateVisible: true,
            seenBy: [req.user._id.toString()]
        });

        if (req.user && req.userId) {
            req.activity.userIds.push(req.user._id.toString());
        }

        if (req.look.owner && req.look.owner.mongoId) {
            req.activity.userIds.push(req.look.owner.mongoId.toString());
        }

        // otherwise continue happily
        next();
    });
});



app.post('/:mongoId/comment', function(req, res, next) {
    var comment = req.body;
    comment.user = {
        mongoId: req.user._id.toString(),
        profileID: req.user.profileID,
        name: req.user.name,
        avatar: req.user.avatar
    };

    // check if comment exists already (double submit?)
    var commentExists = req.look.comments.reduce(function(p, o) {
        return p || (o.user.mongoId === comment.user.mongoId && o.comment === comment.comment && o.timeCommented === comment.timeCommented);
    }, false);

    if (commentExists) {
        return res.send({
            look: req.look
        });
    }

    // New comment
    req.look.comments.push(comment);
    req.look.save(function(e) {
        if (e) {
            e.niceMessage = 'Could not post comment on the item';
            return next(e);
        } else {
            res.send({
                look: req.look
            });
        }
    });

    // Definitely save the activity for a snap comment
    db.Users.getMentionedUsers(comment.comment).then(function(users) {
        users.map(function(u) {
            req.activity.addUser(u._id.toString());
        });
        req.activity.data = {
            comment: comment,
            commenter: req.user.getSimpleUser(),
            owner: req.item.owner,
            item: req.item.getSimpleLook()
        };
        req.activity.saveAsync().catch(next);
    }, function(err) {
        next(err);
    });
});

app.post('/:mongoId/deletecomment', function(req, res, next) {
    // $pull removes all documents matching the query from the array
    req.look.update({
        $pull: {
            comments: {
                'user.mongoId': req.user._id.toString(),
                comment: req.body.comment,
                timeCommented: req.body.timeCommented
            }
        }
    }, function(e) {
        if (e) {
            e.niceMessage = 'Could not delete comment on item';
            return next(e);
        }
        db.Looks.findById(req.look._id, function(e, doc) {
            res.send({
                look: doc
            });
        });

        // add an activity for the comment deletion
        req.activity.data = {
            comment: req.body.comment,
            commenter: req.user.getSimpleUser(),
            owner: req.item.owner,
            look: req.look.getSimpleLook()
        };
        req.activity.privateVisible = false;
        req.activity.publicVisible = false;
        req.activity.saveAsync().catch(next);
    });
});




app.post('/:mongoId/fave', function(req, res, next) {
    // check to see if user has faved yet. there might be a better way with $push,
    // but i don't want to end up with multiple faves from the same user :/
    var hasFaved = req.look.faves.reduce(function(p, o) {
        return p || (o.userId === req.user._id.toString());
    }, false);

    if (hasFaved) {
        return res.send({
            look: req.look,
            user: req.user
        });
    }

    // give the owner points
    if (req.look.owner && req.look.owner.mongoId) {
        db.Users.update({
            _id: req.look.owner.mongoId
        }, {
            $inc: {
                kip: 5
            }
        }, function(err) {
            if (err) {
                // todo log error to ELK
                console.error(err);
            }
        });
    }

    // update the look
    req.look.faves.push({
        userId: req.user._id.toString(),
        timeFaved: new Date()
    });

    req.look.save(function(e) {
        if (e) {
            e.niceMessage = 'Oops there was an error faveing the item.';
            e.devMessage = 'Error adding fave to item collection';
            return next(e);
        }
    });

    // update the cached list of faves
    db.Users.update({
        _id: req.user._id
    }, {
        $addToSet: {
            faveLooks: req.look._id.toString()
        }
    }, function(e) {
        if (e) {
            e.niceMessage = 'Oops there was an error faveing the item.';
            e.devMessage = 'Error adding fave to user collection';
            return next(e);
        }
        db.Users.findById(req.userId, function(e, u) {
            console.log('RESULT:', req.look, u)
            res.send({
                look: req.look,
                user: u
            });
        });

        // add an activity
        req.activity.data = {
            look: req.look.getSimpleLook(),
            faver: req.user.getSimpleUser(),
            owner: req.look.owner
        };
        req.activity.saveAsync().then(function() {}).catch(next);
    });
});

app.post('/:mongoId/unfave', function(req, res, next) {

    var lookPromise = req.look.update({
        $pull: {
            faves: {
                userId: req.user._id.toString()
            }
        }
    }).exec().then(function() {
        return db.Looks.findById(req.look._id);
    });

    // update the users cache of faved things
    var userPromise = db.Users.update({
        _id: req.user._id
    }, {
        $pull: {
            faveLooks: req.look._id.toString()
        }
    }).exec().then(function() {
        return db.Users.findById(req.user._id);
    });

    // send a response with the updated item and user
    RSVP.hash({
            look: lookPromise,
            user: userPromise
        })
        .then(function(results) {
            res.send(results);

            // add an activity
            req.activity.data = {
                look: req.look.getSimpleLook(),
                faver: req.user.getSimpleUser(),
                owner: req.look.owner
            };
            req.activity.privateVisible = false;
            req.activity.publicVisible = false;
            req.activity.saveAsync().then(function() {}).catch(next);
        }, function(e) {
            e.niceMessage = 'Could not un-fave the look';
            e.devMessage = 'un-fave failed for Looks collection';
            return next(e);
        });
})


app.post('/:mongoId/report', function(req, res, next) {
    if (USE_MOCK_DATA) {
        return res.send(defaultResponse);
    }

    if (!req.look.reports) {
        req.look.reports = [req.body];
    } else {
        req.look.reports.push(req.body);
    }
    req.look.save(function(e) {
        if (e) {
            e.niceMessage = 'Oops there was a problem processing your feedback.  Please try again';
            return next(e);
        }
        return res.send({
            user: req.user,
            item: req.look
        });
    });
});

module.exports = app;