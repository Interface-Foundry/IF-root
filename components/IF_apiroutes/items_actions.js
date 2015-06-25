var express = require('express');
var app = express.Router();
var db = require('../IF_schemas/db');
var async = require('async')
    /**
     * This should be mounted at /api/items
     */

var mockItems = require('./../../test/KipAPI/mock_items.js');
var USE_MOCK_DATA = true;

var defaultResponse = {
    status: '(⌒‿⌒)'
};

// All of these actions require an item to be present in the database
app.use('/:mongoId/:action', function(req, res, next) {
    if (USE_MOCK_DATA && req.params.mongoId === '1234') {
        return next();
    }

    db.Landmarks.findById(req.params.mongoId, function(err, item) {
        if (err) {
            err.niceMessage = 'Could not find item';
            return next(err);
        }

        req.item = item;

        // otherwise continue happily
        next();
    });
});

app.post('/:mongoId/like', function(req, res) {
    if (USE_MOCK_DATA) {
        return res.send(defaultResponse);
    }
});

app.post('/:mongoId/unlike', function(req, res) {
    if (USE_MOCK_DATA) {
        return res.send(defaultResponse);
    }
});

app.post('/:mongoId/comment', function(req, res, next) {
    if (USE_MOCK_DATA) {
        return res.send(defaultResponse);
    }
    if (!req.user) {
        return next('You must log in first');
    }
    var comment = req.body;
    comment.userId = req.user._id.toString();
    comment.userProfileId = req.user.profileID;
    comment.userAvatar = user.avatar;

    // check if comment exists already (double submit?)
    var commentExists = req.item.comments.reduce(function(p, o) {
        return p || (o.userMongoId === comment.userMongoId
          && o.comment === comment.comment
          && o.timeCommented === comment.timeCommented);
    }, false);

    if (commentExists) {
        res.send(defaultResponse);
    } else {
        req.item.comments.push(comment);
        req.item.save(function(e) {
            if (e) {
                e.niceMessage = 'Could not post comment on the item';
                return next(e);
            } else {
                res.send(defaultResponse);
            }
        })
    }
});

app.post('/:mongoId/deletecomment', function(req, res, next) {
    if (USE_MOCK_DATA) {
        return res.send(defaultResponse);
    }
    if (!req.user) {
        return next('You must log in first');
    }

    // $pull removes all documents matching the query from the array
    req.item.update({$pull: {comments: {
        userId: req.user._id.toString(),
        comment: req.body.comment,
        timeCommented: req.body.timeCommented}}}, function(e) {
        if (e) {
            e.niceMessage = 'Could not delete comment on item';
            return next(e);
        }
        res.send(defaultResponse);
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
    if (USE_MOCK_DATA) {
        return res.send(defaultResponse);
    }
    if (!req.user) {
        return next('You must log in first');
    }
    var tagObj = req.body.tags
    db.Landmarks.findOne({
        '_id': req.params.mongoId
    }, function(err, item) {
        if (err) return next(err)
        if (item.ownerUserId !== req.user._id) {
            return next('You are not authorized to add tags to this item');
        }

        for (var type in tagObj) {
            if (tagObj.hasOwnProperty(type)) {
                tagObj[type].forEach(function(tag) {
                    item.itemTags[type].push(tag)
                })
            }
        }
        item.save(function(err, item) {
            if (err) return next(err)
            res.sendStatus(200);
            console.log('Tags added: ', item.itemTags)
        })
    })
});
//front-end will send array of tag strings to delete in post body
app.post('/:mongoId/deletetag', function(req, res, next) {
    if (USE_MOCK_DATA) {
        return res.send(defaultResponse);
    }
    if (!req.user) {
        return next('You must log in first');
    }
    db.Landmarks.findOne({
        '_id': req.params.mongoId
    }, function(err, item) {
        if (err) return next(err)
        if (item.ownerUserId !== req.user._id) {
            return next('You are not authorized to delete tags for this item');
        }
        req.body.tags.forEach(function(tagToDelete) {
            var i = item.itemTags.text.length;
            while (i--) {
                if (item.itemTags.text[i] == tagToDelete) {
                    item.itemTags.text.splice(i, 1);
                }
            }
        })
        item.save(function(err, item) {
            if (err) return next(err)
            res.sendStatus(200);
            console.log('Tags added.')
        })
    })
});

app.post('/:mongoId/fave', function(req, res, next) {
    if (!USE_MOCK_DATA) {
        return res.send(defaultResponse);
    }

    console.log(req.user);
    if (!req.user) {
        return next('Must be logged in to fave an item');
    }

    // check to see if user has faved yet. there might be a better way with $push,
    // but i don't want to end up with multiple faves from the same user :/
    var hasFaved = req.item.faves.reduce(function(p, o) {
        return p || (o.userId === req.user._id.toString());
    }, false);

    if (!hasFaved) {
        // update the item
        req.item.faves.push({userId: req.user.id, timeLiked: new Date()});
        req.item.save(function(e) {
            if (e) {
                e.niceMessage = 'Oops there was an error faveing the item.';
                e.devMessage = 'Error adding fave to item collection';
                return next(e);
            }
            res.send(defaultResponse);
        });

        // update the cached list of faves
        db.Users.update({_id: req.user._id},
          {$addToSet: {faves: req.user._id.toString()}}, function(e) {
            if (e) {
                e.niceMessage = 'Oops there was an error faveing the item.';
                e.devMessage = 'Error adding fave to user collection';
                return next(e);
            }
        })
    } else {
        res.send(defaultResponse);
    }
});

app.post('/:mongoId/unfave', function(req, res, next) {
    if (USE_MOCK_DATA) {
        return res.send(defaultResponse);
    }

    if (!req.user) {
        return next('Must be logged in to un-fave an item');
    }

    // update the item
    req.item.update({$pull: {faves: {userId: req.user._id.toString()}}}, function(e) {
          if (e) {
              e.niceMessage = 'Could not un-fave the item';
              e.devMessage = 'un-fave failed for Items collection';
              return next(e);
          } else {
              res.send(defaultResponse);
          }
      });

    // update the users cache of faved things
    db.Users.update({_id: req.user._id},
      {$pull: {faves: req.user._id.toString()}}, function(e) {
          e.niceMessage = 'Could not un-fave the item';
          e.devMessage = 'un-fave failed for Items collection';
          return next(e);
      })
});

app.post('/:mongoId/reject', function(req, res, next) {
    if (USE_MOCK_DATA) {
        return res.send(defaultResponse);
    }

    // update the users list of cached rejects
    db.Users.update({_id: req.user._id},
      {$addToSet: {rejects: req.params.mongoId}}, function(e) {
          if (e) {
              e.niceMessage('Could not reject the item, maybe you should fave it ;)');
              return next(e);
          } else {
              return res.send(defaultResponse);
          }
      })
});

app.post('/:mongoId/unreject', function(req, res, next) {
    if (USE_MOCK_DATA) {
        return res.send(defaultResponse);
    }

    // update the users list of cached rejects
    db.Users.update({_id: req.user._id},
      {$pull: {rejects: req.params.mongoId}}, function(e) {
          if (e) {
              e.niceMessage('Could not un-reject the item');
              return next(e);
          } else {
              return res.send(defaultResponse);
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
        return res.send(defaultResponse);
    });
});

module.exports = app;