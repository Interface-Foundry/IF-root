'use strict';

var express = require('express'),
    router = express.Router(),
    instagramSchema = require('../IF_schemas/instagram_schema.js'),
    _ = require('underscore');

router.use(function(req, res, next) {
    if (req.query.number || req.query.tags) {
        next();
    }
});

//load instagrams sorted newest and skips # already loaded on page (lazy load)
router.get('/', function(req, res) {

    console.log('hitting instagrams', req.query.tags);


    instagramSchema.find({
        tags: req.query.tags
    }).sort({
        created: -1
    }).skip(req.query.number).limit(25).exec(function(err, instagrams) {
        if (err) {
            console.log(err);
        }
        console.log('results:', instagrams)
        return res.send(instagrams);
    })

})

module.exports = router;