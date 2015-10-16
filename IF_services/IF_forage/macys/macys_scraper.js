var http = require('http');
var cheerio = require('cheerio');
var db = require('db');
var Promise = require('bluebird');
var async = require('async');
var uniquer = require('../../uniquer');
var request = require('request');
var urlapi = require('url');
var _ = require('lodash');
var fs = require('fs');
var urlify = require('urlify').create({
    addEToUmlauts: true,
    szToSs: true,
    spaces: "_",
    nonPrintable: "_",
    trim: true
});
var tagParser = require('../tagParser');
var upload = require('../../upload');
//Global var to hold category
cat = '';
//Global vars to hold default mongo objects
owner = {};
notfoundstore = {};

// http://www.urbanoutfitters.com/urban/catalog/availability_include_store_json.jsp?country=US&distance=50&selectedColor=054&skuId=32175697&zipCode=10002
// skuId ---> need to iterate through all sku based on size (or what is the main URL sku??)


module.exports = function(url, category, stores) {

    return new Promise(function(resolve, reject) {
        //Create a global var to hold all mongo stores (for later location extraction)
        stores = stores;
        cat = category;
        async.waterfall([
            function(callback) {
                loadMongoObjects().then(function(results) {
                    if (results[0].isFulfilled()) {
                        owner = results[0].value()
                    }
                    if (results[1].isFulfilled()) {
                        notfoundstore = results[1].value()
                    }

                    callback(null)
                }).catch(function(err) {
                    if (err) {
                        var today = new Date().toString()
                        fs.appendFile('./logs/errors.log', '\n' + today + cat + err, function(err) {});
                    }
                    callback(null)
                })
            },
            function(callback) {
                scrapeItem(url).then(function(items) {
                    callback(null, items, stores)
                }).catch(function(err) {
                    callback(err)
                })
            },
            function(items, stores, callback) {
                getInventory(items, stores).then(function(items) {
                    callback(null, items, stores)
                }).catch(function(err) {
                    callback(err)
                })
            },
            function(items, stores, callback) {
                async.eachSeries(items, function iterator(item, cb) {
                    if (!item.name) {
                        item.name = 'item'
                    }
                    upload.uploadPicture('macys_' + item.name.replace(/\s/g, '_'), item.imageUrl).then(function(image) {
                        item.hostedImages = [image]
                        cb()
                    }).catch(function(err) {
                        if (err) console.log('Image upload error: ', err);
                        cb()
                    })
                }, function finished(err) {
                    if (err) {
                        console.log('Images upload error: ', err)
                    }
                    callback(null, items)
                })
            },
            function(items, callback) {
                saveItems(items, stores).then(function(items) {
                    callback(null, items)
                }).catch(function(err) {
                    console.log(err)
                    callback(err)
                })
            }
        ], function(err, items) {
            if (err) {
                var today = new Date().toString()
                fs.appendFile('./logs/errors.log', '\n' + today + ' Category: ' + cat + '\n' + err, function(err) {
                    console.log('Error 62: ', err)
                    return reject(err)
                });
            }
            if (items) {
                console.log('finished scraping. saved item count: ', items.length)
                resolve()
            } else if (!items) {
                console.log('No items saved.', items)
                reject()
            }


        });

    })
}

function loadMongoObjects() {
    var user = db.Users.findOne({
        'profileID': 'macys101'
    }).exec();
    var store = db.Landmarks.findOne({
        'id': 'notfound_9999'
    }).exec();
    return Promise.settle([user, store]).then(function(arry) {
        var u = arry[0];
        var s = arry[1];
        if (u.isFulfilled()) {
            owner.profileID = u.profileID
            owner.name = u.name;
            owner.mongoId = u._id
        }
        if (s.isFulfilled()) {
            notfoundstore = s
        }
        return arry;
    })
}

