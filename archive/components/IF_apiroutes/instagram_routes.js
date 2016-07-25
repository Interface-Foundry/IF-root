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
    
    var sTag = req.query.tags.toLowerCase();
    instagramSchema.find({
        tags: sTag
    }).sort({
        created: -1
    }).skip(req.query.number).limit(25).exec(function(err, instagrams) {
        if (err) {
            console.log(err);
        }
        
        return res.send(instagrams);
    })

})

module.exports = router;