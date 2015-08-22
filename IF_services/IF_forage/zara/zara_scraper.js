//TODO: DECOUPLE STORE SCRAPER WITH ITEM SCRAPER
//Check inventory field in existing item with updated inventory !
var cheerio = require('cheerio');
var db = require('db');
var Promise = require('bluebird');
var async = require('async');
var uniquer = require('../../uniquer');
var request = require('request')

var Stores = []
var url = 'http://www.zara.com/us/en/woman/dresses/view-all/printed-tunic-c733885p2979532.html';
//global var to store existing item 
existingItem = {};
//Flag if item exists
exists = false;

async.waterfall([
        function(callback) {
            checkIfScraped(url).then(function(item) {
                if (item) {
                    exists = true;
                    existingItem = item; //store for later updating in db
                    callback(null, item)
                } else {
                    callback(null, null)
                }
            }).catch(function(err) {
                callback(err)
            })
        },
        function(existingItem, callback) {
            if (!exists) {
                getItem(url).then(function(item) {
                    callback(null, item)
                }).catch(function(err) {
                    callback(err)
                })
            } else if (exists) {
                callback(null, existingItem)
            }
        },
        function(item, callback) {
            loadStores().then(function(stores) {
                callback(null, item, stores)
            }).catch(function(err) {
                callback(err)
            })
        },
        function(item, stores, callback) {
            getInventory(item, stores).then(function(inventory) {
                callback(null, item, inventory)
            }).catch(function(err) {
                callback(err)
            })
        },
        function(item, inventory, callback) {
            createItems(inventory, item).then(function(item) {
                callback(null, item)
            }).catch(function(err) {
                callback(err)
            })
        }
        // ,
        // function(item, callback) {
        //     if (!exists) {
        //         saveStores(item).then(function(item) {
        //             callback(null, item)
        //         }).catch(function(err) {
        //             callback(err)
        //         })
        //     } else if (exists) {
        //         callback(null, item)
        //     }
        // },
        // function(item, callback) {
        //     saveItems(item).then(function(items) {
        //         callback(null, items)
        //     }).catch(function(err) {
        //         callback(err)
        //     })
        // }
    ],
    function(err, items) {
        if (err) {
            console.log(err)
        }
        console.log('finished scraping item!!', items)
    });


function checkIfScraped(url) {
    // first check if we have already scraped this thing
    return new Promise(function(resolve, reject) {
        db.Landmarks
            .findOne({
                'source_zara_item.src': url.trim()
            })
            .exec(function(e, l) {
                if (l) {
                    existing = true
                    return resolve(l)
                }
                if (!l) {
                    existing = false
                    return resolve()
                }
                if (e) {
                    //if some mongo error happened here just pretend it doesn't exist and go ahead with the process
                    existing = false
                    return resolve()
                }
            })
    })
}


function getItem(url) {
    return new Promise(function(resolve, reject) {
        //construct newItem object
        var newItem = {
            src: url,
            images: [],
            inventory: []
        };

        var options = {
            url: url,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13'
            }
        };
        request(options, function(error, response, body) {
            if ((!error) && (response.statusCode == 200)) {

                $ = cheerio.load(body); //load HTML
                //getting the item price, adding to object
                if ($('span.price')) {
                    var price = $('p.price>span.price').attr('data-price')
                    if (price) {
                        newItem.price = price.replace(/[^\d.-]/g, '');
                    }
                } else if ($('span').attr('data-price')) { //find the data-price for the item 
                    newItem.price = $('span').attr('data-price').replace(/[^\d.-]/g, ''); //removing the 'USD' but keeping the .00 float val
                } else if ($('span').attr('price')) {
                    newItem.price = $('span').attr('price').replace(/[^\d.-]/g, '');
                }

                if ($("input[name='storeId']").val()) {
                    newItem.storeId = $("input[name='storeId']").val(); //need this storeId to query zara store locations
                }

                //iterate on images found in HTML
                $('img.image-big').each(function(i, elem) {
                    if (elem.attribs) { //check for attributes
                        if (i == 0) { //grab item details on first iteration since it's the same for each image in series (except for last image for some reason) (is this a good idea? probably not!)
                            newItem.partNumber = elem.attribs['sb-id']; //used by Inditex API
                            newItem.campaign = elem.attribs['data-ref'].split('-')[1]; //ID after '-' is the campaign code, used by Inditex API
                            newItem.name = elem.attribs['data-name'];
                            newItem.category = elem.attribs['data-category'];
                        }
                        if (elem.attribs['data-src']) {
                            newItem.images.push('https:' + elem.attribs['data-src'].split('?')[0]); //push images to array after removing URL params
                        }
                    }
                });

                if (newItem.storeId) {
                    resolve(newItem)
                } else {
                    console.log('missing params', newItem);
                    reject('missing params')
                }
            } else {
                if (error) {
                    console.log('error: ', error)
                    reject(error)
                } else if (response.statusCode !== 200) {
                    console.log('response.statusCode: ', response.statusCode)
                    reject(response.statusCode)
                }
            }
        })
    })
}

