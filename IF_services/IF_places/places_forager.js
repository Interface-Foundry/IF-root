var express = require('express'),
    app = module.exports.app = express();
var request = require('request');
var logger = require('morgan');
var async = require('async');
var fs = require('fs');
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


var request = require('request');
var cloudMapName = 'forum';
var cloudMapID = 'interfacefoundry.jh58g2al';
var googleAPI = 'AIzaSyAj29IMUyzEABSTkMbAGE-0Rh7B39PVNz4';
var awsBucket = "if.forage.google.images";
var zipLow = 10001;
var zipHigh = 99950;
var requestNum = 0;
var offsetCounter = 0; //offset, increases by multiples of 20 until it reaches 600

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
                console.log('Searching zipcode: ', zipCodeQuery)
                var coords = getLatLong(zipCodeQuery).then(function(coords) {
                    searchPlaces(coords, function() {
                        count++;
                        setTimeout(callback, 4000); // Wait before going on to the next zip
                    })
                });
            },
            function(err) {
                setTimeout(callback, 10000); // Wait before looping over the zip again
            }
        );
    },
    function(err) {
        console.log('Requested ', requestNum, ' times.')
            //iterating over offset to get all the yelps
        if (offsetCounter >= 60) {

            //reset offset
            offsetCounter = 0;

        } else {
            //incrementing until 60
            offsetCounter = offsetCounter + 20;
        }

        setTimeout(callback, 10000); // Wait before looping over the zip again

    }
);


//searches google places
function searchPlaces(coords, fin) {
    //****Radar search places for max 200 results and get place_ids
    radarSearch(coords[0], coords[1]).then(function(results) {
            // if (results.length > 20) {
            //     //Limit result set for testing purposes
            //     results = results.slice(0, 19)
            //         // console.log('Got results!', results.length)
            // }
            async.each(results, function(place, done) {
                        var newPlace = null;
                        async.series([
                                //First check if landmark exists, if not create a new one
                                function(callback) {
                                    //Check if place already exists in db, if not create new place
                                    landmarks.find({
                                        'source_google.place_id': place.place_id
                                    }, function(err, matches) {
                                        if (err) console.log(err)
                                        if (matches.length < 1) {
                                            newPlace = new landmarks();
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
                                            newPlace.time = new Date()
                                            newPlace.world_id = '';
                                            newPlace.widgets = forumStyle.widgets;
                                            newPlace.source_google.place_id = place.place_id;
                                            newPlace.loc.coordinates[0] = parseFloat(place.geometry.location.lng);
                                            newPlace.loc.coordinates[1] = parseFloat(place.geometry.location.lat);
                                            newPlace.loc.type = 'Point';
                                            saveStyle(newPlace).then(function() { //creating new style to add to landmark
                                                callback(null)
                                            });
                                        } else {
                                            // console.log('Matches exist, next place..')
                                            callback(null)
                                        }
                                    })
                                },
                                //Now fill in the details of the place
                                function(callback) {

                                    if (newPlace == null) {
                                        // console.log('Not a new place')
                                        callback(null);
                                    } else {
                                        wait(function() {
                                            // console.log('Waiting..')
                                            addGoogleDetails(newPlace).then(function(place) {
                                                //Add city name to landmark id and then uniqueize it
                                                uniqueID(place.name, newPlace.source_google.city).then(function(output) {
                                                    // console.log('output: ', output)
                                                    newPlace.id = output;
                                                    callback(null);
                                                })
                                            })
                                        }, 200);
                                    }
                                },
                                function(callback) {
                                    //Annnd save the place
                                    if (!newPlace) {
                                        callback(null)
                                    } else {
                                        newPlace.save(function(err, saved) {
                                            if (err) console.log(err)
                                                // console.log('Saved: ', newPlace.id)
                                            callback(null)
                                        })
                                    }
                                }
                            ],
                            //final callback in series
                            function(err, results) {
                                done()
                            }); //END OF ASYNC SERIES
                    },
                    function() {
                        console.log('Finished set, next set..');
                        console.log('Requested ', requestNum, ' times.');
                        fin()
                    }) //END OF ASYNC EACH
        },
        function(err) {
            console.log('No radar results, err: ', err)
            fin()
        })
}

