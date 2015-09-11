var db = require('../../../components/IF_schemas/db');
var job = require('job');
var request = require('request');
var Promise = require('bluebird');
var scrapeItem = require('./scrape_item');
var getAddressInfo = require('../getAddressInfo');
var _ = require('lodash');


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

var scrapeShoptiques = job('scrape-shoptiques-item', function (data, done) {
    var url = data.url;
    if (typeof url === 'undefined') {
        return done();
    }
    console.log('URL:', url);

    // first check if this has been processed yet.
    db.Landmarks.findOne({'source_shoptiques_item.url': url}, function (e, r) {
        if (r !== null) {
            // don't process
            console.log(url, 'has already been processsed');
            return done();
        }

        console.log('scraping shoptiques item', url);
        scrapeItem(url).then(function (res) {
            console.log('done scraping shoptiques item', url);
            // Insert the store if necessary
            var boutique = res.boutique;

            // first check if we've inserted this shoptique info yet
            db.Landmarks.findOne({'source_shoptiques_store.id': boutique.id}).execAsync()
                .then(function (store) {
                    // only adding in the shoptiques stores now, not matching thems to
                    // stores we already have in the DB from google/users.
                    // Can match and merge later with http://blog.yhathq.com/posts/fuzzy-matching-with-yhat.html
                    if (!store) {
                        console.log('creating new record in the db');
                        console.log('fecthing loc data for', boutique.addressText);
                        return getAddressInfo(boutique.addressText + ' ' + boutique.state).then(function (addr) {
                            console.log(addr);
                            store = new db.Landmarks({
                                source_shoptiques_store: boutique,
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
                            source_shoptiques_item: i,
                            world: false,
                            name: i.name,
                            id: i.id + '.' + i.colorId,
                            price: i.price,
                            priceRange: db.Landmark.priceToPriceRange(i.price),
                            parents: [store._id],
                            parent: {
                                mongoId: store._id.toString(),
                                name: store.name,
                                id: store.id
                            },
                            loc: {
                                type: 'MultiPoint',
                                coordinates: [store.get('loc.coordinates')]
                            },
                            description: i.description,
                            itemTags: {
                                text: i.categories.concat([i.colorName]),
                                categories: i.categories
                            },
                            itemImageURL: i.images,
                            linkback: url,
                            linkbackname: 'shoptiques.com'
                        });
                        console.log('saving item', item);
                        return item.save();
                    });

                    return Promise.all(itemPromises);
                }).then(function () {
                    return db.Landmarks.find({'source_shoptiques_item.url': {$in: res.items[0].related}})
                        .select('source_shoptiques_item.url').exec()
                        .then(function(lm) {
                            lm = lm.map(function(l) { return l.source_shoptiques_item.url});
                            _.difference(res.related, lm).map(function(itemUrl) {
                                scrapeShoptiques({
                                    url: itemUrl
                                });
                            })
                        })
                }).then(function () {
                    console.log('processed item', url);
                    done();
                }).catch(function (err) {
                    console.error('error with item', url);
                    console.error(err);
                    done(err);
                });
        }).catch(function(e) {
            console.error(e);
            done(e);
        });
    });
});