function loadStores() {
    return new Promise(function(resolve, reject) {
        db.Landmarks.find({
            'source_zara_store': {
                $exists: true
            }
        }, function(e, stores) {
            if (e) {
                console.log(e)
                reject(e)
            }
            if (!stores) {
                reject('No stores in db.')
            }
            if (stores) {
                resolve(stores)
            }
        })
    })
}

function getLocations(newItem) {
    return new Promise(function(resolve, reject) {
        var lat = '40.7135097';
        var lng = '-73.9859414';
        var catalogId = '21053'; //hard to scrape this from site, but seems like this number is arbitrary...
        var options = {
            url: 'http://www.zara.com/webapp/wcs/stores/servlet/StoreLocatorResultPage?showOnlyDeliveryShops=false&isPopUp=false&storeCountryCode=US&catalogId=0&country=US&categoryId=' + newItem.category + '&langId=-1&showSelectButton=true&storeId=' + newItem.storeId + '&latitude=' + lat + '&longitude=' + lng + '&ajaxCall=true',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows; U; Windows 8; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13'
            }
        };

        request(options, function(error, response, body) {
            if ((!error) && (response.statusCode == 200)) {
                $ = cheerio.load(body); //load HTML
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
                                    newPhysicalStore.storeId = elem.attribs.value;
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
                        newItem.physicalStores = newItem.physicalStores.filter(function(val, i, array) {
                            if (i !== 0) {
                                return array[i].zaraStoreId !== array[i - 1].zaraStoreId
                            }
                        })
                        Stores = Stores.filter(function(val, i, array) {
                                if (i !== 0) {
                                    return array[i].storeId !== array[i - 1].storeId
                                }
                            })
                            // console.log('Done processing stores.', Stores)
                        resolve(newItem)
                    }); //End of outer each
            } else {
                console.log('e: ', error, 'response: ', response)
                reject('Error requesting locations', error)
            }
        })

    })
}

function getInventory(newItem, stores) {

    var Item = !exists ? newItem : newItem.source_zara_item
    var storeIds = stores.map(function(obj) {
        return obj.source_zara_store.storeId
    })

    console.log('~~~storeIds', storeIds)

    return new Promise(function(resolve, reject) {
        var apiUrl = 'http://itxrest.inditex.com/LOMOServiciosRESTCommerce-ws/common/1/stock/campaign/' + Item.campaign + '/product/part-number/' + Item.partNumber + '?physicalStoreId=' + storeIds.join() + '&ajaxCall=true'
        var options = {
            url: apiUrl,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13'
            }
        };
        request(options, function(error, response, body) {
            if ((!error) && (response.statusCode == 200)) {
                body = JSON.parse(body)
                if (!body.stocks) {
                    console.log('no stocks property in body getInventory()')
                }
                var inventory = body.stocks
                resolve(inventory)
            } else {
                if (error) {
                    console.log('getinventory error ')
                    reject(error)
                } else {
                    console.log('bad response')
                    reject('Bad response from inventory request')
                }
            }
        })

    })
}

