var http = require('http');
var cheerio = require('cheerio');
var db = require('db');
var Promise = require('bluebird');
var async = require('async');
var uniquer = require('../../uniquer');
var request = require('request')

var Stores = []
var url = 'http://www.zara.com/us/en/woman/tops/view-all/pleated-top-c733890p2776295.html';

async.waterfall([
    function(callback) {
        checkIfScraped(url).then(callback(null,url)).catch(function(err) {
            callback(err)
        })
    },
    function(url,callback) {
        getItem(url).then(function(item) {
            callback(null, item)
        }).catch(function(err) {
            callback(err)
        })
    },
    function(item, callback) {
        getLocations(item).then(function(item) {
            callback(null, item)
        }).catch(function(err) {
            callback(err)
        })
    },
    function(item, callback) {
        getInventory(item).then(function(inventory) {
            callback(null, item, inventory)
        }).catch(function(err) {
            callback(err)
        })
    },
    function(item, inventory, callback) {
        updateInventory(inventory, item).then(function(item) {
            callback(null, item)
        }).catch(function(err) {
            callback(err)
        })
    },
    function(item, callback) {
        saveStores(item).then(function(item) {
            callback(null, item)
        }).catch(function(err) {
            callback(err)
        })
    },
    function(item, callback) {
        saveItems(item).then(function(items) {
            callback(null, items)
        }).catch(function(err) {
            callback(err)
        })
    }
], function(err, items) {
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
                if (l) {;
                    reject('Item already exists!')
                }
                if (!l) {
                    return resolve(url)
                }
                if (e) {
                    //if some mongo error happened here just go ahead with the process
                    resolve(url)
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
            physicalStores: []
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

                if (newItem.storeId && newItem.category) {
                    // console.log('newItem: ', newItem)
                    resolve(newItem)
                } else {
                    console.log('missing params', newItem);
                    reject('missing params')
                }
            } else {
                if (error) {
                    console.log('error: ', error)
                } else if (response.statusCode !== 200) {
                    console.log('response.statusCode: ', response.statusCode)
                }
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
            url: 'http://www.zara.com/webapp/wcs/stores/servlet/StoreLocatorResultPage?showOnlyDeliveryShops=false&isPopUp=false&storeCountryCode=US&catalogId=' + catalogId + '&country=US&categoryId=' + newItem.category + '&langId=-1&showSelectButton=true&storeId=' + newItem.storeId + '&latitude=' + lat + '&longitude=' + lng + '&ajaxCall=true',
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
                                    newItem.physicalStores.push({
                                        zaraStoreId: elem.attribs.value
                                    })
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

function getInventory(newItem) {
    var result;
    var storeIds = newItem.physicalStores.map(function(obj) {
            return obj.zaraStoreId
        })

    return new Promise(function(resolve, reject) {
        var url = 'http://itxrest.inditex.com/LOMOServiciosRESTCommerce-ws/common/1/stock/campaign/' + newItem.campaign + '/product/part-number/' + newItem.partNumber + '?physicalStoreId=' + storeIds.join() + '&ajaxCall=true'
        var options = {
            url: url,
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
                var inventory = body
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

function updateInventory(inventory, newItem) {
    return new Promise(function(resolve, reject) {
        console.log('')
        if (inventory.stocks && inventory.stocks.length > 0) {
            inventory.stocks.forEach(function(stock) {
                newItem.physicalStores.forEach(function(store) {
                    // console.log('stock.physicalStoreId', stock.physicalStoreId, 'store.zaraStoreId', store.zaraStoreId)
                    if (stock.physicalStoreId.toString().trim() == store.zaraStoreId.toString().trim()) {
                        // console.log('MATCH')
                        store.inventory = stock.sizeStocks;
                    }
                })
            })
            resolve(newItem)
        } else {
            console.log('no inventory? ', inventory)
            resolve(newItem)
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
                // console.log('-_- Updated item: ', item)
            resolve(item)
        })
    })
}

function saveItems(newItem) {
    return new Promise(function(resolve, reject) {
        var savedItems = []
        async.eachSeries(Stores, function(store, callback) {
            var i = new db.Landmark();
            i.source_zara_item = newItem;
            i.hasloc = true;
            // console.log('LNG: ', parseFloat(store.lng), 'LAT: ', parseFloat(store.lat))
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
    })
}