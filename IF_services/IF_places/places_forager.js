//ARGUMENTS

//Radius (Default 800)
var radius = process.argv[2] ? process.argv[2] : 800
//Starting zipcode (default 10001)
var zipLow = process.argv[3] ? process.argv[3] : 10001
//Ending zipcode
var zipHigh = process.argv[4] ? process.argv[4] : 11692

//TODO:
// Increase RADIUS for NON CITIES


var express = require('express'),
    app = module.exports.app = express(),
    request = require('request'),
    logger = require('morgan'),
    async = require('async'),
    fs = require('fs'),
    urlify = require('urlify').create({
        addEToUmlauts: true,
        szToSs: true,
        spaces: "_",
        nonPrintable: "",
        trim: true
    }),
    q = require('q'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    monguurl = require('monguurl');


//Default Place style
var forumStyle = require('./forum_theme.json');
var cloudMapName = 'forum';
var cloudMapID = 'interfacefoundry.jh58g2al';

app.use(logger('dev'));



app.use(bodyParser.json({
    extended: true
})); // get information from html forms



//----MONGOOOSE----//
var landmarks = require('../../components/IF_schemas/landmark_schema.js');
var styles = require('../../components/IF_schemas/style_schema.js');
var geozip = require('../../components/IF_schemas/geozip_schema.js');

global.config = require('../../config');

mongoose.connect(global.config.mongodb.url);
var db_mongoose = mongoose.connection;
db_mongoose.on('error', console.error.bind(console, 'connection error:'));


var request = require('request');
var cloudMapName = 'forum';
var cloudMapID = 'interfacefoundry.jh58g2al';
var googleAPI = 'AIzaSyAj29IMUyzEABSTkMbAGE-0Rh7B39PVNz4';
var awsBucket = "if.forage.google.images";
// var zipHigh = 99950;
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
                console.log('Searching zipcode: ', zipCodeQuery, ' with radius: ', radius)
                var coords = getLatLong(zipCodeQuery).then(function(coords) {
                    searchPlaces(coords, zipCodeQuery, function() {
                        count++;
                        wait(callback, 500); // Wait before going on to the next zip
                    })
                }, function(err) {
                    // console.log('ERROR: Could not get lat long for: ' + zipCodeQuery+err)
                    count++;
                    callback()
                });
            },
            function(err) {
                wait(callback, 10000); // Wait before looping over the zip again
            }
        );
    },
    function(err) {
        console.log('Requested ', requestNum, ' times.')
            //iterating over offset to get all the yelps
        wait(callback, 10000); // Wait before looping over ALL zip codes
    }
);


