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
    nonPrintable: "_",
    trim: true
});


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
                // console.log('Saving place: ', place)
                landmarks.find({
                    'id': place.id
                }, function(err, matches) {
                    if (err) console.log(err)
                    if (matches.length < 1) {
                        console.log('Creating landmark!')
                        var newPlace = new landmarks();
                        newPlace.name = place.name;
                        newPlace.id = place.id;
                        newPlace.source_google.place_id = place.place_id;
                        newPlace.source_google.types = place.types;
                        newPlace.source_google.reference = place.reference;
                        newPlace.loc.coordinates[0] = place.geometry.location.lat;
                        newPlace.loc.coordinates[1] = place.geometry.location.lng;
                        newPlace.loc.type = 'Point';
                        uniqueID(place.id, function(output) {
                            newPlace.ud = output;
                            newPlace.save(function(saved) {
                                console.log('Save Google Place!', saved)
                                done()
                            })
                        })
                    } else {
                        console.log('Matches exist, next place..')
                        done()
                    }

                })
            }, function() {
                console.log('Finished set, next set..')
                fin()
            })
        } else {
            console.log("no valid results returned from queryGooglePlaceID for", type, zip);
        }
    });
}


function uniqueID(input, callback) {

    var uniqueIDer = urlify(input);
    urlify(uniqueIDer, function() {
        db.collection('users').findOne({
            'profileID': uniqueIDer
        }, function(err, data) {
            if (data) {
                var uniqueNumber = 1;
                var newUnique;

                async.forever(function(next) {
                        var uniqueNum_string = uniqueNumber.toString();
                        newUnique = data.profileID + uniqueNum_string;

                        db.collection('users').findOne({
                            'profileID': newUnique
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
                        callback(newUnique);
                    });
            } else {
                callback(uniqueIDer);
            }
        });
    });
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