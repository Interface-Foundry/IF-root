var db = require('../../../components/IF_schemas/db');
var job = require('job');
var request = require('request');
var cheerio = require('cheerio');
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

var scrapeShoptiques = job('scrape-shoptiques-item');

// gets all the items from a catalog page
var scrapeCatalogPage = function(url) {
    return new Promise(function(resolve, reject) {
        console.log('processing catalog page', url);
        request(url, function (e, r, b) {
            if (e) {
                console.log(e);
                return reject(e);
            }

            var $ = cheerio.load(b);

            $('div.products div.productImageHolder a.img').toArray().map(function (a) {
                var itemUrl = 'http://www.shoptiques.com' + $(a).attr('href');
                console.log('found url', itemUrl);
                scrapeShoptiques({
                    url: itemUrl
                });
            });
            resolve();
        });
    });
};

var offset = 0;
var urlFormat = 'http://www.shoptiques.com/neighborhoods/$n?max=90&offset=X';
var neighborhoodIndex = 0;
var seed = function() {
    var url = urlFormat.replace('X', offset).replace('$n', neighborhoods[neighborhoodIndex]);
    if (!url) {
        console.log('done seeding shoptiques');
        process.exit(0);
    }
    scrapeCatalogPage(url).then(function() {
        neighborhoodIndex++;
        seed();
    }).catch(function(e) {
        neighborhoodIndex++;
        offset = 0;
        seed();
    });
};

seed();
