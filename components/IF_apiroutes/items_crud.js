'use strict';

var express = require('express'),
    router = express.Router(),
    db = require('db'),
    landmark = db.Landmark,
    _ = require('underscore'),
    shapefile = require('shapefile'),
    request = require('request'),
    redisClient = require('../../redis.js'),
    mock_places = require('../../test/KipAPI/mock_places');

// delete is sooooo idempotent.

//delete an item
router.post('/:id/delete', function(req, res, next) {
    if (req.user) {
        landmark.findById(req.params.id, function(err, item) {
            if (err) {
                err.niceMessage = 'No no, item no here.';
                return next(err);
            }

            if (!item) {
                // no problem, item doesn't exist.  this is idempotency
                res.sendStatus(200);
            }

            if (req.user._id.toString() === item.owner.mongoId) {
                //Delete entry
                item.remove(function(err) {
                    if (err) {
                        err.niceMessage = 'Could not delete item';
                        return next(err);
                    }
                    //Decrement users snapCount
                    req.user.update({
                        $inc: {
                            snapCount: -1
                        }
                    }, function(err) {
                        if (err) {
                            err.niceMessage = 'Could not decrement users snapCount';
                            console.log(err)
                        }
                    })
                    res.sendStatus(200);
                    console.log('deleted!')
                })
            } else {
                console.log('you are not authorized...stand down..');
                return next('You are not authorized to delete this item');
            }

        });
    } else {
        console.log('you are not authorized...stand down..');
        return next('You must log in first.');
    }
});

/**
 * Middleware to attach the item to the request
 * req.item
 * req.itemId
 */
router.use('/:id*', function(req, res, next) {
    db.Landmarks.findById(req.params.id, function(err, item) {
        if (err) {
            return next(err);
        } else if (!item) {
            return next('Could not find item ＼(º □ º 〃)/');
        }

        req.item = item;
        req.itemId = item._id.toString();
        return next();

    });
});

//Get item given an item ID
router.get('/:id', function(req, res, next) {
    var result = {
        item: req.item
    };
    db.Landmarks.findById(req.item.parent.mongoId, function(err, place) {
        if (err) {
            err.niceMessage = 'Error finding store.';
            return next(err);
        } else if (!place) {
            return next("Error finding place");
        }
        result.parent = place;
        res.send(result);
    });
});

//Update an item
router.put('/:id', function(req, res, next) {
    if (!req.user) {
        return next('You must log in first. 	<(￣ ﹌ ￣)>');
    } else if (req.item.owner.mongoId !== req.userId) {
        return next('You are not authorized. Stand down. 	<(￣ ﹌ ￣)>');
    }

    // allow partial updates
    req.item = _.extend(req.item, req.body);
    req.item.save(function(err, item) {
        if (err) {
            err.niceMessage = 'Could not update item';
            return next(err);
        }
        res.send(item)
    });
});

/**
 * Get the most faved and liked looks for a snap
 */
router.get('/:xid/toplooks', function(req, res, next) {
    // todo sort
    // todo paginate, limit
    var page = 0;
    db.Looks.find({'snapIds': req.item._id}, function(err, looks) {
        if (err) {
            return next(err);
        }
        res.send({
            results: looks,
            links: {
                // todo
                next: '/api/items/' + req.itemId + '/toplooks?page=' + (page + 1)
            }
        });
    });
});

module.exports = router;