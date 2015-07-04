var db = require('../../../components/IF_schemas/db');
var redisClient = require('./redis');
var cheerio = require('cheerio');
var request = require('request');
var Promise = require('bluebird');
var scrapeItem = require('./scrape_item');


var status = {
    SUCCESS: '0',
    FAILURE: '1'
};

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


// Scrape items
// one page every two seconds
setInterval(function() {

    // change this to lpop when done testing
    redisClient.lrange('items-toprocess', 0, 0, function(e,url) {
        url = url[0]; // remove this when done testing

        // first check if this has been processed yet.
        redisClient.get(url, function(e, r) {
            if (r === null) {
                // don't process
                console.log(url, 'has already been processsed');
                return;
            }

            scrapeItem(url).then(function(res) {
                var boutique = res.boutique;
                // first insert the store if it doesn't exist yet
                db.Landmarks.findOne({'source_shoptique_store.id': boutique.id}).execAsync()
                    .then(function(store) {
                        if (store) {
                            return store;
                        } else {
                            return db.Landmarks.findOneAsync({
                                world: true,
                            })
                        }
                    }).then(function(store) {
                        if (store) {
                            // add the shoptique info to the store
                            store.source_shoptique_store = boutique;
                            return store.saveAsync();
                        } else {
                            // whoa totally new store that we didn't find with google forager!
                            store = new db.Landmarks({
                                source_shoptique_store: boutique,
                                name: boutique.name,
                                id: boutique.name.replace(/^\w/g, '').toLowerCase() + boutique.id,
                                world: true,
                                valid: true
                            });
                            return store.saveAsync();
                        }
                    }).then(function(store) {
                        // add any new items to the db
                        res.items.map(function(i) {
                            var item = new db.Landmark({
                                source_shoptique_item: i,
                                name: i.name,
                                id: i.id + i.colorId,
                                parent:
                            })
                        });
                    });



            var itemsPromise = Promise.all(res.items.map(function(i) {

                // check if it's been processed yet.. because who knows.
                return new Promise(function(resolve, reject) {
                    redisClient.get(i.url, function(e, r) {
                        if (e) { reject(e) }
                        if (r === null) {

                        }
                    });
                });
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