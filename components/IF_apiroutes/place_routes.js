'use strict';

var express = require('express'),
    router = express.Router(),
    db = require('db'),
    _ = require('underscore'),
    shapefile = require('shapefile'),
    request = require('request'),
    urlify = require('urlify').create({
        addEToUmlauts: true,
        szToSs: true,
        spaces: "_",
        nonPrintable: "",
        trim: true
    }),
    q = require('q'),
    forumStyle = require('../../IF_services/IF_forage/places/forum_theme.json'),
    uniquer = require('../../IF_services/uniquer');


//Get place given an item ID
router.get('/:id', function(req, res) {

    db.Landmark.findOne(req.params.id, function(err, place) {
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
    db.Landmarks.aggregate(
        [{
            "$geoNear": {
                "near": loc,
                "spherical": true,
                "distanceField": "dis"
            }
        }, {
            "$match": {
                "source_google.place_id": {
                    "$exists": true
                }
            }
        }, {

            "$limit": 10

        }],
        function(err, places) {
            if (err) console.log(err);
            if (!places) return res.send(440);
            res.send(places);
        });
})





module.exports = router;