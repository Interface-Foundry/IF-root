'use strict';

var express = require('express'),
    router = express.Router(),
    _ = require('underscore'),
    db = require('../IF_schemas/db'),
    upload = require('../../IF_services/upload'),
    uniquer = require('../../IF_services/uniquer'),
    async = require('async')

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
    // if (!req.user) {
    //     return next('You must log in first');
    // }
    
    // console.log('req.body',req.body)
    var look = new db.Look();
    look = _.extend(look, req.body);
    look.owner = {
      name: '',
      mongoId: '',
      profileID: ''
    }
    look.owner.name = req.user.name;
    look.owner.mongoId = req.user._id;
    look.owner.profileID = req.user.profileID;
    var input = req.user.profileID

    async.waterfall([
        function(callback) {
            //Create a unique id field
            uniquer.uniqueId(input, 'Looks').then(function(unique) {
                look.id = unique;
                callback(null, look);
            }).catch(function(err) {
                callback(err)
            })
        },
        function(look, callback) {
            //Upload look image to Amazon S3
            upload.uploadPicture(look.owner.profileID, look.base64).then(function(imgURL) {
                look.lookImg = imgURL;
                callback(null, look);
            }).catch(function(err) {
                callback(err)
            })
        },
        function(look, callback) {
          //Save look in db
            look.save(function(err, look) {
                if (err) {
                    err.niceMessage = 'Could not save look';
                    return callback(err)
                }
                console.log('New Look created!', look)
                callback(null, look);
            });
        }
    ], function(err, look) {
        if (err) {
            err.niceMessage = 'Error processing Look';
            return next(err);
        }
        // add activity
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