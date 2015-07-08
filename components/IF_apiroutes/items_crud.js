'use strict';

var express = require('express'),
    router = express.Router(),
    landmark = require('../IF_schemas/landmark_schema.js'),
    _ = require('underscore'),
    shapefile = require('shapefile'),
    request = require('request'),
    redisClient = require('../../redis.js'),
    db = require('../IF_schemas/db');

var googleAPI = 'AIzaSyAj29IMUyzEABSTkMbAGE-0Rh7B39PVNz4';

//Get item given an item ID
router.get('/:id', function(req, res, next) {
    landmark.findById(req.params.id, function(err, item) {
        if (err) {
            err.niceMessage = 'No no, item no here.';
            return next(err);
        } else if (!item) {
            return next("No no, item no here.");
        }

        res.send(item);
    });
});

//Create a new item
router.post('/', function(req, res, next) {
    if (!req.user) {
        return next('You must log in first');
    }
    var newItem = new landmark();
    newItem = _.extend(newitem, req.body);
    newItem.world = false;
    newItem.owner.mongoId = req.user._id;
    newItem.owner.profileID = req.user.profileID;
    newItem.owner.name = req.user.name;
    async.eachSeries(newItem.base64, function(buffer, callback) {
        upload.uploadPicture(look.owner.profileID, buffer).then(function(imgURL) {
            newItem.itemImageURL.push(imgURL)
            callback(null)
        }).catch(function(err) {
            if (err) {
                err.niceMessage = 'Error uploading image';
                return next(err);
            }
        })
    }, function(err) {
        if (err) {
            err.niceMessage = 'Error uploading one of the images.';
            return next(err);
        }
        //Save item
        newItem.save(function(err, item) {
            if (err) {
                err.niceMessage = 'Could not save item';
                return next(err);
            }
            redisClient.rpush('snaps', item._id, function(err, reply) {
                if (err) {
                    err.niceMessage = 'Could not save item';
                    err.devMessage = 'REDIS QUEUE ERR';
                    return next(err);
                }
                console.log('item added to redis snaps queue', reply);
                console.log('created item is..', item);
            });

            // add activity for this thing
            var a = new db.Activity({
                userIds: [req.user._id.toString()], //todo add ids for @user tags
                landmarkIds: [item._id.toString()],
                activityAction: 'item.post',
                seenBy: [req.user._id.toString()],
                data: {
                    owner: req.user.getSimpleUser(),
                    item: item.getSimpleItem()
                }
            });

            //Increment users snapCount
            req.user.update({
                $inc: {
                    snapCount: 1
                }
            }, function(err) {
                if (err) {
                    err.niceMessage = 'Could not increment users snapCount';
                    console.log(err)
                }
            })

            a.saveAsync().then(function() {
                res.send(item)
            }).catch(next);
        });
    })
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