var http = require('http');
var cheerio = require('cheerio');
var db = require('db');
var Promise = require('bluebird');
var async = require('async');
var uniquer = require('../../uniquer');
var request = require('request')

function getItem() {
    return new Promise(function(resolve, reject) {
        var scrapeHost = 'www.zara.com';
        var scrapePath = '/us/en/woman/coats/a-line-coat-c269183p2846559.html';
        var url = scrapeHost.concat(scrapePath)
        var options = {
            host: scrapeHost,
            port: 80,
            path: scrapePath,
            headers: {
                origin: 'http://shenaniganslimited.com'
            }
        };
        //construct newItem object
        var newItem = {
            src: url, //drop in URL we're scraping from
            images: [],
            physicalStores: []
        };

        http.get(options, function(res) {
            res.on("data", function(chunk) {

                $ = cheerio.load(chunk); //load HTML

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
                $('img').each(function(i, elem) {
                    if (elem.attribs) { //check for attributes
                        if (elem.attribs.class) { //is the image classy?
                            if (elem.attribs.class.indexOf("image-big") > -1) { //detects if this is one of the product images, not an unrelated image 

                                if (i == 0) { //grab item details on first iteration since it's the same for each image in series (except for last image for some reason) (is this a good idea? probably not!)
                                    newItem.partNumber = elem.attribs['sb-id']; //used by Inditex API
                                    newItem.campaign = elem.attribs['data-ref'].split('-')[1]; //ID after '-' is the campaign code, used by Inditex API
                                    newItem.name = elem.attribs['data-name'];
                                    newItem.category = elem.attribs['data-category'];
                                }

                                if (elem.attribs['data-src']) {
                                    newItem.images.push('https:' + elem.attribs['data-src'].split('?')[0]); //push images to array after removing URL params
                                }
                                //console.log(newItem);
                            }
                        }
                    }
                });
            });

            res.on("end", function() {
                if (newItem.storeId && newItem.category) {
                    resolve(newItem)
                } else {
                    console.log('missing params', newItem);
                    reject('missing params')
                }
            });

        }).on('error', function(e) {
            console.log("Got error: " + e.message);
        });
    })
}


function getLocations(newItem) {
    return new Promise(function(resolve, reject) {
        var lat = '40.7135097';
        var lng = '-73.9859414';
        var catalogId = '21053'; //hard to scrape this from site, but seems like this number is arbitrary...

        var url = 'http://www.zara.com/webapp/wcs/stores/servlet/StoreLocatorResultPage?showOnlyDeliveryShops=false&isPopUp=false&storeCountryCode=US&catalogId=' + catalogId + '&country=US&categoryId=' + newItem.category + '&langId=-1&showSelectButton=true&storeId=' + newItem.storeId + '&latitude=' + lat + '&longitude=' + lng + '&ajaxCall=true'

        request({
            url: url
        }, function(error, response, body) {
            if ((!error) && (response.statusCode == 200)) {
                $ = cheerio.load(body); //load HTML

                async.eachSeries($('li'), function(elem, callback) {
                        var count = 0;
                        var newPhysicalStore = {};

                        for (var i = 0; i < elem.children.length; i++) {
                            if (elem.children[i].attribs) {
                                if (elem.children[i].attribs.class == 'lat') {
                                    newPhysicalStore.lat = elem.children[i].attribs.value;
                                }
                                if (elem.children[i].attribs.class == 'lng') {
                                    newPhysicalStore.lng = elem.children[i].attribs.value;
                                }
                                if (elem.children[i].attribs.class == 'shopType') {
                                    newPhysicalStore.shopType = elem.children[i].attribs.value;
                                }
                                if (elem.children[i].attribs.class == 'storeId') {
                                    newPhysicalStore.storeId = elem.children[i].attribs.value;
                                }
                                if (elem.children[i].attribs.class == 'storeAddress') {
                                    newPhysicalStore.storeAddress = elem.children[i].attribs.value;
                                }
                                if (elem.children[i].attribs.class == 'storeZipCode') {
                                    newPhysicalStore.storeZipCode = elem.children[i].attribs.value;
                                }
                                if (elem.children[i].attribs.class == 'storeCity') {
                                    newPhysicalStore.storeCity = elem.children[i].attribs.value;
                                }
                                if (elem.children[i].attribs.class == 'storeCountry') {
                                    newPhysicalStore.storeCountry = elem.children[i].attribs.value;
                                }
                                if (elem.children[i].attribs.class == 'storePhone1') {
                                    newPhysicalStore.storePhone1 = elem.children[i].attribs.value;
                                }
                                if (elem.children[i].attribs.class == 'storeSections') {
                                    newPhysicalStore.storeSections = elem.children[i].attribs.value;
                                }
                            }
                            if (count == elem.children.length - 1) { ///ommgmggmgmgmgmgmggggg =____=
                                saveStore(newPhysicalStore).then(function(store) {
                                    newItem.physicalStores.push({
                                        mongoId: store._id,
                                        zaraStoreId: newPhysicalStore.storeId
                                    });
                                    count++;
                                    callback()
                                }).catch(function(err) {
                                    console.log(err)
                                })
                            }
                            count++;
                        }
                    },
                    function(err) {
                        console.log('Done processing stores.')
                        resolve(newItem)
                    });
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
        return obj.storeId
    })
    return new Promise(function(resolve, reject) {
        // console.log(3)
        // var options = {
        //     host: 'itxrest.inditex.com',
        //     port: 80,
        //     headers: {
        //         origin: 'http://santiagoandjowarskilimited.com'
        //     },
        //     path: '/LOMOServiciosRESTCommerce-ws/common/1/stock/campaign/' + newItem.campaign + '/product/part-number/' + newItem.partNumber + '?physicalStoreId=' + storeIds.join() + '&ajaxCall=true'
        // };

        var url = 'http://itxrest.inditex.com/LOMOServiciosRESTCommerce-ws/common/1/stock/campaign/' + newItem.campaign + '/product/part-number/' + newItem.partNumber + '?physicalStoreId=' + storeIds.join() + '&ajaxCall=true'

        request({
            url: url
        }, function(error, response, body) {
            if ((!error) && (response.statusCode == 200)) {
                var inventory = body.split('undefined')[1]
                    // console.log('NEWITEM: ', newItem, '\nINVENTORY: ', inventory)
                resolve(inventory)
            } else {
                if (error) reject(error)
                else reject('Bad response from inventory request')
            }

        })

    })
}

function saveItem(newItem) {
    return new Promise(function(resolve, reject) {
        var i = new db.Landmark(newItem);
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
                            console.log('Saved store! : ', newStore.source_zara_store);
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