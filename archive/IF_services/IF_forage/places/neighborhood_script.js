var areas = require('./areas.js')
var async = require('async')
var db = require('db');
var q = require('q')
var request = require('request')

db.Zipcode.find({},
    function(err, zips) {
        if (err) {
            console.log(err)
            callback(err)
        } else if (zips.length < 1) {
            console.log('No results')
            callback(null)
        } else {
            console.log('found!', zips.length)
            async.eachSeries(zips, function(zip, callback) {

                    var lon = parseFloat(zip.loc.toString().split(',')[0].split('[')[1])
                    var lat = parseFloat(zip.loc.toString().split(',')[1].split(']')[0])
                    var temp = {
                        type: 'Point',
                        coordinates: [lon, lat]
                    }
                    areaFind(temp).then(function(place) {
                        if (place == undefined) {
                            console.log('no area')
                        } else {
                            console.log('area: ',place.area)
                            zip.neighborhood = place.area
                        }
                        db.Zipcode.update({
                                zipcode: zip.zipcode
                            }, {
                                $unset: {
                                    loc: 1
                                }
                            },
                            function(err, data) {
                                if (err) callback(err)
                                // console.log('new zip: ', zip)
                                zip.loc = temp;
                                zip.save(function(err, result) {
                                    if (err) callback(err)
                                    console.log('SAVED!!', result)
                                    callback(null)
                                })
                            })
                    })
                },
                function done(err) {
                    if (err) {
                        // One of the iterations produced an error.
                        // All processing will now stop.
                        console.log('A file failed to process', err);
                    } else {
                        console.log('All files have been processed successfully');
                    }
                });

        }
    });


function areaFind(place) {
    var deferred = q.defer();
    //Get neighborhood name based on coordinates
    var options = {
        method: 'GET'
    }
    request('http://localhost:9998/findArea?lat=' + place.coordinates[1] + '&lon=' + place.coordinates[0], options, function(error, response, body) {
        if (!error && response.statusCode == 200 && body !== undefined) {
            var data = JSON.parse(body)
            deferred.resolve(data)
        } else {
            // console.log('Area find returned no results.')
            deferred.resolve(data)
        }
    })
    return deferred.promise;
}