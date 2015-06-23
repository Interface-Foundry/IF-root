'use strict';

var express = require('express'),
    router = express.Router(),
    landmark = require('../IF_schemas/landmark_schema.js'),
    _ = require('underscore'),
    shapefile = require('shapefile'),
    request = require('request'),
    redisClient = require('../../redis.js');

var googleAPI = 'AIzaSyAj29IMUyzEABSTkMbAGE-0Rh7B39PVNz4';

//Trending - lat/lng
router.post('/trending', function(req, res) {

    var loc = {
        type: 'Point',
        coordinates: []
    };

    loc.coordinates.push(parseFloat(req.body.lat));
    loc.coordinates.push(parseFloat(req.body.lon));

    //Get neighborhood name based on coordinates
    var options = {
        method: 'GET'
    }

    request('http://localhost:9998/findArea?lat=' + loc.coordinates[0] + '&lon=' + loc.coordinates[1], options, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log('req.body: ', req.body)
            var area = JSON.parse(body)

            var response = {
                results: [],
                links: {
                    self: 'api/items/trending',
                    next: 'api/items/trending?page=' + req.query.page,
                    last: null
                },
                query: req.query
            }

            var skip = parseInt(req.body.page) * 20;
            var query = {
                spherical: true,
                maxDistance: 1 / 111.12, //1km radius
                skip: skip,
                sort: {
                    like_count: -1
                },
                limit: 20,
            };

            landmark.geoNear(loc, query, function(err, items) {
                if (err) console.log(err);
                if (!items) return res.send(440);

                var obj = {
                    category: 'Trending in ' + area.area,
                    results: items
                }
                response.results.push(obj)
                console.log('hitting', response)
                res.send(response);
            });
        }
    })

})

//Get item given an item ID
router.get('/:id', function(req, res) {

    landmark.findOne(req.params.id, function(err, item) {
        if (err) console.log(err);
        if (!item) return res.send(440);
        res.send(item);
    });
})

//Create a new item
router.post('/', function(req, res) {
    if (req.user.admin) {
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
                }
                redisClient.rpush('snaps', item._id, function(err, reply) {
                    console.log('item added to redis snaps queue');
                    console.log('created item is..', item)
                    res.send(item)
                });
                
            })
    } else {
        console.log('you are not authorized...stand down..')
    }
})


//Update an item
router.put('/:id', function(req, res) {
    if (req.user.admin) {
        landmark.findOne({
            id: req.params.id
        }, function(err, result) {
            if (err) {
                return handleError(res, err);
            }
            if (!result) {
                return res.send(404);
            }
            //Merge existing item with updated object from frontend
            var item = _.extend(result, req.body);
            //Save item
            item.save(
                function(err, item) {
                    if (err) {
                        console.log(err)
                    }
                    console.log('updated item is..', item)
                })
        })
    } else {
        console.log('you are not authorized...stand down..')
    }
})

//delete an item
router.delete('/:id', function(req, res) {
    if (req.user.admin) {
        landmark.findOne(req.params.id, function(err, item) {
            if (err) {
                return handleError(res, err);
            }
            if (!item) {
                return res.send(404);
            }
            //Delete entry
            item.remove(function(err) {
                if (err) {
                    console.log(err)
                }
                res.sendStatus(200);
                console.log('deleted!')
            })
        })
    } else {
        console.log('you are not authorized...stand down..')
    }
})

module.exports = router;