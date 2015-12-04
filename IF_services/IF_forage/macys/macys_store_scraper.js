var db = require('db');
var request = require('request');
var cheerio = require('cheerio')
var Promise = require('bluebird')
var async = require('async');
var q = require('q');
var uniquer = require('../../uniquer');
var states = require('./states');
var fs = require('fs')

stateIndex = 0;

saveFlag = 0;
notFoundCount = 0;

async.whilst(
    function() {
        return states[stateIndex]
    },
    function(loop) {
        currentState = states[stateIndex];
        var query = {
            'state': currentState
        }
        db.Zipcodes.find(query).sort({'pop':-1}).then(function(zips) {
            var count = 0;
            console.log('\nCurrent state: ' + currentState)
            async.whilst(
                function() {
                    return count <= zips.length
                },
                function(cb) {
                    //For each zipcode
                    async.eachSeries(zips, function(zip, finishedZipcode) {
                            zipcode = zip.zipcode;
                            //Reset save flag
                            saveFlag = 0;
                            if (notFoundCount >= 200) {
                                console.log('Looks like all stores for this state have been scraped, moving on... ', notFoundCount)
                                notFoundCount = 0;
                                stateIndex = stateIndex + 1
                                return loop()
                            }

                            console.log('Starting zipcode: ', zipcode)
                            async.waterfall([
                                    function(callback) {
                                        getStores(zip.loc.coordinates[1], zip.loc.coordinates[0]).then(function(stores) {
                                            callback(null, stores)
                                        }).catch(function(err) {
                                            callback(err)
                                        })
                                    },
                                    function(stores, callback) {
                                        // console.log('STORES: ', stores)
                                        createStores(stores).then(function(stores) {
                                            callback(null, stores)
                                        }).catch(function(err) {
                                            callback(err)
                                        })
                                    }
                                ],
                                function(err) {
                                    if (err) console.log(err)
                                    if (!saveFlag) {
                                        console.log('No new stores found.')
                                        notFoundCount++
                                    } else {
                                        notFoundCount = 0;
                                    }
                                    count++
                                    finishedZipcode()
                                })
                        },
                        function(err) {
                            if (err) {
                                console.log(err)
                            } else {

                                cb('Done with state.')
                            }
                        });

                },
                function(err) {
                    if (err) {
                        console.log(err)
                    }
                    stateIndex++;
                    if (states[stateIndex]) {
                        currentState = states[stateIndex]
                        console.log('Next state..')
                        loop()
                    } else {
                        console.log('Finished all states!')
                        stateIndex = 0;
                        currentState = states[stateIndex]
                        loop()
                    }

                })

        })
    },
    function(err) {
        if (err) {
           console.log(err)
        }
    });

function getStores(lat, lng) {
    return new Promise(function(resolve, reject) {
        var url = 'http://www1.macys.com/api/store/v2/stores?latitude=' + lat + '&longitude=' + lng;
        var options = {
            url: url,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13'
            }
        };
        request(options, function(error, response, body) {
            if ((!error) && (response.statusCode == 200)) {
                body = JSON.parse(body);
                var stores = body.stores.store; //put store results in each item object
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
            var storeId = parseInt(store.id).toString();

            db.Landmarks
                .findOne({
                    'source_generic_store.id': storeId,
                    'linkbackname': 'macys.com'
                })
                .exec(function(e, s) {
                    if (e) {
                        console.log('E: createStores(): ', e)
                        return callback()
                    }
                    if (!s) {
                        var n = new db.Landmark();
                        n.world = true;
                        n.source_generic_store = store;
                        n.source_generic_store.id = store.id.toString().trim();
                        n.addressString = store.address.line1 + ' ' + store.address.line2 + ' ' + store.address.line3 + ' ' + store.address.city + ' ' + store.address.state + ' ' + store.address.zipCode + ' ' + store.address.countryCode
                        n.tel = store.phoneNumber;
                        n.hasloc = true;
                        n.linkback = 'http://www.macys.com';
                        n.linkbackname = 'macys.com'
                        n.loc.type = 'Point'
                        n.loc.coordinates[0] = parseFloat(store.geoLocation.longitude);
                        n.loc.coordinates[1] = parseFloat(store.geoLocation.latitude);
                        n.name = store.name ? store.name : 'Macys'
                        n.name = n.name.replace(/[^\w\s]/gi, '');
                        uniquer.uniqueId(n.name, 'Landmark').then(function(output) {
                            n.id = output;
                            n.save(function(e, newStore) {
                                if (e) {
                                    return callback()
                                }
                                console.log('Saved: ', newStore.name)
                                saveFlag = 1
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
                console.log('Error in saveStores()', err)
                return reject(err)
            }

            if (Stores && Stores.length > 0) {
                console.log('Saved ', Stores.length, ' stores.')
            }

            resolve(Stores)
        })
    })
}