// https://maps.googleapis.com/maps/api/place/textsearch/json?query=cafe+New+York+food&sensor=false&location=40.67,-73.94&radius=100&key=AIzaSyAj29IMUyzEABSTkMbAGE-0Rh7B39PVNz4

var express = require('express'),
    app = module.exports.app = express();
var request = require('request');
var logger = require('morgan');
var async = require('async');
var fs = require('fs');
var http = require('http');
var im = require("imagemagick");
var crypto = require('crypto');
var AWS = require('aws-sdk');
var urlify = require('urlify').create({
    addEToUmlauts: true,
    szToSs: true,
    spaces: "_",
    nonPrintable: "",
    trim: true
});
var q = require('q');

//Default Place style
var forumStyle = require('./forum_theme.json');
var cloudMapName = 'forum';
var cloudMapID = 'interfacefoundry.jh58g2al';

app.use(logger('dev'));

var bodyParser = require('body-parser');

app.use(bodyParser.json({
    extended: true
})); // get information from html forms

var mongoose = require('mongoose'),
    monguurl = require('monguurl');

//----MONGOOOSE----//

//var styleSchema = require('../../../components/IF_schemas/style_schema.js');
// var styles = require('./style_schema.js');
var landmarks = require('../../components/IF_schemas/landmark_schema.js');
var styles = require('../../components/IF_schemas/style_schema.js');

global.config = require('../../config');

mongoose.connect(global.config.mongodb.url);
var db_mongoose = mongoose.connection;
db_mongoose.on('error', console.error.bind(console, 'connection error:'));
//---------------//
///////////
//Require Request Module for making api calls to meetup
var request = require('request');

// var forumStyle = require('./forum_theme.json');

var cloudMapName = 'forum';
var cloudMapID = 'interfacefoundry.jh58g2al';

/*
  CREATED FILE FOR AWS KEYS:

  You need to set up your AWS security credentials before the sample code is able to connect to AWS. 
  You can do this by creating a file named "credentials" at ~/.aws/ and saving the following lines in the file:

  [default]
  aws_access_key_id = <your access key id>
  aws_secret_access_key = <your secret key>

  File contents:

  [default]
  aws_access_key_id = AKIAJZ4N55EN4XBYAG2Q
  aws_secret_access_key = /lx51QZDgPdlSs/wQVJPZ5yL9sm5/4m2Rbng9EoD

*/

var googleAPI = 'AIzaSyAj29IMUyzEABSTkMbAGE-0Rh7B39PVNz4';
var awsBucket = "if.forage.google.images";
var zipLow = 1001;
var zipHigh = 99950;

// var zipLow = 92867;
// var zipHigh = 92868;

var offsetCounter = 0; //offset, increases by multiples of 20 until it reaches 600
var sortCounter = 0; //sort type, switches between 0 (best by search query), and 2, sorted by highest rating

//search places in loops
async.whilst(
    function() {
        return true
    },
    function(callback) {

        var count = zipLow;

        async.whilst(
            function() {
                return count != zipHigh;
            },
            function(callback) {

                var zipCodeQuery;
                //so number will format as zip code digit with 0 in front
                if (count < 10000) {
                    zipCodeQuery = '0' + parseInt(count);
                } else {
                    zipCodeQuery = parseInt(count);
                }
                searchPlaces('clothing store', zipCodeQuery, function() {
                    count++;
                    setTimeout(callback, 6000); // Wait before going on to the next tag
                })

            },
            function(err) {

                setTimeout(callback, 10000); // Wait before looping over the hashtags again
            }
        );
    },
    function(err) {}
);


//searches google places
function searchPlaces(type, zip, fin) {
    var queryTermsToGetPlaceID = (type + "+" + zip)
        .replace(/,/g, "")
        .replace(/\s/g, "+");
    var queryURLToGetPlaceID = "https://maps.googleapis.com/maps/api/place/textsearch/json?query=" + queryTermsToGetPlaceID + "&key=" + googleAPI;

    request({
        uri: queryURLToGetPlaceID,
        json: true
    }, function(error, response, body) {
        console.log("Queried Google PlaceID for: ", type, queryURLToGetPlaceID);
        var resultsValid = ((!error) && (response.statusCode == 200) && (body.results.length >= 1));

        if (resultsValid) {
            async.each(body.results, function(place, done) {
                var newPlace = null;
                async.series([
                        function(callback) {
                            //Check if place already exists in db, if not create new place
                            landmarks.find({
                                'source_google.place_id': place.place_id
                            }, function(err, matches) {
                                if (err) console.log(err)
                                if (matches.length < 1) {
                                    console.log('Creating Place!')
                                    newPlace = new landmarks();
                                    newPlace.name = place.name;
                                    newPlace.source_google.place_id = place.place_id;
                                    newPlace.source_google.types = place.types;
                                    newPlace.source_google.reference = place.reference;
                                    newPlace.loc.coordinates[0] = place.geometry.location.lat;
                                    newPlace.loc.coordinates[1] = place.geometry.location.lng;
                                    newPlace.loc.type = 'Point';
                                    saveStyle(newPlace).then(function() { //creating new style to add to landmark
                                        // console.log('Inside saveStyle, newPlace is: ', newPlace)
                                        callback(null)
                                    });
                                } else {
                                    console.log('Matches exist, next place..')
                                    callback(null)
                                }
                            })
                        },
                        function(callback) {
                            //Get place details from Google Places
                            if (newPlace == null) {
                                console.log('Not a new place')
                                callback(null);
                            } else {
                                addGoogleDetails(place.place_id, place.name, newPlace).then(function() {
                                    //Add city name to landmark id and then uniqueize it
                                    var nameCity = place.name.concat('_'+newPlace.source_google.city)
                                    uniqueID(nameCity).then(function(output) {
                                            newPlace.id = output;
                                            callback(null);
                                        })
                                        // console.log('Added details to newPlace, ', newPlace)

                                })
                            }
                        },
                        function(callback) {
                            //Annnd save the place
                            if (!newPlace) {
                                callback(null)
                            } else {
                                newPlace.save(function(err, saved) {
                                    if (err) console.log(err)
                                    console.log('Saved!')
                                    callback(null)
                                })
                            }
                        }
                    ],
                    // optional callback
                    function(err, results) {
                        done()
                    });
            }, function() {
                console.log('Finished set, next set..')
                fin()
            })
        } else {
            console.log("no valid results returned from queryGooglePlaceID for", type, zip);
        }
    });
}


