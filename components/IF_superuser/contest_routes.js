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
        contestSchema.findOne({
            region: req.params.id.toString().toLowerCase(),
            live: true
        }, function(err, contest) {
            if (err) {
                console.log(err);
            }
            console.log('found a contest! -->', contest)
            return res.send(contest);
        });

    } else {
        console.log('you are not authorized...stand down..')
    }
})


//create new contest for that region
router.post('/', function(req, res) {

    if (req.user.admin) {
        //Set all other contests to live:false
        contestSchema.update({}, {
            live: false
        }, {
            multi: true
        }, function(err, result) {
            if (err) {
                console.log(err)
            }
            console.log('all others now false', result)
        })

        console.log('hitting post, req.body is..', req.body)

        var newcontest = new contestSchema();
        if (req.body._id) {
            delete req.body._id;
            delete req.body._v;
        }

     

        var contest = _.extend(newcontest, req.body);

           //push hashtags into contestTag array
        contest.contestTags.push({tag:req.body.hashtag1, title:req.body.hashtag1Title});
        contest.contestTags.push({tag:req.body.hashtag2, title:req.body.hashtag2Title});

        console.log('extended contest is..', contest)
        contest.save(
            function(err, contest) {
                if (err) {
                    console.log(err)
                }
     
                return res.send(contest);

            });
    }
})

// //edit the current contest
router.put('/:id', function(req, res) {
    if (req.user.admin) {
        //find current contest
        contestSchema.findOne({
            live: true
        }, function(err, result) {
            if (err) {
                console.log(err);
            }
            console.log('found a contest! -->', result)
            var contest = _.extend(result, req.body);

            contest.save(
                function(err, contest) {
                    if (err) {
                        console.log(err)
                    }
                    return res.send(contest);
                });
          
        });
    }
})


module.exports = router;