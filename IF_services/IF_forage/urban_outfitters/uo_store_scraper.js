var db = require('db');
var request = require('request');
var cheerio = require('cheerio')
var Promise = require('bluebird')
var async = require('async');
var q = require('q');
var uniquer = require('../../uniquer');



async.waterfall([
        function(callback) {
            getStores().then(function(stores) {
                callback(null, stores)
            }).catch(function(err) {
                callback(err)
            })
        },
        function(stores, callback) {
            createStores(stores).then(function(stores) {
                callback(null, stores)
            }).catch(function(err) {
                callback(err)
            })
        }
    ],
    function(err) {
        if (err) console.log(err)

    })

function getStores() {
    return new Promise(function(resolve, reject) {
        var url = 'http://www.urbanoutfitters.com/urban/stores/en/api/v2/stores.json'
        var options = {
            url: url,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13'
            }
        };

        request(options, function(error, response, body) {
            if ((!error) && (response.statusCode == 200)) {
                body = JSON.parse(body);
                var stores = body.stores; //put store results in each item object
                resolve(stores)
            } else {
                if (error) {
                    console.log('getinventory error ')
                    reject(error)
                } else {
                    console.log('bad response')
                    reject('Bad response from inventory request')
                }
            }
        });

    })
}

function createStores(stores) {
    return new Promise(function(resolve, reject) {
        var Stores = []


        async.eachSeries(stores, function(store, callback) {
            var storeId = parseInt(store.number).toString();
            if (store.country_code !== 'US') {
                return callback()
            }
            db.Landmarks
                .findOne({
                    'source_generic_store.storeId': storeId,
                    'linkbackname': 'urbanoutfitters.com'
                })
                .exec(function(e, s) {
                    if (e) {
                        console.log('Error in saveStores(): ', e)
                        return callback()
                    }
                    if (!s) {
                        var n = new db.Landmark();
                        n.world = true;
                        n.source_generic_store = store;
                        n.source_generic_store.storeId = storeId
                        if (store.address_2 == null) {
                            store.address_2 = ''
                        }
                        n.addressString = store.address_1 + ' ' + store.address_2 + ' ' + store.city + ' ' + store.postal_code + ' ' + store.country_code
                        n.tel = store.phone_number;
                        n.hasloc = true;
                        n.tel = store.phone;
                        n.linkback = 'http://www.urbanoutfitters.com';
                        n.linkbackname = 'urbanoutfitters.com'
                        n.loc.coordinates[0] = parseFloat(store.longitude);
                        n.loc.coordinates[1] = parseFloat(store.latitude);
                        n.name = 'Urban Outfitters ' + store.name;
                        uniquer.uniqueId(n.name, 'Landmark').then(function(output) {
                            n.id = output;
                            n.save(function(e, newStore) {
                                if (e) {
                                    return callback()
                                }
                                console.log('new store: ', newStore)
                                Stores.push(newStore)
                                callback()
                            })
                        })
                    } else if (s) {
                        // item.physicalStores[count].mongoId = s._id
                        console.log('Store exists.')
                        callback()
                    }
                })
        }, function(err) {
            if (err) {
                // console.log('Error in saveStores()',err)
                return reject(err)
            }

            console.log('Saved ', Stores.length, ' stores.')
            resolve(Stores)
        })
    })
}