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
 *
 */
var neighborhood = 'california/los-angeles';

// gets all the items from a catalog page
var scrapeCatalogPage = function(url) {
    return new Promise(function(resolve, reject) {
        console.log('processing catalog page', url);
        request.get(url, function (e, r, b) {
            if (e) {
                return reject(e);
            }
            var $ = cheerio.load(b);
            var promises = $('div.products div.productImageHolder a.img').toArray().map(function (a) {
                var itemUrl = 'http://www.shoptiques.com' + $(a).attr('href');

                return new Promise(function(resolve, reject) {
                    redisClient.rpush('items-toprocess', itemUrl, function (err, reply) {
                        if (err) {
                            return console.error(err);
                        }
                        console.log('added item', itemUrl);
                        resolve();
                    });
                });
            });

            Promise.all(promises).then(resolve).catch(reject);
        });
    });
};

var offset = 0;
var urlFormat = 'http://www.shoptiques.com/neighborhoods/$n?max=90&offset=X'.replace('$n', neighborhood);
var seed = function() {
    url = urlFormat.replace('X', offset);
    scrapeCatalogPage(url).then(function() {
        offset += 90;
        seed();
    }).catch(function(e) {
        console.error(e);
    });
};

seed();