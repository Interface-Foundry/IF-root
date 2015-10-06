var fs = require('fs');
var db = require('db');
var async = require('async');
var builder = require('xmlbuilder');

var count = 0

var stream = db.Landmarks
    .find({
        'source_generic_item': {
            $exists: true
        },
        'linkbackname': 'urbanoutfitters.com'
    })
    .limit(20)
    .populate('parents')
    .stream()

var root = builder.create('urlset', {
    version: '1.0',
    encoding: 'UTF-8'
})
root.att('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9')
root.att('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance')
root.att('xmlns:image', "http://www.google.com/schemas/sitemap-image/1.1")
root.att('xmlns:video', "http://www.google.com/schemas/sitemap-video/1.1")

var firstUrlEl = root.ele('url', {
    'loc': 'https://kipsearch.com/',
    'lastmod': (new Date().toString()),
    'changefreq': 'monthly'
})

stream.on('data', function(lm) {
    if (lm.parents.length > 0) {
        async.eachSeries(lm.parents, function iterator(parent, callback) {
            if (!parent || !lm || !parent._id || parent._id == undefined || parent._id == null || !lm._id || lm._id == undefined || lm._id == null) {
                console.log('undefined yo')
                return callback()
            }
            var urlEl = root.ele('url')
            var locEl = urlEl.ele('loc', null, 'http://www.kipsearch.com/t/' + parent._id + '/' + lm._id)
                //might change this to a week from when this is run?
            var lastmodEl = urlEl.ele('lastmod', {}, (new Date().toString()))
            var changefreq = urlEl.ele('changefreq', {}, 'weekly')
            count++;
            callback()
        }, function finished(err) {
            if (err) console.log(err)
        })
    }
})

stream.on('end', function() {
    var xmlString = root.end({
        pretty: true
    });
    console.log('Finished! ', count, '\n', xmlString)
})

// run NODE_ENV=digitalocean before indexitems.js (NODE_ENV=digitalocean node indexitems.js)