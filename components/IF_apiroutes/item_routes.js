'use strict';


/*
POST /api/items/search
{
    text: "something tag la",
    colors: ['FF00FF', 'FF00FF'],
    categories: ['shoes'],
    price: 1, // or 2, 3, or 4
    radius: .5, // miles
    loc: {lat: 34, lon: -77}
}

Response:
{
    results: [],
    query: {
        text: "something tag la",
        colors: ['FF00FF', 'FF00FF'],
        categories: ['shoes'],
        price: 1, // or 2, 3, or 4
        radius: .5, // miles
        loc: {lat: 34, lon: -77}
    },
    links: {
        self: 'api/items/search'
        next: 'api/items/search?page=2&count=50',
        last: null
    }
}


POST /api/items/trending
{
    loc: {lat: 34, lon: -77}
}

Response:
{
    results: [
        { category: 'Trending in SoHo', results: []},
        { category: 'Trending Halloween Costumes', results: []},
    },

    links: {
        self: 
        next: 'api/items/trending?lat=.......page=2&count=50',
        last: 
    }
}


*/

var express = require('express'),
    router = express.Router(),
    landmarkSchema = require('../IF_schemas/landmark_schema.js'),
    _ = require('underscore'),
    shapefile = require('shapefile')

var googleAPI = 'AIzaSyAj29IMUyzEABSTkMbAGE-0Rh7B39PVNz4';

router.use(function(req, res, next) {
    if (req.query.number || req.query.tags) {
        next();
    }
});

//Trending - lat/lng
router.get('/', function(req, res) {
    console.log('-_-')
    // req.query.lat;
    // req.query.lng;
    // req.query.skip;
    var loc = {
        type: 'Point',
        coordinates: []
    };
    loc.coordinates.push(req.query.lat);
    loc.coordinates.push(req.query.lng);

    //Get neighborhood name based on coordinates
    shapefile.read('../../IF_services/areas/ZillowNeighborhoods-NY.shp', function(err, area){
        console.log('Shapefile: ',area)
        // if (req.query.lng > area.bbox[1] && req.query.lng )
    })


    var query = {
        spherical: true,
        maxDistance: 1 / 111.12, //1km radius
        skip: parseInt(req.query.skip),
        sort: {
            like_count: -1
        },
        limit: 20,
    };
    landmark.geoNear(loc, query, function(err, items) {
        if (err) console.log(err);
        if (!items) return res.send(440);
        res.send(items);
    });
})

//Get item given an item ID
router.get('/:id', function(req, res) {
    // req.query.skip;
    var query = {
        skip: parseInt(req.query.skip),
        limit: 20,
    };
    landmark.findOne(req.params.id, query, function(err, item) {
        if (err) console.log(err);
        if (!item) return res.send(440);
        res.send(item);
    });
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
            //Merge existing announcement with updated object from frontend
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