function uniqueID(name) {
    var deferred = q.defer();
    var uniqueIDer = urlify(name);
    urlify(uniqueIDer, function() {
        landmarks.findOne({
            'id': uniqueIDer
        }, function(err, data) {
            if (data) {
                var uniqueNumber = 1;
                var newUnique;

                async.forever(function(next) {
                        var uniqueNum_string = uniqueNumber.toString();
                        newUnique = data.id + uniqueNum_string;
                        landmarks.findOne({
                            'id': newUnique
                        }, function(err, data) {
                            if (data) {
                                uniqueNumber++;
                                next();
                            } else {
                                next('unique!'); // This is where the looping is stopped
                            }
                        });
                    },
                    function() {
                        deferred.resolve(newUnique)

                    });
            } else {
                deferred.resolve(uniqueIDer)

            }
        });
    });
    return deferred.promise
}

//loading style from JSON, saving
function saveStyle(place) {
    var deferred = q.defer();
    var st = new styles()
    st.name = forumStyle.name;
    st.bodyBG_color = forumStyle.bodyBG_color;
    st.titleBG_color = forumStyle.titleBG_color;
    st.navBG_color = forumStyle.navBG_color;
    st.landmarkTitle_color = forumStyle.landmarkTitle_color;
    st.categoryTitle_color = forumStyle.categoryTitle_color;
    st.widgets.twitter = forumStyle.twitter;
    st.widgets.instagram = forumStyle.instagram;
    st.widgets.upcoming = forumStyle.upcoming;
    st.widgets.category = forumStyle.category;
    st.widgets.messages = forumStyle.messages;
    st.widgets.streetview = forumStyle.streetview;
    st.widgets.nearby = forumStyle.nearby;
    st.save(function(err, style) {
        if (err) console.log(err);
        place.style.styleID = style._id;
        place.style.maps.cloudMapID = cloudMapID;
        place.style.maps.cloudMapName = cloudMapName;
        deferred.resolve();
    })
    return deferred.promise;
}


function addGoogleDetails(placeID, name, newPlace) {
    var deferred = q.defer();
    var queryURLToGetDetails = "https://maps.googleapis.com/maps/api/place/details/json?placeid=" + placeID + "&key=" + googleAPI;

    request({
        uri: queryURLToGetDetails,
        json: true
    }, function(error, response, body) {
        // console.log("Queried Google details for", name, queryURLToGetDetails);

        if (!error && response.statusCode == 200) {
            if (typeof body.result.address_components == 'undefined') {
              newPlace.source_google.city = ''
            } else {
              // console.log('city: ',body.result.address_components[2].long_name)
              newPlace.source_google.city = body.result.address_components[2].long_name
            }

            newPlace.source_google.icon = body.result.icon;
            if (typeof body.result.opening_hours == 'undefined') {
                newPlace.source_google.opening_hours = "";
            } else {
                newPlace.source_google.opening_hours = JSON.stringify(body.result.opening_hours.weekday_text);
                newPlace.open_now = body.result.opening_hours.open_now;
            }

            if (typeof body.result.international_phone_number == 'undefined') {
                newPlace.source_google.international_phone_number = "";
            } else {
                newPlace.source_google.international_phone_number = body.result.international_phone_number;
            }
            newPlace.source_google.price_level = body.result.price_level;
            newPlace.source_google.url = body.result.url;
            if (typeof body.result.website == 'undefined') {
                newPlace.source_google.website = "";
            } else {
                newPlace.source_google.website = body.result.website;
            }
            newPlace.source_google.types = body.result.types;
            newPlace.type = body.result.types[0];
            newPlace.source_google.utc_offset = body.result.utc_offset;
            newPlace.source_google.vicinity = body.result.vicinity;
            deferred.resolve(newPlace)
        } else {
            deferred.resolve(null)
        }
    });
    return deferred.promise;
}

//server port 
app.listen(3137, 'localhost', function() {
    console.log("3137 ~ ~");
}).on('error', function(err) {
    console.log('on error handler');
    console.log(err);
});


process.on('uncaughtException', function(err) {
    console.log('process.on handler');
    console.log(err);
});