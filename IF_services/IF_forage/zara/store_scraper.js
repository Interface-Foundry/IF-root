var db = require('db');
var request = require('request');
var cheerio = require('cheerio')
var Promise = require('bluebird')
var async = require('async');
var q = require('q');
var uniquer = require('../../uniquer');
var fs = require('fs');
var states = require('./states')
var stateIndex = 0;
var currentState = states[stateIndex]

//Since there arent too many zara stores in the US (54 total), 
//...if notFoundCount goes past 20 just skip to next state instead of iterating through every remaining zipcode in the state
var notFoundCount = 0;

async.whilst(
    function() {
        return true
    },
    function(loop) {
        var query = {
            'state': currentState
        }
        db.Zipcodes.find(query).then(function(zips) {
            var count = 0;
            console.log('Current state: ' + currentState)
            async.whilst(
                function() {
                    return count <= zips.length
                },
                function(cb) {
                    async.eachSeries(zips, function(zip, finishedZipcode) {
                            var zipcode = zip.zipcode
                            async.waterfall([
                                function(callback) {
                                    getLatLong(zipcode).then(function(coords) {
                                        // console.log('Got coords: ', coords)
                                        callback(null, coords)
                                    }).catch(function(err) {
                                        callback(err)
                                    })
                                },
                                function(coords, callback) {
                                    scrapeStores(coords).then(function(stores) {
                                        // console.log('Got locations: ', stores)
                                        callback(null, stores)
                                    }).catch(function(err) {
                                        callback(err)
                                    })
                                },
                                function(stores, callback) {
                                    saveStores(stores).then(function(stores) {
                                        // console.log('Got stores: ', stores)
                                        callback(null, stores)
                                    }).catch(function(err) {
                                        callback(err)
                                    })
                                }
                            ], function(err, stores) {
                                if (err) {
                                    console.log(err)
                                }
                                if (stores && stores.length > 0) {
                                    console.log('Scraped ', stores.length, ' stores.')
                                } else if (stores && stores.length < 1) {
                                    console.log('No new stores found for zipcode.')
                                    notFoundCount++
                                }

                                if (notFoundCount >= 75) {
                                    notFoundCount = 0;
                                    return cb('Done with state.')
                                }

                                console.log('.')
                                count++
                                wait(finishedZipcode, 500)

                            })
                        },
                        function(err) {
                            if (err) {
                                console.log(err);
                                cb()
                            } else {
                                // console.log('Done with state.')
                                cb('Done with state.')
                            }
                        });
                },
                function(err) {
                    if (err) {
                        console.log(err);
                    }
                    //Log results each loop
                    console.log('Finished ' + currentState + '.')
                    stateIndex++;
                    if (states[stateIndex]) {
                        currentState = states[stateIndex]
                    } else {
                        console.log('Restarting...')
                        stateIndex = 0;
                        currentState = states[stateIndex]
                    }
                    wait(loop, 3000)
                }
            );
        })
    },
    function(err) {
        wait(loop, 3000)
    });


function getLatLong(zipcode, callback) {
    var deferred = q.defer();
    db.Zipcodes.findOne({
        zipcode: zipcode
    }, function(err, result) {
        if (err) console.log(err)
        if (result && result.loc.coordinates) {
            deferred.resolve(result.loc.coordinates)
        } else {
            console.log('Querying mapbox.')
            var string = 'http://api.tiles.mapbox.com/v4/geocode/mapbox.places-v1/';
            string = string + '+' + zipcode;
            string = string + '.json?access_token=pk.eyJ1IjoiaW50ZXJmYWNlZm91bmRyeSIsImEiOiItT0hjYWhFIn0.2X-suVcqtq06xxGSwygCxw';
            request({
                    uri: string
                },
                function(error, response, body) {
                    if (!error && response.statusCode == 200) {
                        var parseTest = JSON.parse(body);
                        if (parseTest.features[0] && parseTest.features[0].center.length > 1) {
                            if (parseTest.features.length >= 1) {
                                var results = JSON.parse(body).features[0].center;
                                results[0].toString();
                                results[1].toString();
                                var newCoords = new db.Zipcode();
                                newCoords.loc.coordinates = results;
                                newCoords.zipcode = zipcode;
                                newCoords.save(function(err, saved) {
                                    if (err) console.log(err)
                                    console.log('Zipcode saved.')
                                })
                                deferred.resolve(results)
                            }
                        } else {
                            console.log('Error: ', zipcode)
                            deferred.reject()
                        }
                    } else {
                        console.log('Error: ', error)
                        deferred.reject(error)
                    }
                });
        }
    })
    return deferred.promise
}


