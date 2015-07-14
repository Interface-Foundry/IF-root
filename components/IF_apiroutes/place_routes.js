'use strict';

var express = require('express'),
    router = express.Router(),
    landmark = require('../IF_schemas/landmark_schema.js'),
    _ = require('underscore'),
    shapefile = require('shapefile'),
    request = require('request')

var googleAPI = 'AIzaSyAj29IMUyzEABSTkMbAGE-0Rh7B39PVNz4';


//Get place given an item ID
router.get('/:id', function(req, res) {

    landmark.findOne(req.params.id, function(err, place) {
        if (err) console.log(err);
        if (!place) return res.send(440);
        res.send(place);
    });
})

//Return closest 5 places for nearest bubble suggestions
router.post('/nearest', function(req, res) {
    var loc = {
        type: 'Point',
        coordinates: []
    };
    loc.coordinates.push(parseFloat(req.body.lat));
    loc.coordinates.push(parseFloat(req.body.lon));
    var query = {
        'source_google.place_id':{$exists:true},
        spherical: true,
        limit: 5
    };
    landmark.geoNear(loc,query, function(err, places) {
        if (err) console.log(err);
        if (!places) return res.send(440);
        res.send(places);
    });
})


module.exports = router;
