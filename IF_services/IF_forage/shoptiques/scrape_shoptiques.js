var db = require('../../../components/IF_schemas/db');
var redisClient = require('./redis');
var cheerio = require('cheerio');
var request = require('request');
var Promise = require('bluebird');
var scrapeItem = require('./scrape_item');

/**
 * scraping shoptique - processing the queue
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

var minSecondsBetweenScrape = 10;
var maxSecondsBetweenScrape = 100;



// one page every two seconds
setInterval(function() {

    // change this to lpop when done testing
    redisClient.lrange('items-toprocess', 0, 0, function(e,url) {
        url = url[0]; // remove this when done testing
        scrapeItem(url).then(function(res) {

            var itemsPromise = Promise.map(res.items, function(i) {

            });

            var s = res.boutique;
            redisClient.get(s.shoptiquesUrl, function(e, r) {
                if (e) { reject(e);}
                if (r === '0') {
                    resolve
                } else {
                    
                }
            })
                    // look for it in the db
                }).then(function(landmarks) {
                    // save it if it's not there
                    if (landmarks.length >= 0) {
                        return;
                    }

                    var store = new db.Landmark({

                    });

                    return store.saveAsync();
                });

            return Promise.all([itemsPromise, shopPromis]);

        }).then(function() {

        }).catch(console.error.bind(console));
    });
}, 2*1000);