var fs = require('fs');
var db = require('db');
var async = require('async');
var builder = require('xmlbuilder');
var Redis = require('redis-stream'),
  , redis = new Redis(6379, 'localhost'),
    client = new redis(6379, 'localhost'),
    rpush = client.stream('rpush', 'inputxml');


var fs = require('fs');

var stream = db.Landmarks
    .find({
        'source_generic_item': {
            $exists: true
        },
        'linkbackname': 'urbanoutfitters.com'
    })
    .limit(5)
    .populate('parents')
    .stream()

fileCount = 1;
finalRoot = {}
rpush.pipe(stream).on('data', function buildSiteMap(lm) {
    rpush.pipe(process.stdout)
    rpush.write('lm')

    // rstream.redis.write('xml', lm, function(err, reply) {
    //     if (err) {
    //         err.niceMessage = 'Could not save item';
    //         err.devMessage = 'REDIS QUEUE ERR';
    //         console.log('Error', err)
    //     }
    //     console.log(reply)
    // });
    // rstream.on('close', function() {
    //         console.log('CLOSEDDD ')

    //     })
    // rstream.end()

    // var root = builder.create('urlset', {
    //     version: '1.0',
    //     encoding: 'UTF-8'
    // })
    // root.att('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9')
    // root.att('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance')
    // root.att('xmlns:image', "http://www.google.com/schemas/sitemap-image/1.1")
    // root.att('xmlns:video', "http://www.google.com/schemas/sitemap-video/1.1")

    // var firstUrlEl = root.ele('url')
    // firstUrlEl.ele('loc', null, 'https://kipsearch.com/')
    // firstUrlEl.ele('changefreq', null, 'monthly')

    // var urlCount = 0;
    // var fileName = 'test' + fileCount.toString() + '.xml'

    // if (lm.parents.length > 0) {
    //     async.eachSeries(lm.parents, function iterator(parent, callback) {
    //         if (!parent || !lm || !parent._id || parent._id == undefined || parent._id == null || !lm._id || lm._id == undefined || lm._id == null) {
    //             return callback()
    //         }

    //         //Base Case: 
    //         //If # of urls reaches maximum limit
    //         if (urlCount >= 500) {
    //             console.log('OVER 500!')
    //             var xmlString = root.end({
    //                 pretty: true
    //             });
    //             fs.writeFile(fileName, xmlString, function(err) {
    //                 if (err) console.log('ERROR', err)
    //                 console.log('Finished file numnber: ', fileCount, '. Number of URLs indexed: ', urlCount)
    //                     // fileCount++
    //                     // return buildSiteMap(lm)
    //             })
    //         }
    //         var urlEl = root.ele('url')
    //         var locEl = urlEl.ele('loc', null, 'http://www.kipsearch.com/t/' + parent._id + '/' + lm._id)
    //         if (lm.itemImageURL && lm.itemImageURL.length > 0) {
    //             lm.itemImageURL.forEach(function(url) {
    //                 var firstImgEl = urlEl.ele('image:image')
    //                 var innerImgEl = firstImgEl.ele('image:loc', null, url)
    //             })
    //         }

    //         var lastmodEl = urlEl.ele('lastmod', {}, (new Date().toString()))
    //         var changefreq = urlEl.ele('changefreq', {}, 'weekly')
    //         urlCount++;
    //         console.log(urlCount)
    //         callback()
    //     }, function finished(err) {
    //         if (err) console.log(err)

    //         finalRoot = root;
    //         // console.log('Async finished called')

    //         // var xmlString = root.end({
    //         //     pretty: true
    //         // });
    //         // fs.writeFile(fileName, xmlString, function(err) {
    //         //     if (err) return console.log('ERR',err)
    //         //     console.log('Finished FINAL file number: ', fileCount, '. Number of URLs indexed: ', urlCount)
    //         //     buildSiteMap(lm)
    //         // })
    //     })
    // }


})


function buildSiteMap(lm) {

}

stream.on('end', function() {
    rpush.on('end', function() {

        rpush.redis.lrange('xml', 0, -1, function(err, tags) {
             console.log('Queue: ' + tags.length)
        })

        // rpop = client.stream('rpop')
        // rpop.write('mylist')
        // rpop.end()

    })
    rpush.end()
        // var xmlString = finalRoot.end({
        //     pretty: true
        // });

    // fs.writeFile('test.xml', xmlString, function(err) {
    //     if (err) return console.log(err)
    //     console.log('Finished! ')
    // })
})

// run NODE_ENV=digitalocean before indexitems.js (NODE_ENV=digitalocean node indexitems.js)