//searches google places
function searchPlaces(coords, zipcode, fin) {
    //Radar search places for max 200 results and get place_ids
    radarSearch(coords[0], coords[1], zipcode).then(function(results) {
            // if (results.length > 20) {
            //     //Limit result set for testing purposes
            //     results = results.slice(0, 19)
            //         // console.log('Got results!', results.length)
            // }
            var saveCount = 0
            async.eachSeries(results, function(place, done) {

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
                                            // console.log('No match found for ', place.place_id)
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
                                            newPlace.time.created = new Date()
                                            newPlace.world_id = '';
                                            newPlace.widgets = forumStyle.widgets;
                                            newPlace.source_google.place_id = place.place_id;
                                            newPlace.loc.coordinates[0] = parseFloat(place.geometry.location.lng);
                                            newPlace.loc.coordinates[1] = parseFloat(place.geometry.location.lat);
                                            newPlace.loc.type = 'Point';
                                            newPlace.tags = [];
                                            newPlace.tags.push('clothing');
                                            newPlace.category = {
                                                name: 'place',
                                                avatar: '',
                                                hiddenPresent: false
                                            }
                                            saveStyle(newPlace).then(function() { //creating new style to add to landmark
                                                // console.log('newPlace: ',newPlace)
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
                                    // console.log('Next callback')
                                    if (newPlace == null) {
                                        // console.log('Not a new place')
                                        callback(null);
                                    } else {
                                        wait(function() {
                                            // console.log('New Place')
                                            var rcount = 1;
                                            // console.log('Requesting details')
                                            addGoogleDetails(newPlace).then(function(place) {
                                                callback(null);
                                            }, function(err) {
                                                console.log('Details ERROR', err)
                                                callback(null);
                                            })
                                        }, 30);
                                    }
                                },
                                function(callback) {
                                    //Find neighborhood and city name via python area finder server
                                    if (newPlace == null) {
                                        // console.log('Not a new place')
                                        callback(null);
                                    } else {
                                        areaFind(newPlace).then(function(place) {
                                            var input = ''
                                                //Add neighborhood or city name to landmark id and then uniqueize it
                                            if (place.source_google.city !== undefined) {
                                                 // console.log('-City')
                                                input = place.source_google.city;
                                            } 
                                            else if (place.source_google.neighborhood !== undefined) {
                                                // console.log('-Neighborhood')
                                                input = place.source_google.neighborhood 
                                            } else {
                                                input = place.backupinput;
                                                // console.log('-Backup Input',place.backupinput)
                                            }

                                            // console.log('INPUT: ', input)
                                            uniqueID(place.name, input).then(function(output) {
                                                // console.log('OUTPUT: ', output)
                                                newPlace.id = output;
                                                callback(null);
                                            })
                                        }, function(err) {
                                            console.log('areaFind ERROR', err)
                                            callback(null);
                                        })
                                    }
                                },
                                function(callback) {
                                    //Annnd save the place
                                    if (!newPlace) {
                                        callback(null)
                                    } else {
                                        console.log('Saved ', newPlace.id)
                                        saveCount++;
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
                        console.log('Finished..created ' + saveCount + ' new stores for zipcode: ', zipcode)
                        console.log('Requested ', requestNum, ' times.');
                        fin()
                    }) //END OF ASYNC EACH
        },
        function(err) {
            console.log('No radar results, err: ', err)
            fin()
        })
}

function radarSearch(lat, lng, zipcode) {
    var deferred = q.defer();
    var types = 'clothing_store',
        key = googleAPI,
        location = lng + ',' + lat
    var url = "https://maps.googleapis.com/maps/api/place/radarsearch/json?radius=" + radius + '&types=' + types + '&location=' + location + '&key=' + googleAPI
    console.log('Radar searching..')
    request({
        uri: url,
        json: true
    }, function(error, response, body) {
        if ((!error) && (response.statusCode == 200) && (body.results.length >= 1)) {
            requestNum++;
            console.log('Radar search success: ', body.results.length)
            var logData = 'For radius: '+radius+', zipcode: '+zipcode+' , results: '+body.results.length+'.'
            //Write results to local log file.
            // fs.open('./log.md', 'w', function(err,fd) {
                fs.appendFile('log.md', logData, function(err) {
                    if (err) throw err;
                    console.log('The "data to append" was appended to file!');
                });
            // })
            deferred.resolve(body.results);
        } else {
            console.log('Radar Search request error: ', error)
            deferred.reject();
        }
    })
    return deferred.promise;
}


function addGoogleDetails(newPlace) {
    var deferred = q.defer();
    var url = "https://maps.googleapis.com/maps/api/place/details/json?placeid=" + newPlace.source_google.place_id + "&key=" + googleAPI;
    request({
        uri: url,
        json: true
    }, function(error, response, body) {
        requestNum++;

        if (!error && response.statusCode == 200 && body.result) {

            //ADDRESS
            if (typeof body.result.address_components == 'undefined') {
                newPlace.source_google.address = ''
            } else {
                var addy = ''
                newPlace.source_google.address = body.result.address_components.forEach(function(el) {
                    addy = addy + ' ' + el.long_name;
                })
                newPlace.source_google.address = addy.trim()
                    // console.log('ADDRESS:', newPlace.source_google.address )
            }


            //NAME
            if (typeof body.result.name == 'undefined') {
                newPlace.name = body.result.vicinity;
            } else {
                newPlace.name = body.result.name
                var nameTag = urlify(body.result.name).split('_')
                nameTag.forEach(function(tag) {
                    newPlace.tags.push(tag)
                })
            }
            //TYPE
            if (typeof body.result.types == 'undefined') {
                newPlace.source_google.types = "";
                newPlace.type = 'clothing_store';
            } else {
                newPlace.source_google.types = body.result.types;
                newPlace.type = body.result.types[0];
            }

            //PHONE
            if (typeof body.result.international_phone_number == 'undefined') {
                newPlace.source_google.international_phone_number = "";
            } else {
                newPlace.source_google.international_phone_number = body.result.international_phone_number;
            }
            //OPENING HOURS
            if (typeof body.result.opening_hours == 'undefined') {
                newPlace.source_google.opening_hours = "";
            } else {
                // console.log(body.result.opening_hours.weekday_text)
                newPlace.source_google.opening_hours = body.result.opening_hours.weekday_text;
                //Open now would need to be calculated on front-end
                // newPlace.source_google.open_now = body.result.opening_hours.open_now;
            }
            //WEBSITE
            if (typeof body.result.website == 'undefined') {
                newPlace.source_google.website = "";
            } else {
                newPlace.source_google.website = body.result.website;
            }
            //URL
            if (typeof body.result.url == 'undefined') {
                newPlace.source_google.url = "";
            } else {
                newPlace.source_google.url = body.result.url;
            }
            //PRICE
            if (typeof body.result.price_level == 'undefined') {
                newPlace.source_google.price_level = null;
            } else {
                newPlace.source_google.price_level = body.result.price_level
            }
            //ICON
            if (typeof body.result.icon == 'undefined') {
                newPlace.source_google.icon = "";
            } else {
                newPlace.source_google.icon = body.result.icon;
            }

            //BACKUP INPUT
            //This is the backup input to uniqueize ID in case areaFind does not return neighborhood and city
            if (typeof body.result.address_components == 'undefined') {
                newPlace.backupinput = ''
            } else if (body.result.address_components[2] && body.result.address_components[2].long_name.toLowerCase().indexOf('united states') < 1) {
                newPlace.backupinput = body.result.address_components[2].long_name
            } else if (body.result.address_components[1] && body.result.address_components[1].long_name.toLowerCase().indexOf('united states') < 1) {
                newPlace.backupinput = body.result.address_components[1].long_name
            } else if (body.result.address_components[0] && body.result.address_components[0].long_name.toLowerCase().indexOf('united states') < 1) {
                newPlace.backupinput = body.result.address_components[0].long_name
            } else {
                newPlace.backupinput = ''
            }
            // console.log('newPlace.backupinput: ',newPlace.backupinput)

            deferred.resolve(newPlace)
        } else {
            console.log("Details query FAIL", error, response.statusCode);
            deferred.reject(error)
        }
    });
    return deferred.promise;
}

function getLatLong(zipcode, callback) {
    var deferred = q.defer();
    //Check if geozip exists in DB 
    geozip.findOne({
        valid: true,
        zipcode: zipcode
    }, function(err, result) {
        if (err) console.log(err)
        if (result && result.coords) {
            // console.log('!!!Geozip already exists in db.')
            console.log('Coordinates for zipcode: ' + zipcode + ' : ', result.coords)
            deferred.resolve(result.coords)
        } else {
            console.log('querying mapbox.')
            var string = 'http://api.tiles.mapbox.com/v4/geocode/mapbox.places-v1/';
            string = string + '+' + zipcode;
            string = string + '.json?access_token=pk.eyJ1IjoiaW50ZXJmYWNlZm91bmRyeSIsImEiOiItT0hjYWhFIn0.2X-suVcqtq06xxGSwygCxw';
            request({
                    uri: string
                },
                function(error, response, body) {
                    if (!error && response.statusCode == 200) {
                        var parseTest = JSON.parse(body);
                        if (parseTest.features[0] && parseTest.features[0].center.length > 1) {
                            if (parseTest.features.length >= 1) {
                                var results = JSON.parse(body).features[0].center;
                                results[0].toString();
                                results[1].toString();
                                console.log('Saving coords to db.')
                                var newCoords = new geozip();
                                newCoords.coords = results;
                                newCoords.zipcode = zipcode;
                                newCoords.valid = true;
                                newCoords.save(function(err, saved) {
                                    if (err) console.log(err)
                                    console.log('geozip saved!')
                                })
                                console.log('Coordinates for zipcode: ' + zipcode + ' : ', results)
                                deferred.resolve(results)
                            }
                        } else {
                            var errCoords = new geozip();
                            errCoords.zipcode = zipcode;
                            errCoords.valid = false
                            errCoords.save(function(err, saved) {

                            })
                            console.log('ERROR for ', zipcode)
                            deferred.reject()
                        }
                    } else {
                        var errCoords = new geozip();
                        errCoords.zipcode = zipcode;
                        errCoords.valid = false
                        errCoords.save(function(err, saved) {})
                        console.log('ERROR for ', zipcode)
                        deferred.reject()
                        console.log('ERROR for ')
                        deferred.reject(error)
                    }
                });
        } //end of else
    })
    return deferred.promise
}

function areaFind(place) {
    var deferred = q.defer();
    //Get neighborhood name based on coordinates
    var options = {
        method: 'GET'
    }
    // console.log('areaFind: place.loc',place.loc)
    request('http://localhost:9998/findArea?lat=' + place.loc.coordinates[1] + '&lon=' + place.loc.coordinates[0], options, function(error, response, body) {
        if (!error && response.statusCode == 200 && body !== undefined) {
            var data = JSON.parse(body)
            place.source_google.neighborhood = data.area.trim();
            place.source_google.city = data.city.trim();
            deferred.resolve(place)
        } else {
            console.log('Area find returned no results.')
            deferred.resolve(place)
        }
    })
    return deferred.promise;
}



function uniqueID(name, city) {
    var deferred = q.defer();
    var name = urlify(name)
    if (city == '') {
        var city = Math.floor(Math.random() * 6) + 1
        city = city.toString();
    } else {
        var city = urlify(city)
    }

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