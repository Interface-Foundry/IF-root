'use strict';

var express = require('express'),
    router = express.Router(),
    contestEntrySchema = require('../IF_schemas/contestEntry_schema.js'),
    _ = require('underscore');

//user creates a new contest entry for specified region
router.post('/:id', function(req, res) {
    if (req.user.admin) {
        var newentry = new contestEntrySchema();
        var entry = _.extend(newentry, req.body);
        entry.save(
            function(err, entry) {
                if (err) {
                    console.log(err)
                }
                return res.send(entry);
            });
    }
})

//load contest entries sorted newest and skips # already loaded on page (lazy load)
router.get('/su/:number', function(req, res) {
    if (req.user.admin) {
        console.log('loading contest entries')
        contestEntrySchema.aggregate({
            $sort: {
                userTime: -1
            }
        }, {
            $skip: req.params.number
        }, function(err, contests) {
            if (err) {
                console.log(err);
            }
            return res.send(contests);
        });

    } else {
        console.log('you are not authorized...stand down..')
    }
})

//delete a contest entry
router.delete('/su/:id', function(req, res) {
    if (req.user.admin) {
        contestEntrySchema.findById(req.params.id, function(err, entry) {
            if (err) {
                return handleError(res, err);
            }
            if (!entry) {
                return res.send(404);
            }
            //Delete entry
            entry.remove(function(err) {
                    if (err) {
                        console.log(err)
                    }
                    console.log('deleted successfully!')
                })
                //Should I send something back?
        })
    } else {
        console.log('you are not authorized...stand down..')
    }
})









module.exports = router;