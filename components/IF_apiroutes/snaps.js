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
    forumStyle = require('../../IF_services/IF_forage/places/forum_theme.json'),
    googleAPI = 'AIzaSyAj29IMUyzEABSTkMbAGE-0Rh7B39PVNz4';

//Create a new snap
router.post('/', function(req, res, next) {
    if (!req.user) {
        return next('You must log in first');
    }

    //If no place was found for this item, create a new place.
    if (req.body.place_id) {
        //First check if it really doesn't exist in the db yet
        db.Landmarks.findOne({
            'source_google.place_id': req.body.place_id
        }, function(err, place) {
            if (err) {
                err.niceMessage = 'Error checking for existing place.';
                return next(err);
            }
            if (place) {
                createItem(req, res, place)
            } else {
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

                newPlace.loc.type = 'Point';
                newPlace.tags = [];
                newPlace.tags.push('clothing');
                newPlace.category = {
                    name: 'place',
                    avatar: '',
                    hiddenPresent: false
                }

                addGoogleDetails(newPlace, req.body.place_id).then(function(newPlace) {
                    uniquer.uniqueId(newPlace.name, 'Landmark').then(function(output) {
                        newPlace.id = output;
                        newPlace.save(function(err, saved) {
                            if (err) {
                                return next('Error saving new place')
                            }
                            saveStyle(newPlace)
                            createItem(req, res, newPlace)
                        })
                    })
                })
            }
        })
    } else {
        if (req.body.parent.mongoId) {
            db.Landmarks.findById(req.body.parent.mongoId, function(err, parent) {
                if (err) {
                    err.niceMessage = 'Error checking for existing place.';
                    return next(err);
                }
                if (parent && parent.source_google.place_id) {
                    console.log('PARENT!!!:', parent)
                    createItem(req, res, parent.source_google.place_id)
                } else {
                    err.niceMessage = 'That store does not exist.';
                    return next(err);
                }
            })
        } else {
            err.niceMessage = 'You must choose a store.';
            return next(err);
        }
    }
});

{
    "__v": 0,
    "id": "a_2",
    "world": false,
    "price": 77,
    "_id": "55bbe29f07783b9d5afd621c",
    "testData": false,
    "reports": [],
    "itemImageURL": ["https://s3.amazonaws.com/if-server-general-images/c6a73a422ffbfa9657b1e8d0f23f11a7.png"],
    "i(lldb) temTags": {
        "text": []
    },
    "comments": [],
    "rejects": [],
    "faves": [],
    "tags": [],
    "source_instagram_post": {
        "created": "2015-07-31T21:03:27.682Z",
        "tags": [],
        "local_path": []
    },
    "source_google": {
        "opening_hours": [],
        "types": []
    },
    "source_meetup": {
        "event_hosts": []
    },
    "permissions": {
        (lldb)
        "admins": [], "viewers": []
    },
    "time": {
        "created": "2015-07-31T21:03:27.682Z"
    },
    "style": {
        "maps": {
            "localMapArray": []
        }
    },
    "landmarkCategories": [],
    "subType": [],
    "loc": {
        "type": "Point",
        "coordinates": [-73.985792, 40.739751]
    },
    "owner": {
        "profileID": "a",
        "mongoId": "55ba7dace1f64(lldb) 46c1a118e14"
    },
    "parent": {
        "name": "Turquoise Spa Inc",
        "id": "0a0eb6220897c7fa084f3e77c604ae4e44eb633c"
    }
}


function createItem(req, res, newPlace) {
    var newItem = new db.Landmark();
    if (newPlace) {
        newItem.parent.mongoId = newPlace._id;
        newItem.parent.name = newPlace.name;
        newItem.parent.id = newPlace.id;
    }
    newItem = _.extend(newItem, req.body);
    newItem.loc.coordinates[0] = newPlace.loc.coordinates[0];
    newItem.loc.coordinates[1] = newPlace.loc.coordinates[1];
    newItem.world = false;
    newItem.owner.mongoId = req.user._id;
    newItem.owner.profileID = req.user.profileID;
    newItem.owner.name = req.user.name;
    //Create a unique id field
    uniquer.uniqueId(newItem.owner.profileID, 'Landmarks').then(function(unique) {
        newItem.id = unique;
        //Upload each image in snap to Amazon S3
        async.eachSeries(newItem.base64, function(buffer, callback) {
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