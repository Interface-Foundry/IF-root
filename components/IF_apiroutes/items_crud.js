'use strict';

var express = require('express'),
    router = express.Router(),
    landmark = require('../IF_schemas/landmark_schema.js'),
    _ = require('underscore'),
    shapefile = require('shapefile'),
    request = require('request'),
    redisClient = require('../../redis.js');

var googleAPI = 'AIzaSyAj29IMUyzEABSTkMbAGE-0Rh7B39PVNz4';


//Get item given an item ID
router.get('/:id', function(req, res) {

    landmark.findOne(req.params.id, function(err, item) {
        if (err) {
            console.log(err);
            return res.send(500);
        }
        if (!item) return res.send(440);
        res.send(item);
    });
});

//Create a new item
router.post('/', function(req, res) {
    if (req.user) {
        var newitem = new landmark();
        var loc = {
            type: 'Point',
            coordinates: []
        };
        loc.coordinates.push(parseFloat(req.body.lat));
        loc.coordinates.push(parseFloat(req.body.lon));
        newitem.world = false;
        newitem.ownerUserName = req.user.name;
        newitem.ownerUserId = req.user.profileID;
        newitem.ownerMongoId = req.user._id;
        //s3 imgURL will be sent from post body
        newitem.itemImageURL = req.body.imgURL;
        var item = _.extend(newitem, req.body);
        //Save item
        item.save(
            function(err, item) {
                if (err) {
                    console.log(err)
                    return res.send(500);
                }
                redisClient.rpush('snaps', item._id, function(err, reply) {
                    if (err) console.log('REDIS QUEUE ERR: ', err)
                    console.log('item added to redis snaps queue', reply);
                    console.log('created item is..', item)
                    res.send(item)
                });

            })
    } else {
        console.log('you are not authorized...stand down..')
        res.send(401);
    }
})


//Update an item
router.put('/:id', function(req, res) {
    if (req.user) {
        landmark.findOne({
            id: req.params.id
        }, function(err, result) {
            if (err) {
                return handleError(res, err);
            }
            if (!result) {
                return res.send(404);
            }

            if (req.user._id == result.ownerMongoId) { //Merge existing item with updated object from frontend
                var item = _.extend(result, req.body);
                //Save item
                item.save(
                    function(err, item) {
                        if (err) {
                            console.log(err)
                            return res.send(500);
                        }
                        console.log('updated item is..', item)
                        res.send(item)
                    })
            } else {
                console.log('you are not authorized...stand down..')
                res.send(401);
            }
        })
    } else {
        console.log('you are not authorized...stand down..')
        res.send(401);
    }
})

//delete an item
router.delete('/:id', function(req, res) {
    if (req.user) {
        landmark.findOne(req.params.id, function(err, item) {
            if (err) {
                return handleError(res, err);
            }
            if (!item) {
                return res.send(404);
            }

            if (req.user._id == result.ownerMongoId) {
                //Delete entry
                item.remove(function(err) {
                    if (err) {
                        console.log(err)
                        return res.send(500);
                    }
                    res.sendStatus(200);
                    console.log('deleted!')
                })
            } else {
                console.log('you are not authorized...stand down..')
                res.send(401);
            }

        })
    } else {
        console.log('you are not authorized...stand down..')
        res.send(401);
    }
})

module.exports = router;