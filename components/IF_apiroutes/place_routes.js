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
    uniquer = require('../../IF_services/uniquer')

var googleAPI = 'AIzaSyAj29IMUyzEABSTkMbAGE-0Rh7B39PVNz4';


//Get place given an item ID
router.get('/:id', function(req, res) {

    db.Landmark.findOne(req.params.id, function(err, place) {
        if (err) console.log(err);
        if (!place) return res.send(440);
        res.send(place);
    });
})

//Create a new place
router.post('/', function(req, res) {
    var newPlace = new db.Landmark();
    newPlace.world = true;
    newPlace.newStatus = true;
    newPlace.parentID = '';
    newPlace.hasloc = true;
    newPlace.valid = true;
    newPlace.views = 0;
    newPlace.hasTime = false;
    newPlace.resources = {
        hashtag: ''
    };
    newPlace.permissions = {
        ownerID: '553e5480a4bdda8c18c1edbc',
        hidden: false
    };
    newPlace.time.created = new Date()
    newPlace.world_id = '';
    newPlace.widgets = forumStyle.widgets;
    newPlace.source_google.place_id = req.body.place_id;
    newPlace.loc.coordinates[0] = parseFloat(req.body.geometry.location.lng);
    newPlace.loc.coordinates[1] = parseFloat(req.body.geometry.location.lat);
    newPlace.loc.type = 'Point';
    newPlace.tags = [];
    newPlace.tags.push('clothing');
    newPlace.category = {
        name: 'place',
        avatar: '',
        hiddenPresent: false
    }

    //ADDRESS
    if (typeof req.body.address_components == 'undefined') {
        newPlace.source_google.address = ''
    } else {
        var addy = ''
        newPlace.source_google.address = req.body.address_components.forEach(function(el) {
            addy = addy + ' ' + el.long_name;
        })
        newPlace.source_google.address = addy.trim()
    }

    //NAME
    if (typeof req.body.name == 'undefined') {
        newPlace.name = req.body.vicinity;
    } else {
        newPlace.name = req.body.name
        var nameTag = urlify(req.body.name).split('_')
        nameTag.forEach(function(tag) {
            newPlace.tags.push(tag)
        })
    }
    //TYPE
    if (typeof req.body.types == 'undefined') {
        newPlace.source_google.types = "";
        newPlace.type = 'clothing_store';
    } else {
        newPlace.source_google.types = req.body.types;
        newPlace.type = req.body.types[0];
    }

    //PHONE
    if (typeof req.body.international_phone_number == 'undefined') {
        newPlace.source_google.international_phone_number = "";
    } else {
        newPlace.source_google.international_phone_number = req.body.international_phone_number;
    }
    //OPENING HOURS
    if (typeof req.body.opening_hours == 'undefined') {
        newPlace.source_google.opening_hours = "";
    } else {
        newPlace.source_google.opening_hours = req.body.opening_hours.weekday_text;
    }
    //WEBSITE
    if (typeof req.body.website == 'undefined') {
        newPlace.source_google.website = "";
    } else {
        newPlace.source_google.website = req.body.website;
    }
    //URL
    if (typeof req.body.url == 'undefined') {
        newPlace.source_google.url = "";
    } else {
        newPlace.source_google.url = req.body.url;
    }
    //PRICE
    if (typeof req.body.price_level == 'undefined') {
        newPlace.source_google.price_level = null;
    } else {
        newPlace.source_google.price_level = req.body.price_level
    }
    //ICON
    if (typeof req.body.icon == 'undefined') {
        newPlace.source_google.icon = "";
    } else {
        newPlace.source_google.icon = req.body.icon;
    }

    uniquer.uniqueId(req.body.name, 'Landmark').then(function(output) {
        newPlace.id = output;
        // console.log('OUTPUT: ',output)
        newPlace.save(function(err, saved) {
            if (err) {
                console.log('!!', err)
            }
            console.log('Saved!', saved)
            saveStyle(newPlace)
            res.send(saved)
        })
    })




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


//loading style from JSON, saving
function saveStyle(place) {
    var deferred = q.defer();
    var st = new db.Style()
    st.name = forumStyle.name;
    st.bodyBG_color = forumStyle.bodyBG_color;
    st.titleBG_color = forumStyle.titleBG_color;
    st.navBG_color = forumStyle.navBG_color;
    st.landmarkTitle_color = forumStyle.landmarkTitle_color;
    st.categoryTitle_color = forumStyle.categoryTitle_color;
    st.widgets.twitter = forumStyle.widgets.twitter;
    st.widgets.instagram = forumStyle.widgets.instagram;
    st.widgets.upcoming = forumStyle.widgets.upcoming;
    st.widgets.category = forumStyle.widgets.category;
    st.widgets.messages = forumStyle.widgets.messages;
    st.widgets.streetview = forumStyle.widgets.streetview;
    st.widgets.nearby = forumStyle.widgets.nearby;
    st.save(function(err, style) {
        if (err) console.log(err);
        place.style.styleID = style._id;
        place.style.maps.cloudMapID = cloudMapID;
        place.style.maps.cloudMapName = cloudMapName;
        deferred.resolve();
    })
    return deferred.promise;
}



module.exports = router;