var db = require('../../../components/IF_schemas/db');
var redisClient = require('./redis');
var cheerio = require('cheerio');
var request = require('request');
var Promise = require('bluebird');
var scrapeItem = require('./scrape_item');
var getAddressInfo = require('../getAddressInfo');


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
    redisClient.lpop('items-toprocess', function(e,url) {
        console.log('URL:', url);

        // first check if this has been processed yet.
        redisClient.get(url, function(e, r) {
            if (r !== null) {
                // don't process
                console.log(url, 'has already been processsed');
                return;
            }

            console.log('scraping shoptiques');
            scrapeItem(url).then(function (res) {
                console.log('done scraping shoptiques');
                // Insert the store if necessary
                var boutique = res.boutique;

                // first check if we've inserted this shoptique info yet
                db.Landmarks.findOne({'source_shoptique_store.id': boutique.id}).execAsync()
                    .then(function (store) {
                        // only adding in the shoptiques stores now, not matching thems to
                        // stores we already have in the DB from google/users.
                        // Can match and merge later with http://blog.yhathq.com/posts/fuzzy-matching-with-yhat.html
                        if (!store) {
                            console.log('creating new record in the db');
                            console.log('fecthing loc data for', boutique.addressText);
                            return getAddressInfo(boutique.addressText).then(function (addr) {
                                console.log(addr);
                                store = new db.Landmarks({
                                    source_shoptique_store: boutique,
                                    name: boutique.name,
                                    id: boutique.name.replace(/[^\w]+/g, '').toLowerCase() + boutique.id,
                                    world: true,
                                    valid: true
                                });
                                if (addr) {
                                    store.loc = {
                                        type: 'Point',
                                        coordinates: [addr.geometry.location.lng, addr.geometry.location.lat]
                                    };
                                }
                                return store.save();
                            });
                        } else {
                            return store;
                        }
                    }).then(function (store) {
                        console.log('using store', store.name, store.id, store._id.toString());
                        // add any new items to the db
                        var itemPromises = res.items.map(function (i) {
                            var item = new db.Landmark({
                                source_shoptique_item: i,
                                name: i.name,
                                id: i.id + '.' + i.colorId,
                                parent: {
                                    mongoId: store._id.toString(),
                                    name: store.name,
                                    id: store.id
                                },
                                loc: store.get('loc'),
                                description: i.description,
                                itemTags: {
                                    text: i.categories.concat([i.colorName]),
                                    categories: i.categories
                                },
                                itemImageURL: i.images
                            });
                            console.log('saving item', item);
                            return item.save();
                        });

                        return Promise.all(itemPromises);
                    }).then(function () {
                        console.log('processed item', url);
                        redisClient.set(url, '0', function (e, r) {
                            if (e) {
                                console.error(e);
                            }
                        });
                    }).catch(function (err) {
                        console.error(err);
                        redisClient.set(url, err, function (e, r) {
                            if (e) {
                                console.error(e);
                            }
                        });
                    });
            }).catch(console.error.bind(console));
        });
    });
}, 2*1000);