'use strict';

var express = require('express'),
router = express.Router(),
contestEntrySchema = require('../IF_schemas/contestEntry_schema.js'),
_ = require('underscore');

//load contest entries by newest
router.get('/:number', function(req, res) {
    if (req.user.admin) {
        console.log('loading contest entries')
        contestSchema.find().sort({usertime:-1}).exec(function(err, contests) {
            if (err) {
                console.log(err);
            }
            return res.send(contests);
        });

    } else {
        console.log('you are not authorized...stand down..')
    }
})

//create new contest for that region
router.post('/', function(req, res) {
    if (req.user.admin) {
        var newcontest = new contestSchema();
        var contest = _.extend(newcontest, req.body);

        contest.save(
            function(err, contest) {
                if (err) {
                    console.log(err)
                }
                return res.send(contest);
            });
    }
})

module.exports = router;
