var express = require('express');
var app = express.Router();
var db = require('../IF_schemas/db');
var async = require('async');
var RSVP = require('rsvp');
/**
 * This should be mounted at /api/items
 */

var mockItems = require('./../../test/KipAPI/mock_items.js');
var USE_MOCK_DATA = false;

var defaultResponse = {
    status: '(⌒‿⌒)'
};

// All of these actions require an item to be present in the database
// They also require you to be logged in (except the report route)
app.use('/:mongoId/:action', function(req, res, next) {
    if (!req.user && req.params.action !== 'report') {
        return next('You must log in first');
    }

    db.Landmarks.findById(req.params.mongoId, function(err, item) {
        if (err) {
            err.niceMessage = 'Could not find item';
            return next(err);
        } else if (!item) {
            return next('Could not find item');
        }

        req.item = item;
        req.ownsItem = item.owner.mongoId === req.user._id.toString();

        // create an activity object for this action, only save it to the db in each route, though
        req.activity = new db.Activity({
            userIds: [],
            landmarkIds: [req.item._id.toString()],
            activityTime: new Date(),
            activityAction: 'item.' + req.params.action.toLowerCase(),
            data: {},
            publicVisible: true,
            privateVisible: true,
            seenBy: [req.user._id.toString()]
        });

        if (req.user && req.user_id) {
            req.activity.userIds.push(req.user._id.toString());
        }

        if (req.item.owner && req.item.owner.mongoId) {
            req.activity.userIds.push(req.item.owner.mongoId.toString());
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
    var commentExists = req.item.comments.reduce(function(p, o) {
        return p || (o.user.mongoId === comment.user.mongoId && o.comment === comment.comment && o.timeCommented === comment.timeCommented);
    }, false);

    if (commentExists) {
        return res.send({item: req.item});
    }

    // New comment
    req.item.comments.push(comment);
    req.item.save(function(e) {
        if (e) {
            e.niceMessage = 'Could not post comment on the item';
            return next(e);
        } else {
            res.send({item: req.item});
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
            item: req.item.getSimpleItem()
        };
        req.activity.saveAsync().catch(next);
    }, function(err) {
        next(err);
    });
});

app.post('/:mongoId/deletecomment', function(req, res, next) {
    // $pull removes all documents matching the query from the array
    req.item.update({
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
        db.Landmarks.findById(req.item._id, function(e, doc) {
            res.send({item: doc});
        });

        // add an activity for the comment deletion
        req.activity.data = {
            comment: req.body.comment,
            commenter: req.user.getSimpleUser(),
            owner: req.item.owner,
            item: req.item.getSimpleItem()
        };
        req.activity.privateVisible = false;
        req.activity.publicVisible = false;
        req.activity.saveAsync().catch(next);
    });
});

//front-end will send tags object in post body
// {
//   categories: [],
//   text: []
//  }
//note: cloudsight will pull color 
//which will be auto-matched on backend to nearest color available
app.post('/:mongoId/tag', function(req, res, next) {
    if (!req.ownsItem) {
        return next('You are not authorized to add tags to this item');
    }

    // Manually compile the set of tags
    // Could have used mongodb's $addToSet feature, but that would require two round trips to
    // the db server, where this manual way is only one.
    if (req.body.text) {
        req.body.text.map(function(tag) {
            if (req.item.itemTags.text.indexOf(tag) < 0) {
                req.item.itemTags.text.push(tag);
            }
        });
    }

    if (req.body.categories) {
        req.body.categories.map(function(tag) {
            if (req.item.itemTags.categories.indexOf(tag) < 0) {
                req.item.itemTags.categories.push(tag);
            }
        });
    }

    req.item.save(function(e) {
        if (e) {
            e.niceMessage = 'Could not save tags';
            return next(e);
        } else {
            return res.send({item: req.item});
        }
    });
});

// body: {
//   “type”: “colors” or “categories” or “text”,
//   “value”: “whatever”
// }
//front-end will send array of tag strings to delete in post body
app.post('/:mongoId/deletetag', function(req, res, next) {
    if (!req.ownsItem) {
        return next('You are not authorized to delete tags for this item');
    }

    if (!req.body.type || !req.body.value) {
        var e = {};
        e.niceMessage = 'Could not delete tag';
        e.devMessage = 'Request body must be {type: "type", value: "tag"}';
        return next(e);
    }

    // Delete tags using mongodb's $pull method
    var pull = {}; // {itemTags.type: value}
    pull['itemTags.' + req.body.type] = req.body.value;
    req.item.update({
        $pull: pull
    }, function(e) {
        if (e) {
            e.niceMessage = 'Could not delete tag ' + req.body.value;
            e.devMessage = 'Error with $pull in delete tags';
            return next(e);
        }
        db.Landmarks.findById(req.item._id, function(e, item) {
            if (e) {
                e.niceMessage = 'Could not delete tag ' + req.body.value;
                return next(e);
            }
            res.send({item: item});
        });
    });
});

app.post('/:mongoId/fave', function(req, res, next) {
    // check to see if user has faved yet. there might be a better way with $push,
    // but i don't want to end up with multiple faves from the same user :/
    var hasFaved = req.item.faves.reduce(function(p, o) {
        return p || (o.userId === req.user._id.toString());
    }, false);

    if (!hasFaved) {
        // update the item
        req.item.faves.push({
            userId: req.user._id.toString(),
            timeFaved: new Date()
        });
        req.item.save(function(e) {
            if (e) {
                e.niceMessage = 'Oops there was an error faveing the item.';
                e.devMessage = 'Error adding fave to item collection';
                return next(e);
            }
            res.send({item: req.item});
        });

        // update the cached list of faves
        db.Users.update({
            _id: req.user._id
        }, {
            $addToSet: {
                faves: req.item._id.toString()
            }
        }, function(e) {
            if (e) {
                e.niceMessage = 'Oops there was an error faveing the item.';
                e.devMessage = 'Error adding fave to user collection';
                return next(e);
            }
        });

        // add an activity
        req.activity.data = {
            item: req.item.getSimpleItem(),
            faver: req.user.getSimpleUser(),
            owner: req.item.owner
        };
        req.activity.saveAsync().then(function() {}).catch(next);

    } else {
        res.send({item: req.item});
    }
});

app.post('/:mongoId/unfave', function(req, res, next) {
    // update the item
    console.log(req.user._id.toString());
    req.item.update({
        $pull: {
            faves: {
                userId: req.user._id.toString()
            }
        }
    }, function(e) {
        if (e) {
            e.niceMessage = 'Could not un-fave the item';
            e.devMessage = 'un-fave failed for Items collection';
            return next(e);
        } else {
            // add an activity
            req.activity.data = {
                item: req.item.getSimpleItem(),
                faver: req.user.getSimpleUser(),
                owner: req.item.owner          
            };
            req.activity.privateVisible= false;
            req.activity.publicVisible= false;
            req.activity.saveAsync().then(function() {}).catch(next);
            db.Landmarks.findById(req.item._id, function(e, doc) {
                res.send({item: doc});
            });
        }
    });


    // update the users cache of faved things
    db.Users.update({
        _id: req.user._id
    }, {
        $pull: {
            faves: req.item._id.toString()
        }
    }, function(e) {
        if (e) {
            e.niceMessage = 'Could not un-fave the item';
            e.devMessage = 'un-fave failed for Items collection';
            next(e);
        }
    });

});

app.post('/:mongoId/reject', function(req, res, next) {
    // update the users list of cached rejects
    db.Users.update({
        _id: req.user._id
    }, {
        $addToSet: {
            rejects: req.params.mongoId
        }
    }, function(e) {
        if (e) {
            e.niceMessage('Could not reject the item, maybe you should fave it ;)');
            return next(e);
        } else {
            db.Users.findById(req.user._id, function(e, doc) {
                return res.send({user: doc});
            });
        }
    })
});

app.post('/:mongoId/unreject', function(req, res, next) {
    // update the users list of cached rejects
    db.Users.update({
        _id: req.user._id
    }, {
        $pull: {
            rejects: req.params.mongoId
        }
    }, function(e) {
        if (e) {
            e.niceMessage('Could not un-reject the item');
            return next(e);
        } else {
            db.Users.findById(req.user._id, function(e, doc) {
                return res.send({user: doc});
            });
        }
    });
});

app.post('/:mongoId/snap', function(req, res) {
    if (USE_MOCK_DATA) {
        return res.send(defaultResponse);
    }
});

app.post('/:mongoId/deletesnap', function(req, res) {
    if (USE_MOCK_DATA) {
        return res.send(defaultResponse);
    }
});

app.post('/:mongoId/report', function(req, res, next) {
    if (USE_MOCK_DATA) {
        return res.send(defaultResponse);
    }

    if (!req.item.reports) {
        req.item.reports = [req.body];
    } else {
        req.item.reports.push(req.body);
    }
    req.item.save(function(e) {
        if (e) {
            e.niceMessage = 'Oops there was a problem processing your feedback.  Please try again';
            return next(e);
        }
        return res.send({item: req.item});
    });
});

module.exports = app;