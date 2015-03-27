'use strict';

var express = require('express'),
router = express.Router(),
contestSchema = require('../IF_schemas/contest_schema.js'),
_ = require('underscore');


//load current contest for that region
router.get('/:id', function(req, res) {
    if (req.user.admin) {

        console.log('hitting get contest')
        //find current contest
        contestSchema.aggregate({
            $match: {
                region: req.params.id.toString().toLowerCase()
            }
        }, {
            current: true
        }, function(err, contest) {
            if (err) {
                console.log(err);
            }
            return res.send(contest);
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


