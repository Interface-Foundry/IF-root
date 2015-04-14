'use strict';

var express = require('express'),
    router = express.Router(),
    twitterSchema = require('../IF_schemas/twitter_schema.js'),
    _ = require('underscore');


router.use(function(req, res, next) {
    if (req.query.number || req.query.tag) {
  
        next();
    }
});

//load tweets sorted newest and skips # already loaded on page (lazy load)
router.get('/', function(req, res) {

            var number = parseInt(req.query.number)
                twitterSchema.find({
                    hashtags: req.query.tag.toString()
                }).sort({
                    created: -1
                }).skip(number).limit(25).exec(function(err, tweets) {
                    if (err) {
                        console.log(err);
                    }
                    return res.send(tweets);
                })

            })




        module.exports = router;