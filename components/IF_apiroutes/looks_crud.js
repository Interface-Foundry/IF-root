'use strict';

var express = require('express'),
    router = express.Router(),
    _ = require('lodash'),
    db = require('../IF_schemas/db'),
    upload = require('../../IF_services/upload'),
    uniquer = require('../../IF_services/uniquer'),
    async = require('async')

var categories = 'Outerwear, Dresses, Tops, Skirts, Pants, Underwear, Activewear, Tights & Leggings, Shoes, Bags, Accessories, Jewelry'



//Get look given a look ID
router.get('/:id', function(req, res, next) {
    db.Look.findById(req.params.id, function(err, item) {
        if (err) {
            err.niceMessage = 'No look found.';
            return next(err);
        } else if (!item) {
            return next('No look found.');
        }
        res.send(item);
    });
});

//Create a new look
router.post('/', function(req, res, next) {
    if (!req.user) {
        return next('You must log in first');
    }
    // console.log('req.user:', req.user)
    var look = new db.Look();
    look.lookTags = {
        colors: [],
        catgories: [],
        text: []
    };
    look = _.extend(look, req.body);
    look.owner = {
        name: '',
        mongoId: '',
        profileID: ''
    }
    look.owner.name = req.user.name;
    look.owner.mongoId = req.user._id;
    look.owner.profileID = req.user.profileID;
    var input = req.user.profileID;
    async.waterfall([
        function(callback) {
            //Create a unique id field
            uniquer.uniqueId(input, 'Looks').then(function(unique) {
                look.id = unique;
                callback(null, look);
            }).catch(function(err) {
                callback(err)
            })
        },
        //Collect tags from each snap in look 
        function(look, callback) {
            async.eachSeries(look.snaps, function(snap, finished) {

                db.Landmarks.findById(snap.mongoId, function(err, result) {
                    if (err) {
                        // err.niceMessage = 'Could not find snap included in look.';
                        // console.log(err)
                        return finished();
                    }
                    if (!result) {
                        // console.log('Could not find snap included in look.')
                        return finished();
                    }

                    result.itemTags.colors.forEach(function(snapColorTag) {
                        var lookColorTags = look.lookTags.colors.join(' ')
                        if (lookColorTags.indexOf(snapColorTag.trim()) == -1) {
                            look.lookTags.colors.push(snapColorTag)
                        }
                    })
                    result.itemTags.categories.forEach(function(snapCategoryTag) {
                        var lookCategoryTags = look.lookTags.categories.join(' ');
                        //Check if category doesn't already exist AND it's a valid category
                        if (lookCategoryTags.indexOf(snapCategoryTag.trim()) == -1 && categories.indexOf(snapCategoryTag.trim()) > -1) {
                            look.lookTags.categories.push(snapCategoryTag)
                        }
                    })
                    result.itemTags.text.forEach(function(snapTextTag) {
                        var lookTextTags = look.lookTags.text.join(' ');
                        if (lookTextTags.indexOf(snapTextTag.trim()) == -1) {
                            look.lookTags.text.push(snapTextTag)
                        }
                    })
                })
                finished();
            }, function(err) {
                if (err) {
                    err.niceMessage = 'Could not collect tags from snaps.';
                    return callback(err)
                }
                callback(null, look);
            })
        },
        function(look, callback) {
            //Upload look image to Amazon S3
            upload.uploadPicture(look.owner.profileID, look.base64).then(function(imgURL) {
                look.lookImg = imgURL;
                callback(null, look);
            }).catch(function(err) {
                if (err) {
                    err.niceMessage = 'Could not upload image.';
                    return callback(err)
                }
            })
        }
    ], function(err, look) {
        if (err) {
            err.niceMessage = 'Error processing Look';
            return next(err);
        }

        //Save look in db
        look.snapIds = look.snaps.map(function(s) {
            return s.mongoId;
        });
        look.save(function(err, look) {
            if (err) {
                err.niceMessage = 'Could not save look';
                return callback(err)
            }

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

            // add activity
            var a = new db.Activity({
                userIds: [req.user._id.toString()], //todo add ids for @user tags
                landmarkIds: [look._id.toString()],
                activityAction: 'look.post',
                seenBy: [req.user._id.toString()],
                data: {
                    owner: req.user.getSimpleUser(),
                    look: look.getSimpleLook()
                }
            });
            a.saveAsync().then(function() {}).catch(next);

            res.send(look)
        });

    });
});


//Update a look
router.put('/:id', function(req, res, next) {
    if (req.user) {
        db.Looks.findById(req.params.id, function(err, look) {
            if (err) {
                err.niceMessage = 'No look found';
                return next(err);
            }
            if (look && req.user._id.toString() === look.owner.mongoId) { //Merge existing item with updated object from frontend
                look = _.extend(look, req.body);
                //make sure the snapIds are correct
                look.snapIds = look.snaps.map(function(s) {
                    return s.mongoId;
                });
                //Save item
                look.save(function(err, item) {
                    if (err) {
                        err.niceMessage = 'Could not update item';
                        return next(err);
                    }
                    res.send(look)
                })
            } else {
                console.log('you are not authorized...stand down..');
                return next('You are not authorized to edit this item');
            }
        })
    } else {
        console.log('you are not authorized...stand down..');
        return next('You must log in first.');
    }
});

//delete a look
router.post('/:id/delete', function(req, res, next) {
    if (req.user) {
        db.Look.findById(req.params.id, function(err, look) {
            if (err) {
                err.niceMessage = 'No look found.';
                return next(err);
            }

            if (!look) {
                res.sendStatus(200);
            }

            if (req.user._id.toString() === look.owner.mongoId) {
                //Delete entry
                look.remove(function(err) {
                    if (err) {
                        err.niceMessage = 'Could not delete item';
                        return next(err);
                    }
                    res.sendStatus(200);
                    console.log('deleted!')
                })
            } else {
                console.log('you are not authorized...stand down..');
                return next('You are not authorized to delete this look');
            }
        });
    } else {
        console.log('you are not authorized...stand down..');
        return next('You must log in first.');
    }
});



module.exports = router;