var db = require('../../../components/IF_schemas/db');
var redisClient = require('./redis');
var cheerio = require('cheerio');
var request = require('request');
var Promise = require('bluebird');
var _ = require('lodash');

/**
 * scraping shoptique - seeding the queue
 *
 * The idea is to add item links to a processing queue and fan out.
 *
 * there are 2 queues
 * items-toprocess
 * stores-toprocess
 *
 */

request.get('http://www.shoptiques.com/whats-new', function(e, r, body) {
    var $ = cheerio.load(body);
    var urls = $('div.products div.name-price a').toArray().map(function(a) {
        return 'http://shoptiques.com' + $(a).attr('href');
    });

    db.Landmarks.find({
        'source_shoptiques_item.url': {$in: urls}
    }).select('source_shoptiques_item.url').exec().then(function(lm) {
        lm = lm.map(function(l) { return l.source_shoptiques_item.url});
        var toScrape = _.difference(urls, lm);

        toScrape.map(function(itemUrl) {
            redisClient.rpush('items-toprocess', itemUrl, function (err, reply) {
                if (err) {
                    return console.error(err);
                }
                console.log('added item', itemUrl);
            });
        });
    });
});

return;
// gets all the items from a catalog page
var scrapeWhatsNew = function(url) {
    console.log('processing catalog page', url);
    request.get(url, function(e, r, b) {
        var $ = cheerio.load(b);
        $('div.products div.productImageHolder a.img').toArray().map(function(a) {
            var itemUrl = 'http://http://www.shoptiques.com/whats-new' + $(a).attr('href');

            redisClient.rpush('items-toprocess', itemUrl, function(err, reply) {
                if (err) { return console.error(err); }
                console.log('added item', itemUrl);
            });
        });
    });
};

// stealthily seed our queue with all the cataloged items
var stealtySeed = function() {
    return new Promise(function(resolve, reject) {
        var seedUrlFormat = 'http://www.shoptiques.com/neighborhoods/new_york_city?max=90&offset=X';
        var interval = 90;
        var maxOffset = 3330;

        var urls = [];
        for (var offset = 0; offset <= maxOffset; offset += interval) {
            urls.push(seedUrlFormat.replace('X', offset));
        }

        // scape one page every minute, popping off a url from the array each time
        setInterval(function() {
            if (urls.length === 0) {
                resolve();
            }
            var url = urls.splice(0, 1);
            scrapeCatalogPage(url[0]);
        }, 1000);
    });
};

stealtySeed().then(function(){
    console.log('done seeding. scrape away');
}).catch(console.log.bind(console));
