'use strict';

var express = require('express'),
    router = express.Router(),
    landmark = require('../IF_schemas/landmark_schema.js'),
    _ = require('underscore'),
    shapefile = require('shapefile'),
    request = require('request'),
    redisClient = require('../../redis.js'),
    db = require('../IF_schemas/db');

//Get item given an item ID
router.get('/:id', function(req, res, next) {
    var result = {};
    landmark.findById(req.params.id, function(err, item) {
        if (err) {
            err.niceMessage = 'No item found.';
            return next(err);
        } else if (!item) {
            return next("No item found.");
        }
        result.item = item;
        db.Landmarks.findById(item.parent.mongoId, function(err, place) {
            if (err) {
                err.niceMessage = 'Could not find store for this item.';
                return next(err);
            } else if (!place) {
                return next("Could not find store for this item.");
            }
            result.parent = place;
            res.send(result);
        })
    });
});

//Update an item
router.put('/:id', function(req, res, next) {
    if (req.user) {
        landmark.findById(req.params.id, function(err, item) {
            if (err) {
                err.niceMessage = 'No no, item no here.';
                return next(err);
            }
            if (item && req.user._id.toString() === item.owner.mongoId) { //Merge existing item with updated object from frontend
                item = _.extend(item, req.body);
                //Save item
                item.save(function(err, item) {
                    if (err) {
                        err.niceMessage = 'Could not update item';
                        return next(err);
                    }
                    res.send(item)
                })
            } else {
                console.log('you are not authorized...stand down..');
                return next('You are not authorized to edit this item');
            }
        })
    } else {
        console.log('you are not authorized...stand down..');
        return next('You must log in first.');
    }
});

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

module.exports = router;