'use strict';

var express = require('express'),
    router = express.Router(),
    _ = require('lodash'),
    request = require('request'),
    redisClient = require('../../redis.js'),
    db = require('../IF_schemas/db'),
    upload = require('../../IF_services/upload'),
    uniquer = require('../../IF_services/uniquer'),
    async = require('async'),
    q = require('q'),
    urlify = require('urlify').create({
        addEToUmlauts: true,
        szToSs: true,
        spaces: "_",
        nonPrintable: "",
        trim: true
    }),
    googleAPI = 'AIzaSyAj29IMUyzEABSTkMbAGE-0Rh7B39PVNz4';

//Create a new snap
router.post('/', function(req, res, next) {
    if (!req.user) {
        return next('You must log in first');
    }
    //If no place was found for this item, create a new place.
    if (req.body.place_id) {
        console.log(1)
        //If this is a user created place
        if (req.body.place_id == 'custom_location') {
            var newPlace = new db.Landmark();
            newPlace.name = req.body.parent.name;
            newPlace.world = true;
            newPlace.hasloc = true;
            newPlace.loc.type = 'Point';
            //Might implement these properties in the future
            // newPlace.addressString = '';
            // newPlace.tel = '';
            newPlace.linkback = 'custom';
            newPlace.linkbackname = 'custom';
            console.log('req.body.parent.coordinates: ', req.body.parent.coordinates )
            newPlace.loc.coordinates = req.body.parent.coordinates
            uniquer.uniqueId(newPlace.name, 'Landmark').then(function(output) {
                newPlace.id = output;
                newPlace.save(function(e, newStore) {
                    if (e) {
                        return next('Error saving new place')
                    }
                    // console.log('Created new custom place: ', newStore)
                    createItem(req, res, newStore, next)
                })
            })


        } else {
                console.log(2)
var copybody = req.body
//console.log('req.body: -->', copybody)
            //First check if it really doesn't exist in the db yet
            db.Landmarks.findOne({
                'source_google.place_id': req.body.place_id
            }, function(err, place) {
                if (err) {
                    err.niceMessage = 'Error checking for existing place.';
                    return next(err);
                }
                if (place) {
                    console.log('Place already exists..')
                    return createItem(req, res, place, next)
                } else {
                    //TODO: Front-end needs to send coordinates in req.body.parent.coordinates
                    var newPlace = new db.Landmark();
                    newPlace.world = true;
                    newPlace.hasloc = true;
newPlace.loc.type = 'Point'
                    newPlace.source_google.place_id = req.body.place_id;
                    addGoogleDetails(newPlace, req.body.place_id).then(function(newPlace) {
                        uniquer.uniqueId(newPlace.name, 'Landmark').then(function(output) {
                            newPlace.id = output;
console.log('!!!!!!!!!!!',newPlace)                           
 newPlace.save(function(err, saved) {
                                if (err) {
                                    return next('Error saving new place')
                                }
                                createItem(req, res, newPlace, next)
                            })
                        })
                    })
                }
            })


        }


        //If place was found
    } else {
          console.log(3)
         // console.log('req.body:', req.body)
        if (req.body.parent.mongoId) {
            console.log(4)
            db.Landmarks.findById(req.body.parent.mongoId, function(err, parent) {
                if (err) {
                    err.niceMessage = 'Error checking for existing place.';
                    return next(err);
                }
                if (parent && parent.source_google.place_id) {
                    return createItem(req, res, parent, next)
                } else {
                    err.niceMessage = 'That store does not exist.';
                    return next(err);
                }
            })
        } else {
                  console.log(5)
            err.niceMessage = 'You must choose a store.';
            return next(err);
        }
    }
});


