'use strict';

var express = require('express'),
    router = express.Router(),
    _ = require('underscore'),
    request = require('request'),
    redisClient = require('../../redis.js'),
    db = require('../IF_schemas/db'),
    upload = require('../../IF_services/upload'),
    uniquer = require('../../IF_services/uniquer'),
    async = require('async');

//Create a new snap
router.post('/', function(req, res, next) {
    if (!req.user) {
           req.user = req.body.user
        // return next('You must log in first');
    }
    var newItem = new db.Landmark();
    newItem = _.extend(newItem, req.body);
    newItem.world = false;
    newItem.owner.mongoId = req.user._id;
    newItem.owner.profileID = req.user.profileID;
    newItem.owner.name = req.user.name;
    //Create a unique id field
    uniquer.uniqueId(newItem.owner.profileID, 'Landmarks').then(function(unique) {
        newItem.id = unique;
        //Upload each image in snap to Amazon S3
        async.eachSeries(newItem.base64, function(buffer, callback) {
            upload.uploadPicture(newItem.owner.profileID, buffer).then(function(imgURL) {
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
                redisClient.rpush('scraped', item._id, function(err, reply) {
                    if (err) {
                        err.niceMessage = 'Could not save item';
                        err.devMessage = 'REDIS QUEUE ERR';
                        return next(err);
                    }
                });
                // add activity for this thing
                // var a = new db.Activity({
                //     userIds: [req.user._id.toString()], //todo add ids for @user tags
                //     landmarkIds: [item._id.toString()],
                //     activityAction: 'item.post',
                //     seenBy: [req.user._id.toString()],
                //     data: {
                //         owner: req.user.getSimpleUser(),
                //         item: item.getSimpleItem()
                //     }
                // });
                // Increment users snapCount
                // req.user.update({
                //     $inc: {
                //         snapCount: 1
                //     }
                // }, function(err) {
                //     if (err) {
                //         err.niceMessage = 'Could not increment users snapCount';
                //         console.log(err)
                //     }
                // })
                // a.saveAsync().then(function() {
                //     res.send(item)
                // }).catch(next);
            });
        })
    }).catch(function(err) {
        if (err) {
            err.niceMessage = 'Error uploading image';
            return next(err);
        }
    })
});


module.exports = router;