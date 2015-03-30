'use strict';

var express = require('express'),
    router = express.Router(),
    contestEntrySchema = require('../IF_schemas/contestEntry_schema.js'),
    _ = require('underscore');

//load contest entries sorted newest and skips # already loaded on page (lazy load)
router.get('/:number', function(req, res) {
    
        console.log('req.params is', req.params.number)
        console.log('req.query.number is', req.query.number)
        contestEntrySchema.aggregate({
            $sort: {
                userTime: -1
            }
        }, {
            $skip: parseInt(req.query.number)
        }, function(err, entries) {
            if (err) {
                console.log(err);
            }
            console.log('# of entries is',entries.length)
            return res.send(entries);
        });

   
})

//mark an entry as invalid
router.put('/su/:id', function(req, res) {
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