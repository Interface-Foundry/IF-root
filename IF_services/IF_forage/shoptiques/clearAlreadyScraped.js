// clears already scraped urls from the redis queue

var db = require('db');
var redis = require('./redis');


db.Landmarks.find({'source_shoptique_item.url': {$exists: true}})
    .select('source_shoptique_item')
    .exec()
    .then(function(r) {
        r.map(function(a) {
            var url = a._doc.source_shoptique_item.url;
            redis.lrem('items-toprocess', 0, url, function(e, r) {
                console.log(url, e, r);
            });
        });
    }).then(console.log.bind(console), console.error.bind(console));