function radarSearch(lat, lng) {
    var deferred = q.defer();
    var radius = 50000,
        types = 'clothing_store',
        key = googleAPI,
        location = lng + ',' + lat
    var url = "https://maps.googleapis.com/maps/api/place/radarsearch/json?radius=" + radius + '&types=' + types + '&location=' + location + '&key=' + googleAPI
    console.log('Radar searching..')
    request({
        uri: url,
        json: true
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            requestNum++;
            var resultsValid = ((!error) && (response.statusCode == 200) && (body.results.length >= 1));
            if (resultsValid) {
                //Add results to previous results
                // console.log('request results: ', body)
                deferred.resolve(body.results);

            } else {
                if (error) console.log(error)
                console.log("no valid results", error);
                deferred.reject();
            }
        } else {
            console.log('Radar Search request error: ', error)
        }
    })
    return deferred.promise;
}


function addGoogleDetails(newPlace) {
    var deferred = q.defer();
    var url = "https://maps.googleapis.com/maps/api/place/details/json?placeid=" + newPlace.source_google.place_id + "&key=" + googleAPI;
    console.log('Retreiving details..')
    request({
        uri: url,
        json: true
    }, function(error, response, body) {
        requestNum++;

        if (!error && response.statusCode == 200) {
            // console.log('Details Success.')
            if (typeof body.result.name == 'undefined') {
                newPlace.name = body.result.vicinity;;
            } else {
                newPlace.name = body.result.name
            }
            if (typeof body.result.address_components == 'undefined') {
                newPlace.source_google.city = ''
            } else {
                if (body.result.address_components[2].long_name == 'united_states') {
                    newPlace.source_google.city == body.result.address_components[3].long_name
                } else {
                    newPlace.source_google.city = body.result.address_components[2].long_name
                }
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
            newPlace.category = {
                name: 'place',
                avatar: '',
                hiddenPresent: false
            }
            newPlace.source_google.utc_offset = body.result.utc_offset;
            newPlace.source_google.address = body.result.vicinity;

            deferred.resolve(newPlace)
        } else {
            console.log("Details query FAIL", error);
            deferred.reject(error)
        }
    });
    return deferred.promise;
}

function getLatLong(zipcode, callback) {
    var deferred = q.defer();
    var string = 'http://api.tiles.mapbox.com/v4/geocode/mapbox.places-v1/';
    string = string + '+' + zipcode;
    string = string + '.json?access_token=pk.eyJ1IjoiaW50ZXJmYWNlZm91bmRyeSIsImEiOiItT0hjYWhFIn0.2X-suVcqtq06xxGSwygCxw';
    request({
            uri: string
        },
        function(error, response, body) {
            var parseTest = JSON.parse(body);
            if (parseTest.features && parseTest.features.length) {
                if (parseTest.features[0]) {
                    var results = JSON.parse(body).features[0].center;
                    results[0].toString();
                    results[1].toString();
                    deferred.resolve(results)
                }
            }
        });
    return deferred.promise
}




function uniqueID(name, city) {
    var deferred = q.defer();
    var name = urlify(name)
    var city = urlify(city)
    var nameCity = name.concat('_' + city)
    var unique = nameCity.toLowerCase();
    // console.log('unique: ', unique)
    urlify(unique, function() {
        landmarks.find({
            'id': unique
        }, function(err, data) {
            if (err) console.log('Match finding err, ', err)
            if (data.length > 0) {
                // console.log('id already exists: ', data[0].id)
                var uniqueNumber = 1;
                var newUnique
                async.forever(function(next) {
                        var uniqueNum_string = uniqueNumber.toString();
                        newUnique = data[0].id + uniqueNum_string;
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
                        // console.log('A: ',newUnique)
                        deferred.resolve(newUnique)
                    });
            } else {
                // console.log(unique+' is already unique')
                deferred.resolve(unique)
            }
        });
    });
    // console.log('uniqueID end', deferred.promise)
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

function wait(callback, delay) {
    var startTime = new Date().getTime();
    while (new Date().getTime() < startTime + delay);
    callback();
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