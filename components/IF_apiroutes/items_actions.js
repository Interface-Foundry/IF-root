var express = require('express');
var app = express.Router();
var db = require('../IF_schemas/db');
var async = require('async')
    /**
     * This should be mounted at /api/items
     */

var mockItems = require('./mock_items.js');
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

//mongoId is item._id
app.post('/:mongoId/comment', function(req, res) {
    if (USE_MOCK_DATA) {
        return res.send(defaultResponse);
    }
    var comment = new db.Worldchat();
    comment.roomID = req.params.mongoId;
    comment.userID = req.user._id;
    comment.msg = req.body.msg;
    comment.avatar = user.avatar;
    comment.save(function(err, comment) {
        if (err) return next(err)
        return comment
    })
});

//mongoId is comment._id
app.post('/:mongoId/deletecomment', function(req, res) {
    if (USE_MOCK_DATA) {
        return res.send(defaultResponse);
    }
    db.Worldchat.findOne({
        '_id': req.params.mongoId
    }).remove(function(err, comment) {
        if (err) return next(err)
        console.log('comment deleted.')
        res.sendStatus(200);
    })
});

//front-end will send tags object in post body
// {
//   categories: [],
//   text: []
//  }
//note: cloudsight will pull color 
//which will be auto-matched on backend to nearest color available
app.post('/:mongoId/tag', function(req, res) {
    if (USE_MOCK_DATA) {
        return res.send(defaultResponse);
    }
    var tagObj = req.body.tags
    db.Landmarks.findOne({
        '_id': req.params.mongoId
    }, function(err, item) {
        if (err) return next(err)
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
app.post('/:mongoId/deletetag', function(req, res) {
    if (USE_MOCK_DATA) {
        return res.send(defaultResponse);
    }
    db.Landmarks.findOne({
        '_id': req.params.mongoId
    }, function(err, item) {
        if (err) return next(err)
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

app.post('/:mongoId/fav', function(req, res) {
    if (USE_MOCK_DATA) {
        return res.send(defaultResponse);
    }
});

app.post('/:mongoId/unfav', function(req, res) {
    if (USE_MOCK_DATA) {
        return res.send(defaultResponse);
    }
});

app.post('/:mongoId/reject', function(req, res) {
    if (USE_MOCK_DATA) {
        return res.send(defaultResponse);
    }
});

app.post('/:mongoId/unreject', function(req, res) {
    if (USE_MOCK_DATA) {
        return res.send(defaultResponse);
    }
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

app.post('/:mongoId/report', function(req, res) {
    if (USE_MOCK_DATA) {
        return res.send(defaultResponse);
    }
});

module.exports = app;