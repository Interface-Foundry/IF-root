//Updating inventory is tricky for this one as inventory is queried by lat lng zipcode..
var http = require('http');
var cheerio = require('cheerio');
var db = require('db');
var Promise = require('bluebird');
var async = require('async');
var uniquer = require('../../uniquer');
var request = require('request');
var _ = require('lodash');
var tagParser = require('../tagParser');
var fs = require('fs');

module.exports = function(Items, category, zipcode) {
    // http: //www.gap.com/browse/productData.do?pid=717340&vid=1&scid=&actFltr=false&locale=en_US&internationalShippingCurrencyCode=&internationalShippingCountryCode=us&globalShippingCountryCode=us
    // var url = 'http://www.gap.com/browse/productData.do?pid=' + pId + '&scid=&actFltr=false&locale=en_US&internationalShippingCurrencyCode=&internationalShippingCountryCode=us&globalShippingCountryCode=us'
    //Global variable declarations
    owner = {};
    oldStores = [];
    newStores = [];
    return new Promise(function(resolve, reject) {
        async.waterfall([
                function(callback) {
                    loadFakeUser().then(function() {
                        callback(null)
                    }).catch(function(err) {
                        console.log('Could not load owner user.')
                        callback(err)
                    })
                },
                function(item, zipcode, callback) {
                    getInventory(Items, zipcode).then(function(stores) {
                        callback(null, items, stores)
                    }).catch(function(err) {
                        callback(err)
                    })
                },
                function(items, stores, callback) {
                    saveStores(items, stores).spread(function(stores) {
                        callback(null, items, stores)
                    }).catch(function(err) {
                        callback(err)
                    })
                },
                function(items, stores, callback) {
                    saveItems(items, stores).then(function(items) {
                        callback(null, items)
                    }).catch(function(err) {
                        callback(err)
                    })
                },
                function(items, callback) {
                    getLatLong(zipcode).then(function(coords) {
                        callback(null, items, coords)
                    }).catch(function(err) {
                        callback(err)
                    })
                },
                function(items, coords, callback) {
                    updateInventory(items, coords).then(function() {
                        callback(null)
                    }).catch(function(err) {
                        callback(err)
                    })
                }
            ],
            function(err) {
                if (err) reject(err)
                resolve()
            })
    })
}

function loadFakeUser() {
    return new Promise(function(resolve, reject) {
        db.Users
            .findOne({
                'profileID': 'menswearhouse333'
            }).exec(function(e, o) {
                if (o) {
                    owner.profileID = o.profileID
                    owner.name = o.name;
                    owner.mongoId = o._id
                    resolve()
                }
                if (!o) {
                    var fake = new db.User()
                    fake.name = 'Mens Wearhouse'
                    fake.profileID = 'menswearhouse333'
                    fake.save(function(err, o) {
                        if (err) {
                            console.log(err)
                        } else {
                            console.log(o.profileID)
                            owner.profileID = o.profileID
                            owner.name = o.name;
                            owner.mongoId = o._id
                            resolve()
                        }
                    })
                }
                if (e) {
                    console.log(e)
                    reject(e)
                }
            })
    })
}

function getInventory(Items, zipcode) {
    return new Promise(function(resolve, reject) {
        var storesToSave = []
        async.eachSeries(Items, function iterator(item, callback) {
            var url = 'http://www.gap.com/resources/storeLocations/v1/us/' + zipcode + '/?searchRadius=100&skuid=' + item.businessCatalogItemId + '&locale=en_US&clientid=gid'
            console.log('Inventory URL: ', url)
            var options = {
                url: url,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13'
                }
            };
            request(options, function(error, response, body) {
                if ((!error) && (response.statusCode == 200)) {
                    body.storeLocations.forEach(function(store) {
                        if (store.inventoryStatusCode == 'HIGH' || store.inventoryStatusCode == 'LOW') {
                            storesToSave.push(store)
                        }
                    })
                } else {
                    if (error) {
                        console.log('getinventory error ', error)

                        // reject(error)
                    } else {
                        console.log('bad response')
                    }
                }
            });
            setTimeout(function() {
                callback()
            }, 800);

        }, function(err, res) {
            if (err) console.log(err)
            storesToSave = _.uniq(storesToSave, 'storeId');
            //DONE GETTING ALL SIZES FOR ALL ITEMS AND COLORS
            //******* DATA NOTES *********
            //******* physicalStores = list of stores that carry this item
            //******* parentProductId = unique Id parent for all item colors and sizes. use this to check if the item was scraped 
            resolve(storesToSave)
        });
    });
}