function scrapeItem(url) {
    return new Promise(function(resolve, reject) {
        var newItems = []; //multiple colors for item == multiple items
        var latestColor;
        var options = {
            url: url,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13'
            }
        };

        request(options, function(error, response, body) {
            if ((!error) && (response.statusCode == 200)) {
                $ = cheerio.load(body);
                var prices = [];
                for (var key in $('div.standardProdPricingGroup>span')) {
                    if ($('div.standardProdPricingGroup>span').hasOwnProperty(key) && $('div.standardProdPricingGroup>span')[key].children && $('div.standardProdPricingGroup>span')[key].children[0] && $('div.standardProdPricingGroup>span')[key].children[0].data) {
                        // console.log('*****',$('div.standardProdPricingGroup>span')[key].children[0].data)
                        var price = parseFloat($('div.standardProdPricingGroup>span')[key].children[0].data.split('$')[1])
                        prices.push(price)
                    }
                }
                var price = prices.reduce(function(a, b, i, arr) {
                    return Math.min(a, b)
                });
                var itemObjects = [];
                var imageElements = JSON.parse(body.toString().split('MACYS.pdp.primaryImages[')[1].split('= ')[1].split('};')[0].concat('}'));
                var imgBaseURL = 'http://slimages.macysassets.com/is/image/MCY/products/';
                var parentProductId = body.toString().split('MACYS.pdp.productId = ')[1].split(';')[0].replace(/[^\w\s]/gi, '');
                var categoryId = body.toString().split('MACYS.pdp.categoryId = ')[1].split(';')[0];
                var productDetail = body.toString().split('productDetail": ')[1].split('</script>')[0];
                productDetail = JSON.parse(productDetail.substring(0, productDetail.length - 2));
                var totalInventory = JSON.parse(body.toString().split('MACYS.pdp.upcmap["')[1].split('=')[1].split(']')[0].concat(']'));
                // console.log('totalInventory: ', totalInventory);

                // http://www1.macys.com/api/store/v2/stores/9,10,1380,940,8,21,442?upcNumber=772084647777&_fields=name,locationNumber,inventories,schedule,address,attributes

                for (var key in imageElements) {
                    if (imageElements.hasOwnProperty(key)) {
                        var item = {
                            parentProductId: parentProductId,
                            name: productDetail.name.concat(' ' + key),
                            price: price,
                            categoryId: categoryId,
                            title: productDetail.title,
                            imageUrl: imgBaseURL.concat(imageElements[key]),
                            categoryName: productDetail.categoryName,
                            inStock: productDetail.inStock,
                            regularPrice: productDetail.regularPrice,
                            salePrice: productDetail.salePrice
                        }
                        var inventory = [];
                        var upcNumbers = []
                        totalInventory.forEach(function(itemType) {
                            if (itemType.color.trim() == key.trim()) {
                                inventory.push(itemType)

                                upcNumbers.push(itemType.upc)
                            }
                        })
                        item.inventory = inventory
                        item.upcNumbers = upcNumbers
                        itemObjects.push(item)
                    }
                }


                // console.log('itemObjects: ',JSON.stringify(itemObjects));
                resolve(itemObjects)


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


function getInventory(items, Stores) {
    return new Promise(function(resolve, reject) {
        var storeIds = Stores.map(function(store) {
            return store.source_generic_store.id
        })
        var finalItems = []
        async.eachSeries(items, function iterator(item, finishedItem) {
            item.storeIds = []
            console.log('For item :', item.name)
            async.eachSeries(item.upcNumbers, function iterator(upcNumber, finishedSku) {
                console.log('Querying upc number...', upcNumber)
                var url = 'http://www1.macys.com/api/store/v2/stores/' + storeIds.join() + '?upcNumber=' + upcNumber + '&_fields=name,locationNumber,inventories,schedule,address,attributes'
                var options = {
                    url: url,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13'
                    }
                };
                // console.log('URL: ', url)
                request(options, function(error, response, body) {
                    if ((!error) && (response.statusCode == 200)) {
                        body = JSON.parse(body);
                        body.stores.store.forEach(function(store) {
                            item.storeIds.push(store.address.id)
                        })
                        console.log('Found ', item.storeIds.length, ' stores.')
                        setTimeout(function() {
                            finishedSku()
                        }, 800);
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


            }, function(err) {
                if (err) console.log('238', err)
                item.storeIds = _.uniq(_.flatten(item.storeIds))
                console.log('Finished item!', item.name)
                finalItems.push(item)

                finishedItem()
            })

        }, function(err) {
            if (err) console.log('279: ', err)
            console.log('***Finished all ze items!!!!')
                // fs.appendFile('./logs/test.js', JSON.stringify(finalItems), function(err) {});
            resolve(finalItems)

        });
    });
}

function saveItems(items, stores) {
    return new Promise(function(resolve, reject) {
        var savedItems = []
        async.eachSeries(items, function(item, callback) {
                var updatedInv = updateInventory(item.physicalStores, stores)
                if (updatedInv[0] == null) {
                    console.log('Item parents and locations property lengths dont match up, skipping: ', updatedInv)
                    return callback()
                }

                if (updatedInv[0].length < 1 || updatedInv[1].length < 1) {
                    updatedInv[0] = [notfoundstore._id]
                    updatedInv[1] = [notfoundstore.loc.coordinates]
                }

                //Check if this item exists
                db.Landmarks.findOne({
                    'source_generic_item.name': item.name,
                    'source_generic_item.productId': item.productId,
                    'linkbackname': 'urbanoutfitters.com'
                }, function(err, match) {
                    if (err) {
                        console.log('394: ', err)
                        return callback()
                    }

                    if (!match || (match && match.itemImageURL[0].indexOf('s3.amazonaws.com') == -1)) {
                        //Create new item for each store in inventory list.
                        var i = new db.Landmark();
                        i.parents = updatedInv[0];
                        i.loc.coordinates = updatedInv[1];
                        i.world = false;
                        i.source_generic_item = item;
                        delete i.source_generic_item.physicalStores;
                        i.price = parseFloat(item.price);
                        i.itemImageURL = item.hostedImages;
                        i.name = item.name;
                        i.owner = owner;
                        i.linkback = item.src;
                        i.linkbackname = 'urbanoutfitters.com';
                        var tags = i.name.split(' ').map(function(word) {
                            return word.toString().toLowerCase()
                        });
                        tags = tags.concat(item.tags);
                        tags.forEach(function(tag) {
                            i.itemTags.text.push(tag)
                        });
                        i.itemTags.text.push('Urban Outfitters')
                        i.itemTags.text.push(item.color)
                        try {
                            i.itemTags.text = tagParser.parse(i.itemTags.text)
                        } catch (err) {
                            console.log('tagParser error: ', err)
                        }
                        i.itemTags.text.push(cat)
                        i.hasloc = true;
                        i.loc.type = 'MultiPoint';
                        if (!i.name) {
                            i.name = 'UO'
                        }
                        uniquer.uniqueId(i.name, 'Landmark').then(function(output) {
                                i.id = output;
                                //If item was previously scraped without the description tags, delete the old one then save the new one
                                if ((match && !match.source_generic_item.tags)) {
                                    db.Landmarks.remove({
                                        'id': match.id
                                    }, function(err, res) {
                                        if (err) console.log('437', err)
                                            //Save item
                                        i.save(function(e, item) {
                                            if (e) {
                                                console.log('441: ', e);
                                            }
                                            savedItems.push(item)
                                            console.log('Saved: ', item.id)
                                            return callback();
                                        })
                                    })

                                } else {
                                    //Otherwise just save the new one
                                    i.save(function(e, item) {
                                        if (e) {
                                            console.log('452: ', e);
                                        }
                                        savedItems.push(item)
                                        console.log('Saved: ', item.id)
                                        return callback();
                                    })
                                }
                            }) //end of uniquer

                    } else if (match) {
                        // console.log('Scenario 2')

                        db.Landmarks.findOne({
                            '_id': match._id,
                            'linkbackname': 'urbanoutfitters.com'
                        }).update({
                            $set: {
                                'parents': updatedInv[0],
                                'loc.coordinates': updatedInv[1],
                                'updated_time': new Date()
                            }
                        }, function(e, result) {
                            if (e) {
                                console.log('Inventory update error: ', e)
                            }
                            console.log('Updated inventory for item:', match.id, result)
                            callback()
                        })

                    }
                })

            }, function(err) {
                if (err) {
                    console.log('Error in saveItems: ', err)
                    return reject(err)
                }
                resolve(savedItems)
            }) //end of outer series

    })
}


function updateInventory(inventory, Stores) {

    if (!inventory || inventory == null || inventory.length && inventory.length == 0) {
        return [
            [notfoundstore._id],
            [notfoundstore.loc.coordinates]
        ]
    }
    var inventoryStoreIds = inventory.map(function(store) {
        return store.storeId.toString().trim()
    })
    var inventoryStoreString = inventoryStoreIds.join()
    var inventoryParentIds = [];
    Stores.forEach(function(store) {
        if (inventoryStoreString.indexOf(store.source_generic_store.storeId.toString().trim()) > -1) {
            inventoryParentIds.push(store._id)
        }
    })
    var inventoryParentIdsString = inventoryParentIds.join()
    var updatedLocs = [];
    Stores.forEach(function(store) {
        if (inventoryParentIdsString.indexOf(store._id) > -1)
            updatedLocs.push(store.loc.coordinates)
    })
    if (inventoryParentIds.length !== updatedLocs.length) {
        console.log('Lengths dont match up:', inventoryParentIds, updatedLocs)
        return [null, null]
    } else {
        return [inventoryParentIds, updatedLocs]
    }
}


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

function getParameterByName(name, url) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(url);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}