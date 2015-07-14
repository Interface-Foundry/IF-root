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
var neighborhoods = ["alabama", "alaska", "arizona", "arkansas", "california", "colorado", "connecticut", "delaware", "florida", "georgia", "hawaii", "idaho", "illinois", "indiana", "iowa", "kansas", "kentucky", "las-vegas", "london", "long-island", "louisiana", "maine", "maryland", "massachusetts", "michigan", "minnesota", "mississippi", "missouri", "montana", "montauk", "nebraska", "nevada", "new-hampshire", "new-jersey", "new-mexico", "new-york", "new_york_city", "north-carolina", "north-dakota", "ohio", "oklahoma", "oregon", "paris", "pennsylvania", "rhode-island", "san-diego", "san_francisco", "south-carolina", "south-dakota", "tennessee", "texas", "utah", "vermont", "virginia", "washington-dc", "washington-state", "west-virginia", "wisconsin", "wyoming"];

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

            if (promises.length === 0) {
                return reject();
            }

            Promise.all(promises).then(resolve).catch(reject);
        });
    });
};

var offset = 0;
var urlFormat = 'http://www.shoptiques.com/neighborhoods/$n?max=90&offset=X';
var neighborhoodIndex = 0;
var seed = function() {
    url = urlFormat.replace('X', offset).replace('$n', neighborhoods[neighborhoodIndex]);
    scrapeCatalogPage(url).then(function() {
        offset += 90;
        seed();
    }).catch(function(e) {
        neighborhoodIndex++;
        offset = 0;
        seed();
    });
};

seed();