function saveStores(items, stores) {
    return new Promise(function(resolve, reject) {
        var Stores = [];
        // console.log('stores', stores.length)
        async.eachSeries(stores, function(store, callback) {
            db.Landmarks.findOne({
                    'source_generic_store.storeId': store.storeId,
                    'linkbackname': 'gap.com'
                }, function(err, s) {
                    if (err) {
                        console.log(err)
                        setTimeout(function() {
                            return callback()
                        }, 800);
                    }
                    //If store does not exist in db yet, create it.
                    if (!s) {
                        var newStore = new db.Landmarks();
                        newStore.source_generic_store = store;
                        newStore.name = 'Gap ' + store.storeName
                        newStore.linkbackname = 'gap.com';
                        newStore.addressString = store.storeAddress.address1 + ' ' + store.storeAddress.address2 + ' ' + store.storeAddress.cityName + ' ' + store.storeAddress.stateProvinceCode + ' ' + store.storeAddress.countryCode + ' ' + store.storeAddress.postalCode
                        newStore.tel = store.storeAddress.phoneNumber;
                        newStore.world = true;
                        newStore.hasloc = true;
                        newStore.loc.type = 'Point'
                        newStore.loc.coordinates = [parseFloat(store.longitude), parseFloat(store.latitude]
                        uniquer.uniqueId(newStore.name, 'Landmark').then(function(output) {
                            newStore.id = output;
                            //Save store
                            newStore.save(function(e, s) {
                                if (e) {
                                    console.error(e);
                                }
                                console.log('Saved store!', s)
                                Stores.push(s)
                                return callback()
                            })
                        })
                    }
                    //If store already exists in db
                    else if (s) {
                        console.log('.')
                        Stores.push(s)
                        return callback()
                    }
                }) //end of findOne

        }, function(err) {
            if (err) {
                console.log('Error in saveStores()', err)
                return reject(err)
            }
   
            resolve(Stores)
        })
    })
}



function saveItems(Items, Stores) {
    return new Promise(function(resolve, reject) {
        var storeIds = Stores.map(function(store) {
            return store._id
        })
        newStores = storeIds.map(function(id) {
            return id.toString()
        });
        var storeLocs = [];
        Stores.forEach(function(store) {
            storeLocs.push(store.loc.coordinates)
        })

        var sizeInventory = []
        Items.forEach(function(item) {
            sizeInventory.push(item.inventory)
        })
        async.eachSeries(Items, function iterator(item, callback) {
            //Check if item already exists
            db.Landmarks.findOne({
                'source_generic_item.businessCatalogItemId': item.businessCatalogItemId,
                'name': item.name,
                'linkbackname': 'gap.com'
            }, function(err, i) {
                if (err) {
                    console.log(err)
                    return callback()
                }
                //Create new item in db if it does not already exist
                if (!i) {
                    var newItem = new db.Landmarks();
                    newItem.source_generic_item = item;
                    newItem.loc.type = 'MultiPoint'
                    newItem.loc.coordinates = storeLocs;
                    newItem.parents = storeIds;
                    newItem.price = parseFloat(item.price['currentMaxPrice']);
                    newItem.owner = owner;
                    newItem.world = false;
                    newItem.hasloc = true;
                    newItem.name = item.name
                    newItem.linkback = item.link;
                    newItem.linkbackname = 'gap.com';
                    newItem.itemImageURL = item.avImages;
                    newItem.itemTags.text.push('Gap')
                    var nametags = newItem.name.split(' ').forEach(function(word) {
                        newItem.itemTags.text.push(word.toString().toLowerCase())
                    })
                    newItem.source_generic_item.tags.forEach(function(tag) {
                        newItem.itemTags.text.push(tag)
                    })
                    newItem.itemTags.text = tagParser.parse(newItem.itemTags.text)
                    uniquer.uniqueId('gap ' + newItem.name, 'Landmark').then(function(output) {
                        newItem.id = output;
                        //Save item
                        newItem.save(function(e, i) {
                            if (e) {
                                console.error(e);
                                return callback()
                            }
                            console.log('Saved item!', i.id)
                            callback()
                        })
                    })
                }
                //If item exists in db, add new inventory values to the item (removed stocks will be updated in a later function)
                else if (i) {
                    console.log('Item exists: ', i.id)
                    if (i.parents) {
                        oldStores = i.parents.map(function(id) {
                            return id.toString()
                        })
                    }
                    db.Landmarks.findOne({
                        '_id': i._id
                    }).update({
                        $addToSet: {
                            'loc.coordinates': {
                                $each: storeLocs
                            },
                            'parents': {
                                $each: storeIds
                            }
                        }
                    }, function(e, result) {
                        if (e) {
                            console.log('Inventory update error: ', e)
                            return callback()
                        }
                        console.log('Updated inventory.', result)
                        callback()
                    })
                }
            })

        }, function(err) {
            if (err) {
                console.log('Inventory update error: ', e)
            }
            return resolve('Updated item.')
        })
    })
}

function distance(lat1, lon1, lat2, lon2, unit) {
    var radlat1 = Math.PI * lat1 / 180
    var radlat2 = Math.PI * lat2 / 180
    var radlon1 = Math.PI * lon1 / 180
    var radlon2 = Math.PI * lon2 / 180
    var theta = lon1 - lon2
    var radtheta = Math.PI * theta / 180
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist)
    dist = dist * 180 / Math.PI
    dist = dist * 60 * 1.1515
    if (unit == "K") {
        dist = dist * 1.609344
    }
    if (unit == "N") {
        dist = dist * 0.8684
    }
    return dist
}