function createItems(inventory, newItem) {
    // console.log('newItem:',newItem)
    var savedItems = []

    //proxy var to make things easier, sorry :/
    if (exists) {
        var Item = newItem.source_zara_item
    }

    //switch up how newItem is treated depending on if it exists or not 
    newItem = exists ? newItem.source_zara_item : newItem

    return new Promise(function(resolve, reject) {
        if (inventory && inventory.length > 0) {
            var count = 0;
            async.eachSeries(inventory, function(store, callback) {
                    console.log('storeId: ',store.physicalStoreId)
                        //If item exists
                        if (exists) {
                            //And the current store in inventory list is the items parent store
                            if (Item.storeId == inventory[count].physicalStoreId) {
                                //Update items inventory info
                                db.Landmarks.update({
                                    '_id': Item._id
                                }, {
                                    $set: {
                                        'inventory': inventory[count].sizeStocks
                                    }
                                }, function(e, result) {
                                    if (e) {
                                        console.log(e)
                                        count++
                                        return callback()
                                    }
                                    console.log('Updated inventory: \n', result)
                                    count++
                                    callback()
                                })
                            }
                        }

                        //First check if item/inventorystore pair exists already
                        db.Landmarks.findOne({
                                'source_zara_item.name': newItem.name,
                                'source_zara_item.storeId': store.physicalStoreId
                            }, function(e, match) {
                                if (e) {
                                    console.log(e)
                                }
                                if (match) {
                                    count++
                                    callback()
                                }
                                if (!match) {

                                    //No existing matches in db, create a new item.
                                    var i = new db.Landmark();
                                    i.source_zara_item = newItem;
                                    i.hasloc = true;
                                    i.loc.coordinates[0] = parseFloat(store.lng);
                                    i.loc.coordinates[1] = parseFloat(store.lat);
                                    uniquer.uniqueId(newItem.name, 'Landmark').then(function(output) {
                                        i.id = output;
                                        //Check if the store with storeId exists in db
                                        db.Landmarks.findOne({
                                            'source_zara_store.storeId': store.physicalStoreId
                                        }, function(e, s) {
                                            if (e) {
                                                console.log(e)
                                                count++
                                                return callback()
                                            }
                                            if (s) {
                                                console.log('FOUND!!! FUCKER',s.source_zara_store.storeId)
                                                i.parent.mongoId = s._id;
                                                i.parent.name = s.id;
                                                i.parent.id = s.id;
                                            } else if (!s) {
                                                //The parent store doesn't exist in db, skip this item for now.
                                                console.log('Store in inventory list doesnt exist in the db!')
                                                count++
                                                return callback()
                                            }
                                            //Save item
                                            i.save(function(e, item) {
                                                if (e) {
                                                    console.error(e);
                                                }
                                                savedItems.push(item)
                                                console.log('Saved item! ', item.id)
                                                count++
                                                callback();
                                            })
                                        })
                                    })
                                }
                            }) //end of findOne
                    },
                    function(e) {
                        if (e) {
                            console.log(e)
                        }
                        resolve(savedItems)
                    }) //end of async.foreachof

        } else {
            console.log('no inventory? ', inventory)
            resolve()
        }
    })
}






function saveItems(newItem) {
    return new Promise(function(resolve, reject) {

        if (!exists) {
            var savedItems = []
            async.eachSeries(Stores, function(store, callback) {
                var i = new db.Landmark();
                i.source_zara_item = newItem;
                i.hasloc = true;
                i.loc.coordinates[0] = parseFloat(store.lng);
                i.loc.coordinates[1] = parseFloat(store.lat);
                uniquer.uniqueId(newItem.name, 'Landmark').then(function(output) {
                    i.id = output;
                    i.save(function(e, item) {
                        if (e) {
                            console.error(e);
                            return callback();
                        }
                        savedItems.push(item)
                        callback()
                    })
                })
            }, function(err) {
                if (err) {
                    // console.log('Error in saveItems: ',err)
                    reject(err)
                }
                resolve(savedItems)
            })
        } else if (exists) {
            existingItem.source_zara_item = newItem;
            existingItem.save(function(err, item) {
                if (err) {
                    console.log('Error updating item inventory', err)
                    return reject(err)
                }
                console.log('Updated item inventory!')
                resolve(item)
            })
        }

    })
}

function saveStores(item) {
    return new Promise(function(resolve, reject) {
        var storeIds = []
        var count = 0
        async.each(Stores, function(store, callback) {
            db.Landmarks
                .findOne({
                    'source_zara_store.storeId': store.storeId
                })
                .exec(function(e, s) {
                    if (e) {
                        //error
                        console.log('Error in saveStores(): ', e)
                        item.physicalStores[count].mongoId = 'null'
                        count++;
                        callback()
                    }
                    if (!s) {
                        var n = new db.Landmark();
                        n.source_zara_store = store;
                        n.world = true;
                        n.hasloc = true;
                        console.log('LNG: ', parseFloat(store.lng), 'LAT: ', parseFloat(store.lat))
                        n.loc.coordinates[0] = parseFloat(store.lng);
                        n.loc.coordinates[1] = parseFloat(store.lat);
                        uniquer.uniqueId('zara_' + store.storeAddress, 'Landmark').then(function(output) {
                            n.id = output;
                            n.save(function(e, newStore) {
                                if (e) {
                                    // console.error(e);
                                    return callback()
                                }
                                item.physicalStores[count].mongoId = newStore._id
                                count++;
                                callback()
                            })
                        })
                    } else if (s) {
                        item.physicalStores[count].mongoId = s._id
                        count++;
                        callback()
                    }
                })
        }, function(err) {
            if (err) {
                // console.log('Error in saveStores()',err)
                return reject(err)
            }
            item.physicalStores = item.physicalStores.filter(function(val, i) {
                return val !== 'null'
            })
            resolve(item)
        })
    })
}