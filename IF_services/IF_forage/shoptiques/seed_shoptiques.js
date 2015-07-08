var db = require('../../../components/IF_schemas/db');
var redisClient = require('./redis');
var cheerio = require('cheerio');
var request = require('request');
var Promise = require('bluebird');

/**
 * scraping shoptique - seeding the queue
 *
 * The idea is to add item links to a processing queue and fan out.
 *
 * there are 2 queues
 * items-toprocess
 * stores-toprocess
 *
 * after everything is processed, it becomes its own key, with a value indicating the success or failure
 *
 */

// gets all the items from a catalog page
var scrapeCatalogPage = function(url) {
    console.log('processing catalog page', url);
    request.get(url, function(e, r, b) {
        var $ = cheerio.load(b);
        $('div.products div.productImageHolder a.img').toArray().map(function(a) {
            var itemUrl = 'http://www.shoptiques.com' + $(a).attr('href');

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