function scrapeStores(coords) {
    return new Promise(function(resolve, reject) {
        var Stores = [];
        var lng = coords[0];
        var lat = coords[1];
        var url = 'http://www.zara.com/webapp/wcs/stores/servlet/StoreLocatorResultPage?showOnlyDeliveryShops=false&isPopUp=false&storeCountryCode=US&catalogId=0&country=US&categoryId=0&langId=-1&showSelectButton=true&storeId=11719&latitude=' + lat.toString().trim() + '&longitude=' + lng.toString().trim() + '&ajaxCall=true'
        var options = {
            url: url,
            headers: {
                'User-Agent': 'Mozilla/7.0 (Windows 8; en-US;) Gecko/20080311 Firefox/3.0'
            }
        };

        // console.log('**URL: ',url)
        request(options, function(error, response, body) {
            if ((!error) && (response.statusCode == 200)) {
                // console.log('URL: ', url)
                // console.log('Body: ',body)
                $ = cheerio.load(body); //load HTML

                fs.appendFile('./logs/lolcakes.log', JSON.stringify(body))

                if ($('html').attr('id') == 'GenericErrorPage') {
                    console.log('Uh oh, Blocked!')
                    return reject('GenericErrorPage')
                }
                async.eachSeries($('li'), function(li, callback1) {
                        var count = 0;
                        var newPhysicalStore = {};
                        async.eachSeries(li.children, function(elem, callback2) {

                                if (!elem.attribs) return callback2()

                                if (elem.attribs.class == 'lat') {
                                    newPhysicalStore.lat = elem.attribs.value;
                                }
                                if (elem.attribs.class == 'lng') {
                                    newPhysicalStore.lng = elem.attribs.value;
                                }
                                if (elem.attribs.class == 'shopType') {
                                    newPhysicalStore.shopType = elem.attribs.value;
                                }
                                if (elem.attribs.class == 'storeId') {
                                    newPhysicalStore.storeId = elem.attribs.value.toString().trim();
                                }
                                if (elem.attribs.class == 'storeAddress') {
                                    newPhysicalStore.storeAddress = elem.attribs.value;
                                }
                                if (elem.attribs.class == 'storeZipCode') {
                                    newPhysicalStore.storeZipCode = elem.attribs.value;
                                }
                                if (elem.attribs.class == 'storeCity') {
                                    newPhysicalStore.storeCity = elem.attribs.value;
                                }
                                if (elem.attribs.class == 'storeCountry') {
                                    newPhysicalStore.storeCountry = elem.attribs.value;
                                }
                                if (elem.attribs.class == 'storePhone1') {
                                    newPhysicalStore.storePhone1 = elem.attribs.value;
                                }
                                if (elem.attribs.class == 'storeSections') {
                                    newPhysicalStore.storeSections = elem.attribs.value;
                                }
                                Stores.push(newPhysicalStore)
                                callback2()
                            }, function(err) {
                                if (err) {
                                    console.log('Async inner each err: ', err)
                                }
                                callback1()
                            }) //End of inner each
                    },
                    function(err) {
                        if (err) {
                            console.log('Async outer each err: ', err)
                        }
                        //Get rid of duplicates
                        Stores = Stores.filter(function(val, i, array) {
                                if (i !== 0) {
                                    return array[i].storeId !== array[i - 1].storeId
                                }
                            })
                            // console.log('Done processing stores.', Stores)
                        resolve(Stores)
                    }); //End of outer each
            } else {
                console.log('e: ', error, 'response: ', response)
                reject('Error requesting locations', error)
            }
        })
    })
}

function saveStores(stores) {
    return new Promise(function(resolve, reject) {
        var Stores = []
        async.each(stores, function(store, callback) {
            db.Landmarks
                .findOne({
                    'source_generic_store.storeId': store.storeId,
                    'linkbackname': 'zara.com'
                })
                .exec(function(e, s) {
                    if (e) {
                        console.log('Error in saveStores(): ', e)
                        callback()
                    }
                    if (!s) {
                        var n = new db.Landmark();
                        n.source_generic_store = store;
                        n.addressString = store.storeAddress + ' ' + store.storeCity + ' ' + store.storeZipCode + ' ' + store.storeCountry
                        n.world = true;
                        n.hasloc = true;
                        n.tel = store.storePhone1
                        n.linkback = 'http://www.zara.com';
                        n.linkbackname = 'zara.com'
                        n.loc.type = 'Point'
                        n.loc.coordinates = [parseFloat(store.lng), parseFloat(store.lat)]
                        n.name = 'Zara ' + store.storeAddress
                        uniquer.uniqueId('zara ' + store.storeAddress, 'Landmark').then(function(output) {
                            n.id = output;
                            n.save(function(e, newStore) {
                                if (e) {
                                    console.log('ERROR MOFO', e)
                                    return callback()
                                }
                                console.log('new store: ', newStore.source_generic_store.storeId)
                                Stores.push(newStore)
                                callback()
                            })
                        })
                    } else if (s) {
                        // console.log('Store exists.')
                        callback()
                    }
                })
        }, function(err) {
            if (err) {
                // console.log('Error in saveStores()',err)
                return reject(err)
            }
            // console.log('Saved ',Stores.length,' stores.')
            resolve(Stores)
        })
    })
}

function wait(callback, delay) {
    var startTime = new Date().getTime();
    while (new Date().getTime() < startTime + delay);
    callback();
}