function getLatLong(zipcode) {
    return new Promise(function(resolve, reject) {
        db.Zipcodes.findOne({
            zipcode: zipcode
        }, function(err, result) {
            if (err) console.log(err)
            if (result && result.loc.coordinates) {
                resolve(result.loc.coordinates)
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
                                    resolve(results)
                                }
                            } else {
                                console.log('Error: ', zipcode)
                                reject()
                            }
                        } else {
                            console.log('Error: ', error)
                            reject(error)
                        }
                    });
            }
        })
    })
}

function updateInventory(items, coords) {
    return new Promise(function(resolve, reject) {
        // console.log('old stores: ',oldStores, 'new stores: ', newStores)
        var d = _.difference(oldStores, newStores);
        // console.log('difference: ',d)
        if (d.length < 1 || d == null) {
            console.log('No inventory to update')
            return resolve('No stores to remove.')
        }
        var storesToRemove = []
            //For each difference store, calculate if it is within 100 miles of inventory query range (the relevant sphere)
        db.Landmarks.find({
            '_id': {
                $in: d
            }
        }, function(err, stores) {
            if (err) {
                console.log('403', err)
                return callback()
            }
            if (!stores) {
                console.log('Stores not found!')
                return callback()
            } else if (stores) {
                stores.forEach(function(store) {
                    if (distance(store.loc.coordinates[1], store.loc.coordinates[0], parseFloat(coords[1]), parseFloat(coords[0]), 'K') < 165) {
                        storesToRemove.push(store)
                    }
                })
                console.log('Found ', storesToRemove.length, ' inventory records to remove.')

                if (storesToRemove.length > 0) {
                    var ids = storesToRemove.map(function(store) {
                        return store._id
                    })
                    var locs = []
                    storesToRemove.forEach(function(store) {
                        locs.push(store.loc.coordinates)
                    })
                    db.Landmarks.update({
                        'source_generic_item.businessCatalogItemId': item.styleId
                    }, {
                        $pullAll: {
                            'parents': storesToRemove,
                            'source_generic_item.inventory': inv,
                            'loc.coordinates': locs
                        }
                    }, function(err, res) {
                        if (err) console.log('644', err)
                        if (res) {
                            console.log('Updated inventory.', res)
                            resolve()
                        }
                    })

                } // end of if
                else {
                    // console.log('Inventory is up-to-date.')
                    resolve()
                }
            }
        })
    })
}

function wait(callback, delay) {
    var startTime = new Date().getTime();
    while (new Date().getTime() < startTime + delay);
    callback();
}