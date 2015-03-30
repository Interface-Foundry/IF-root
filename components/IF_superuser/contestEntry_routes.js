'use strict';

var express = require('express'),
    router = express.Router(),
    contestEntrySchema = require('../IF_schemas/contestEntry_schema.js'),
    _ = require('underscore');

//load all contest entries sorted newest and skips # already loaded on page (lazy load)
router.get('/su/:number', function(req, res) {
    if (req.user.admin) {
        contestEntrySchema.aggregate({
            $sort: {
                userTime: -1
            }
        }, {
            $skip: parseInt(req.query.number)
        }, {
            $limit: 5
        }, function(err, entry) {
            if (err) {
                console.log(err);
            }
            console.log('# of entries is', entry)
            return res.send(entry);
        });
    } else {
        console.log('you are not authorized...stand down..')
    }
})

//load only valid contest entries sorted newest and skips # already loaded on page (lazy load)
router.get('/:number', function(req, res) {

        contestEntrySchema.aggregate({
            $match: {
                valid: true
            }
        }, {
            $sort: {
                userTime: -1
            }
        }, {
            $skip: parseInt(req.query.number)
        }, {
            $limit: 5
        }, function(err, entries) {
            if (err) {
                console.log(err);
            }
            console.log('# of entries is', entries.length)
            return res.send(entries);
        });
   
})

//Toggle entry validity
router.put('/su/:id', function(req, res) {
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
                    res.sendStatus(200);
                    console.log('deleted!')
                })
        })
    } else {
        console.log('you are not authorized...stand down..')
    }
})









module.exports = router;