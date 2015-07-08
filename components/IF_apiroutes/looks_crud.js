'use strict';

var express = require('express'),
    router = express.Router(),
    _ = require('underscore'),
    db = require('../IF_schemas/db'),
    upload = require('../../IF_services/upload')

//Get look given a look ID
router.get('/:id', function(req, res, next) {
    db.Look.findById(req.params.id, function(err, item) {
        if (err) {
            err.niceMessage = 'No look found.';
            return next(err);
        } else if (!item) {
            return next('No look found.');
        }
        res.send(item);
    });
});

//Create a new look
router.post('/', function(req, res, next) {
    if (!req.user) {
        return next('You must log in first');
    }
    var look = new db.Look();
    look = _.extend(look, req.body);
    look.owner.name = req.user.name;
    look.owner.profileID = req.user.profileID;
    look.owner.mongoId = req.user._id;
    //front-end is sending base64 buffer stream
    upload.uploadLook(look.owner.profileID,look.base64).then(function(imgURL) {
        look.lookImg = imgURL;
        //populate data for each snap in look
        async.eachSeries(look.snapIDs, function(snapId, callback) {
            db.Landmarks.findById(snapId, function(err, snap) {
                look.snapIds.push(snapId);
                look.ownerIds.push(snap.owner.mongoId);
                look.imgURLs.push(snap.itemImageURL);
                look.tags.push(snap.itemTags)
                callback(null)
            })
        }, function(err) {
            if (err) {
                err.niceMessage = 'Error populating snap data for look.';
                return next(err);
            }
            look.save(function(err, item) {
                if (err) {
                    err.niceMessage = 'Could not save look';
                    return next(err);
                }
                // add activity for this thing
                var a = new db.Activity({
                    userIds: [req.user._id.toString()], //todo add ids for @user tags
                    landmarkIds: [look._id.toString()],
                    activityAction: 'look.post',
                    seenBy: [req.user._id.toString()],
                    data: {
                        owner: req.user.getSimpleUser(),
                        look: look.getSimpleLook()
                    }
                });
                a.saveAsync().then(function() {
                    res.send(look)
                }).catch(next);
            });
        });
    })
});


//Update a look
router.put('/:id', function(req, res, next) {
    if (req.user) {
        db.Looks.findById(req.params.id, function(err, look) {
            if (err) {
                err.niceMessage = 'No look found';
                return next(err);
            }
            if (look && req.user._id.toString() === look.owner.mongoId) { //Merge existing item with updated object from frontend
                look = _.extend(look, req.body);
                //Save item
                look.save(function(err, item) {
                    if (err) {
                        err.niceMessage = 'Could not update item';
                        return next(err);
                    }
                    res.send(look)
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

//delete a look
router.post('/:id/delete', function(req, res, next) {
    if (req.user) {
        db.Look.findById(req.params.id, function(err, look) {
            if (err) {
                err.niceMessage = 'No look found.';
                return next(err);
            }

            if (!look) {
                res.sendStatus(200);
            }

            if (req.user._id.toString() === look.owner.mongoId) {
                //Delete entry
                look.remove(function(err) {
                    if (err) {
                        err.niceMessage = 'Could not delete item';
                        return next(err);
                    }
                    res.sendStatus(200);
                    console.log('deleted!')
                })
            } else {
                console.log('you are not authorized...stand down..');
                return next('You are not authorized to delete this look');
            }
        });
    } else {
        console.log('you are not authorized...stand down..');
        return next('You must log in first.');
    }
});

module.exports = router;