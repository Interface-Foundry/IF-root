var http = require('http');
var cheerio = require('cheerio');
var db = require('db');
var Promise = require('bluebird');
var async = require('async');
var uniquer = require('../../uniquer');
var request = require('request')

function getItem() {
    return new Promise(function(resolve, reject) {
        var url = 'http://www.zara.com/us/en/woman/blazers/crepe-blazer-c756615p2897570.html';
        //construct newItem object
        var newItem = {
            src: url, //drop in URL we're scraping from
            images: [],
            physicalStores: []
        };

        var options = {
            url: 'http://www.zara.com/us/en/woman/blazers/crepe-blazer-c756615p2897570.html',
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
                'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13'
            }
        };

        request(options, function(error, response, body) {
            if ((!error) && (response.statusCode == 200)) {
                $ = cheerio.load(body); //load HTML
                // console.log('body:', body)
                async.eachSeries($('li'), function(li, callback1) {
                        // console.log('li', li)
                        var count = 0;
                        var newPhysicalStore = {};
                        async.eachSeries(li.children, function(elem, callback2) {
                                // console.log('!!!!Elem.attribs', elem.attribs)
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
                                saveStore(newPhysicalStore).then(function(store) {
                                    // console.log('Saved store:', store)
                                    if (newPhysicalStore.storeId !== undefined) {
                                        // console.log('pushing.')
                                        newItem.physicalStores.push({
                                            mongoId: store._id,
                                            zaraStoreId: newPhysicalStore.storeId
                                        });
                                    }
                                    count++;
                                    callback2()
                                }).catch(function(err) {
                                    console.log(err)
                                })

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
                        newItem.physicalStores = newItem.physicalStores.filter(function(val, i, array) {
                            if (i !== 0) {
                                return array[i].zaraStoreId !== array[i - 1].zaraStoreId
                            }
                        })
                        console.log('Done processing stores.', newItem.physicalStores)
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
    console.log('storeIds: ', storeIds)
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
                var inventory = body
                resolve(inventory)
            } else {
                if (error) {
                    console.log('error: ', error)
                    reject(error)
                } else {
                	  console.log('response:', response)
                    reject('Bad response from inventory request')
                }
            }
        })
    })
}

function saveItem(newItem) {
    return new Promise(function(resolve, reject) {
        var i = new db.Landmark();
        i.source_zara_item = newItem;
        i.save(function(e, i) {
            if (e) {
                console.error(e);
                return reject(e)
            }
            // console.log(JSON.stringify(i.toObject()));
            resolve(i);
        })
    })
}

function checkItem(url) {
    // first check if we have already scraped this thing
    return new Promise(function(resolve, reject) {
        db.Landmarks
            .findOne({
                'source_zara_item.url': url
            })
            .exec(function(e, l) {
                if (e) {
                    // console.error(e);
                    resolve()
                }
                if (l) {
                    // console.log('already found', data.url);
                    reject('Item already exists!')
                }
            })
    })
}

function saveStore(store) {
    // check if we have store in db already
    return new Promise(function(resolve, reject) {
        db.Landmarks
            .findOne({
                'source_zara_store.storeId': store.storeId
            })
            .exec(function(e, s) {
                if (e) {
                    //error
                    console.log('249', e)
                    reject(e)
                }
                if (!s) {
                    var n = new db.Landmark();
                    n.source_zara_store = store;
                    n.world = true;
                    n.hasloc = true;
                    n.loc.coordinates[0] = parseFloat(store.lng);
                    n.loc.coordinates[1] = parseFloat(store.lat);
                    uniquer.uniqueId('zara_' + store.storeAddress, 'Landmark').then(function(output) {
                        n.id = output;
                        n.save(function(e, newStore) {
                            if (e) {
                                console.error(e);
                                return reject(e);
                            }
                            // console.log('Saved store! : ', newStore.source_zara_store);
                            resolve(newStore);
                        })
                    })
                } else if (s) {
                    // store exists
                    console.log('Store exists.')
                    resolve(s)
                }
            })
    })
}

async.waterfall([
    // function(callback) {
    //     checkItem().then(callback(null)).catch(callback('item exists'))
    // },
    function(callback) {
        console.log(1)
        getItem().then(function(item) {
            callback(null, item)
        }).catch(function(err) {
            callback(err)
        })
    },
    function(item, callback) {
        console.log(2)
        getLocations(item).then(function(item) {
            callback(null, item)
        }).catch(function(err) {
            callback(err)
        })
    },
    function(item, callback) {
        console.log(3)
        getInventory(item).then(function(inventory) {
            callback(null, inventory)
        }).catch(function(err) {
            callback(err)
        })
    },
    function(inventory, callback) {
        console.log(4)
        console.log('INVENTORY: ', inventory)
    }
], function(err, result) {
    console.log(5)
    if (err) console.log(err)
});


// function scrape() {
//     getItem().then(function(item) {
//         getLocations(item).then(function(item) {
//             getInventory(item)
//         })
//     }).catch(function(err) {
//         console.log('ERROR: ', err)
//     })
// }

// scrape()