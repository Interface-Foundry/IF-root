'use strict';

var express = require('express'),
    router = express.Router(),
    db = require('db'),
    landmark = db.Landmark,
    _ = require('lodash'),
    request = require('request'),
    semver = require('semver');

// delete is sooooo idempotent.

//delete an item
router.post('/:id/delete', function(req, res, next) {
    if (req.user) {
        landmark.findById(req.params.id, function(err, item) {
            if (err) {
                err.niceMessage = 'No no, item no here.';
                return next(err);
            }

            if (!item) {
                // no problem, item doesn't exist.  this is idempotency
                return res.send(200);
            }

            if (req.user._id.toString() === item.owner.mongoId) {
                //Delete entry
                item.remove(function(err) {
                    if (err) {
                        err.niceMessage = 'Could not delete item';
                        return next(err);
                    }
                    //Decrement users snapCount
                    req.user.update({
                        $inc: {
                            snapCount: -1
                        }
                    }, function(err) {
                        if (err) {
                            err.niceMessage = 'Could not decrement users snapCount';
                            console.log(err)
                        }
                    })
                    res.send(200);
                    console.log('deleted!')
                })
            } else {
                console.log('you are not authorized...stand down..');
                return next('You are not authorized to delete this item');
            }

        });
    } else {
        console.log('you are not authorized...stand down..');
        return next('You must log in first.');
    }
});

/**
 * Middleware to attach the item to the request
 * req.item
 * req.itemId
 */
router.use('/:id*', function(req, res, next) {
    console.log('finding item', req.params.id);
    var query = db.Landmarks
        .findById(req.params.id);

    // Version 0.0.4 (9/10/15) changes "parent" to "parents"
    if (semver.gte(req.version, '0.0.4')) {
        query = query.populate('parents', 'name id addressString tel description loc')
    }

    query.exec(function(err, item) {
        console.log('yay', item);
        if (err) {
            return next(err);
        } else if (!item) {
            return next('Could not find item ＼(º □ º 〃)/');
        }

        req.item = item;
        req.itemId = item._id.toString();
        return next();
    });
});

//Get item given an item ID
router.get('/:id', function(req, res, next) {
    // Version 0.0.4 (9/10/15) changes "parent" to "parents"
    if (semver.gte(req.version, '0.0.4')) {
        // just use the first coordinates for now TODO
        if (req.item.loc.type === 'MultiPoint') {
            req.item.loc.coordinates = req.item.loc.coordinates[0];
        }
        res.send({item: req.item});
    } else {
        // which parent to choose? TODO
        db.Landmarks.findOne({
            _id: req.item.parent.mongoId
        }, function(e, parent) {
            if (e) { return next(e) }

            // just use the first coordinates for now TODO
            if (req.item.loc.type === 'MultiPoint') {
                req.item.loc.coordinates = req.item.loc.coordinates[0];
            }
            res.send({
                item: req.item,
                parent: parent
            })
        })
    }
});

//Update an item
router.put('/:id', function(req, res, next) {
    if (!req.user) {
        return next('You must log in first. 	<(￣ ﹌ ￣)>');
    } else if (req.item.owner.mongoId !== req.userId) {
        return next('You are not authorized. Stand down. 	<(￣ ﹌ ￣)>');
    }

    // allow partial updates
    req.item = _.extend(req.item, req.body);
    req.item.save(function(err, item) {
        if (err) {
            err.niceMessage = 'Could not update item';
            return next(err);
        }
        res.send(item)
    });
});

/**
 * Get the most faved and liked looks for a snap
 */
router.get('/:xid/toplooks', function(req, res, next) {
    // todo sort
    // todo paginate, limit
    var page = 0;
    db.Looks
        .find({'snapIds': req.item._id})
        .limit(20)
        .exec(function(err, looks) {
        if (err) {
            return next(err);
        }
        res.send({
            results: looks,
            links: {
                // todo
                next: '/api/items/' + req.itemId + '/toplooks?page=' + (page + 1)
            }
        });
    });
});

module.exports = router;
