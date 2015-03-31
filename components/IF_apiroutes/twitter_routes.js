'use strict';

var express = require('express'),
    router = express.Router(),
    twitterSchema = require('../../IF_services/IF_tweet_REST_processer/tweet_schema.js'),
    _ = require('underscore');


router.use(function (req, res, next) {
    if (req.query.number || req.query.tags) {
        next();
    }
});

//load tweets sorted newest and skips # already loaded on page (lazy load)
router.get('/:number/:tags', function(req, res) {
    instagramSchema.aggregate({
        $match: {
            hashtags: {
                $in: req.query.tags
            }
        }
    }, {
        $sort: {
            created: -1
        }
    }, {
        $skip: parseInt(req.query.number)
    }, {
        $limit: 20
    }, function(err, posts) {
        if (err) {
            console.log(err);
        }
        console.log('# of posts is', posts.count)
        return res.send(posts);
    });
})





module.exports = router;