function createItem(req, res, newPlace, next) {
    var newItem = new db.Landmark();
    newItem.price = req.body.price;
    newItem.itemTags = req.body.itemTags;
    newItem.base64 = req.body.base64
    newItem.hasloc = true;
    newItem.loc.type = 'MultiPoint'
    if (newPlace) {
        newItem.loc.coordinates.push(newPlace.loc.coordinates)
        newItem.parents.push(newPlace)
    }
    if (newItem.parent.name) {
        newItem.parent = null
    }
    newItem.world = false;
    newItem.owner.mongoId = req.user._id;
    newItem.owner.profileID = req.user.profileID;
    newItem.owner.name = req.user.name;
    //Create a unique id field
    uniquer.uniqueId(newItem.owner.profileID, 'Landmarks').then(function(unique) {
        newItem.id = unique;
        console.log('base64: ',req.body.base64)
        // //Upload each image in snap to Amazon S3
        async.eachSeries(req.body.base64, function(buffer, callback) {
            upload.uploadPicture(newItem.owner.profileID, buffer).then(function(imgURL) {
                newItem.itemImageURL.push(imgURL)
                callback(null)
            }).catch(function(err) {
                if (err) {
                    err.niceMessage = 'Error uploading image';
                    return next(err);
                }
            })
        }, function(err) {
            if (err) {
                err.niceMessage = 'Error uploading one of the images.';
                return next(err);
            }
            //Save item
            newItem.save(function(err, item) {
                if (err) {
                    err.niceMessage = 'Could not save item';
                    return next(err);
                }
                //Finally send the item
                console.log('Saved new item!', item.id)
                res.send(item)
                redisClient.rpush('snaps', item._id, function(err, reply) {
                    if (err) {
                        err.niceMessage = 'Could not save item';
                        err.devMessage = 'REDIS QUEUE ERR';
                        return next(err);
                    }
                });
                // add activity for this thing
                var a = new db.Activity({
                    userIds: [req.user._id.toString()], //todo add ids for @user tags
                    landmarkIds: [item._id.toString()],
                    activityAction: 'item.post',
                    seenBy: [req.user._id.toString()],
                    data: {
                        owner: req.user.getSimpleUser(),
                        item: item.getSimpleItem()
                    }
                });
                // Increment users snapCount
                req.user.update({
                        $inc: {
                            snapCount: 1
                        }
                    }, function(err) {
                        if (err) {
                            err.niceMessage = 'Could not increment users snapCount';
                            console.log(err)
                        }
                    })
                    // add kips to the user
                req.user.update({
                    _id: req.user._id
                }, {
                    $inc: {
                        kips: 5
                    }
                }, function(err) {
                    if (err) {
                        // todo log error to ELK
                        console.error(err);
                    }
                    console.log('Kips added!', req.user.kips)
                });
                //Save Activity
                a.saveAsync().then(function() {}).catch(next);

            });
        })
    }).catch(function(err) {
        if (err) {
            err.niceMessage = 'Error uploading image';
            return next(err);
        }
    })
}


function addGoogleDetails(newPlace, place_id) {
    var deferred = q.defer();
    var url = "https://maps.googleapis.com/maps/api/place/details/json?placeid=" + place_id + "&key=" + googleAPI;
    request({
        uri: url,
        json: true
    }, function(error, response, body) {
        if (!error && response.statusCode == 200 && body.result) {
            //LOCATION
            newPlace.loc.coordinates[0] = parseFloat(body.result.geometry.location.lng);
            newPlace.loc.coordinates[1] = parseFloat(body.result.geometry.location.lat);
            //ADDRESS
            if (typeof body.result.address_components == 'undefined') {
                newPlace.source_google.address = ''
            } else {
                var addy = ''
                newPlace.source_google.address = body.result.address_components.forEach(function(el) {
                    addy = addy + ' ' + el.long_name;
                })
                newPlace.source_google.address = addy.trim()
                newPlace.addressString = addy.trim()
            }
            //INPUT
            var components = body.result.address_components
            if (typeof components == 'undefined' || components == null || components == '') {
                newPlace.backupinput = ''
            } else {
                for (var i = 0; i < components.length; i++) {
                    if (components[i].long_name.toLowerCase().trim().indexOf('united states') == -1 && components[i].long_name.toLowerCase().trim().indexOf('main street') == -1 && components[i].long_name.match(/\d+/g) == null && components[i].long_name.length < 22) {
                        newPlace.backupinput = components[i].long_name
                        break
                    }
                }
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
                newPlace.tel = body.result.international_phone_number;
            }
            //OPENING HOURS
            if (typeof body.result.opening_hours == 'undefined') {
                newPlace.source_google.opening_hours = "";
            } else {
                newPlace.source_google.opening_hours = body.result.opening_hours.weekday_text;
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
            deferred.resolve(newPlace)
        } else {
            deferred.reject(error)
        }
    });
    return deferred.promise;
}


module.exports = router;
