'use strict';

var express = require('express'),
    router = express.Router(),
    contestEntrySchema = require('../IF_schemas/contestEntry_schema.js'),
    _ = require('underscore');

//load all contest entries sorted newest and skips # already loaded on page (lazy load)
router.get('/:number', function(req, res) {
        contestEntrySchema.aggregate({
            $sort: {
                userTime: -1
            }
        }, {
            $skip: parseInt(req.query.number)
        }, {
            $limit: 20
        }, function(err, entry) {
            if (err) {
                console.log(err);
            }
           
            return res.send(entry);
        });
})


//Toggle entry validity
router.put('/:id', function(req, res) {
    if (req.user.admin) {
        contestEntrySchema.findById(req.params.id, function(err, entry) {
            if (err) {
                return handleError(res, err);
            }
            if (!entry) {
                return res.send(404);
            }

            console.log('entry is..', entry)
           if (entry.valid === false) {
            entry.valid = true
           }else {
            entry.valid = false
           }
            //Save entry
            entry.save(
                function(err, entry) {
                    if (err) {
                        console.log(err)
                    }
                    console.log('updated entry is..', entry)
                })
        })
    } else {
        console.log('you are not authorized...stand down..')
    }
})

//delete a contest entry
router.delete('/:id', function(req, res) {
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
                    res.sendStatus(200);
                    console.log('deleted!')
                })
        })
    } else {
        console.log('you are not authorized...stand down..')
    }
})









module.exports = router;