
var request = require('request');
var cheerio = require('cheerio');
var db = require('db');
var Promise = require('bluebird');
var async = require('async');
var uniquer = require('../../uniquer');
var tagParser = require('../tagParser');
var _ = require('lodash')
var fs = require('fs')
var upload = require('../../upload')

//Global vars to hold default mongo objects
owner = {}
notfoundstore = {}

module.exports = function scrapeItem(url) { 
    categoryName = url.split('/')[6]
        //set global var to indicate category based on catalog url
    if (url.toString().trim().indexOf('/woman') > -1) {
        category = 'womens'
    } else if (url.toString().trim().indexOf('/trf') > -1) {
        category = 'trf'
    } else if (url.toString().trim().indexOf('/man') > -1) {
        category = 'mens'
    } else if (url.toString().trim().indexOf('/girl') > -1) {
        category = 'girls'
    } else if (url.toString().trim().indexOf('/boy') > -1) {
        category = 'boys'
    } else if (url.toString().trim().indexOf('/baby-girl') > -1) {
        category = 'baby-girls'
    } else if (url.toString().trim().indexOf('/baby-boy') > -1) {
        category = 'baby-boys'
    } else if (url.toString().trim().indexOf('/mini') > -1) {
        category = 'mini'
    }

    //Flag if item exists
    exists = false;

    return new Promise(function(resolve, reject) {

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
                                // fs.appendFile('errors.log', '\n' + today + ' Category: ' + categoryName + category + err, function(err) {});
                        }
                        callback(null)
                    })
                },
                function(callback) {
                    checkIfScraped(url).then(function(items) {
                        // console.log(2,items)
                        if (items && items.length > 0) {
                            // console.log('Item exists', items[0].itemImageURL[0])
                            exists = true;
                            existingItem = items[0]; //proxy var for later processing
                            callback(null, existingItem)
                        } else {
                            callback(null, null)
                        }
                    }).catch(function(err) {
                        callback(err)
                    })
                },
                function(existingItem, callback) {
                    if (!exists || (exists && existingItem.itemImageURL[0].indexOf('s3.amazonaws.com') == -1)) {
                        //The || is for the case in which item was previously scraped but without AWS images
                        if (exists) {
                            exists = !exists
                                //Remove outdated item, this doesn't need to happen sync
                            db.Landmarks.remove({
                                'id': existingItem.id
                            })
                        }
                        scrapeDetails(url).then(function(item) {
                            callback(null, item)
                        }).catch(function(err) {
                            callback(err)
                        })
                    } else {
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
                    var CA = [3611, 3441, 6493, 3723, 3844, 3985, 3805, 3612, 3613]
                    var NY = [3074, 3818, 3037, 1260, 3946, 303, 3036]
                    var totalInventory = [];
                    async.waterfall([
                        function(cb) {
                            getInventory(item, CA).then(function(inventory) {
                                totalInventory = totalInventory.concat(inventory)
                                cb(null, totalInventory)
                            }).catch(function(err) {
                                cb(err)
                            })
                        },
                        function(totalInventory, cb) {
                            getInventory(item, NY).then(function(inventory) {
                                totalInventory = totalInventory.concat(inventory)
                                cb(null, totalInventory)
                            }).catch(function(err) {
                                cb(err)
                            })
                        }
                    ], function(err, totalInventory) {
                        if (err) {
                            console.log('Inventory error: ', err)
                            return callback(err)
                        }
                        // console.log('Total Inventory is : ', totalInventory)
                        callback(null, item, totalInventory, stores)
                    });


                },
                function(item, inventory, stores, callback) {
                    // console.log(6)
                    if (!exists) {
                        upload.uploadPictures('zara_' + item.partNumber.trim() + item.name.replace(/\s/g, '_'), item.images).then(function(images) {
                            // console.log(6.5)
                            item.hostedImages = images
                            callback(null, item, inventory, stores)
                        }).catch(function(err) {
                            // console.log(6.9)
                            if (err) console.log('Image upload error: ', err);
                            callback(err)
                        })
                    } else {
                        callback(null, item, inventory, stores)
                    }

                },
                function(item, inventory, stores, callback) {
                    // console.log(7)
                    processItems(inventory, item, stores).then(function(item) {
                        // console.log(8)
                        callback(null, item)
                    }).catch(function(err) {
                        callback(err)
                    })
                }
            ],
            function(err, item) {
                if (err) {
                    var today = new Date().toString()
                        // fs.appendFile('errors.log', '\n' + today + ' Category: ' + categoryName + category + '\n' + err, function(err) {
                    console.log(err)
                    return reject(err)
                };
                resolve()
            });
    })
}


function loadMongoObjects() {

    var user = db.Users.findOne({
        'profileID': 'zara1204'
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

function checkIfScraped(url) {
    // first check if we have already scraped this thing
    return new Promise(function(resolve, reject) {
        db.Landmarks
            .find({
                'source_generic_item.src': url.toString().trim()
            })
            .sort({
                '_id': -1
            })
            .populate('parents')
            .exec(function(e, items) {
                if (items) {
                    if (items.length > 1) {
                        console.log('Total items found.',items.length)
                        var toDelete = []
                        for (var i = 1; i < items.length; i++) {
                            toDelete.push(items[i]._id)
                        }
                        db.Landmarks.remove({
                            '_id': {
                                $in: toDelete
                            }
                        }, function(err, res) {
                            if (err) console.log(err)
                            console.log('Deleted old items: ', toDelete)
                        })
                    }
                    return resolve(items)
                }
                if (!items) {
                    return resolve()
                }
                if (e) {
                    //if some mongo error happened here just pretend it doesn't exist and go ahead with the process
                    return resolve()
                }
            })
    })
}

function scrapeDetails(url) {

    return new Promise(function(resolve, reject) {
        //construct newItem object
        var newItem = {
            src: url,
            images: [],
            inventory: [],
            color: '',
            description: '',
            tags: []
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

                //description
                var description = $('p.description>span')
                if (description && description.length > 0) {
                    // console.log('DESCRIPTION!!', description[0].children[0].data)
                    newItem.description = description[0].children[0].data
                    var dtags = newItem.description.split(' ')
                    newItem.tags = tagParser.parse(dtags)
                }

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

                if ($('div.colors div.imgCont')['0']) {
                    newItem.color = $('div.colors div.imgCont')['0'].attribs.title
                }

                //iterate on images found in HTML
                $('img.image-big').each(function(i, elem) {
                    if (elem.attribs) { //check for attributes
                        if (i == 0) { //grab item details on first iteration since it's the same for each image in series (except for last image for some reason) (is this a good idea? probably not!)

                            //LOOP THROUGH ALL THE THUMBNAILS
                            //EACH COLOR HAS A DIFFERENT 
                            newItem.partNumber = elem.attribs['sb-id']; //used by Inditex API
                            newItem.campaign = elem.attribs['data-ref'].split('-')[1]; //ID after '-' is the campaign code, used by Inditex API
                            newItem.name = elem.attribs['data-name'];
                            newItem.category = elem.attribs['data-category'];
                            newItem.type = category

                            //Create a bool to exclude kids and baby items from searchability for now
                            var acceptableCategories = 'womens,mens,trf'
                            if (acceptableCategories.indexOf(newItem.type) == -1) {
                                newItem.searchable = false;
                            } else {
                                newItem.searchable = true;
                            }
                        }
                        if (elem.attribs['data-src']) {
                            newItem.images.push('https:' + elem.attribs['data-src'].split('?')[0]); //push images to array after removing URL params
                        }
                    }
                });

                if (newItem.price) {
                    resolve(newItem)
                } else {
                    console.log('Missing params, possibly blocked by Zara. Try switching IP.');
                    reject('Missing params.')
                }
            } else {
                if (error) {
                    console.log(error.lineNumber + ': ', error)
                    reject(error)
                } else if (response.statusCode !== 200) {
                    console.log('Error response status: ', response.statusCode)
                    reject(response.statusCode)
                }
            }
        })

    })
}

//Here we load all the zara stores in the db (there are only 54 in the US so not a big resource drain) 
//in order to match them as parent worlds to each item/store pair in the inventory list.
function loadStores() {
    return new Promise(function(resolve, reject) {


        db.Landmarks.find({
            'source_generic_store': {
                $exists: true
            },
            'linkbackname': 'zara.com'
        }, function(e, stores) {
            if (e) {
                console.log(e.lineNumber + e)
                reject(e)
            }
            if (!stores) {
                reject('No stores in db.')
            }
            if (stores) {
                // console.log(stores.length,' ZARA STORES IN DB')
                resolve(stores)
            }
        })


    })
}

// var apiUrl = 'http://itxrest.inditex.com/LOMOServiciosRESTCommerce-ws/common/1/stock/campaign/I2015/product/part-number/02398310800?physicalStoreId=' + storeIds.join() + '&ajaxCall=true';
// http://itxrest.inditex.com/LOMOServiciosRESTCommerce-ws/common/1/stock/campaign/I2015/product/part-number/15517003004?physicalStoreId=3036,3037,3074,3818,1260,303,3946&ajaxCall=true
function getInventory(item, ids) {
    // console.log('Calling getInventory for stores: ', ids)
        //We switch var Item reference depending on whether this is a whole new item or an existing one in the db.
    var Item = !exists ? item : item.source_generic_item

    return new Promise(function(resolve, reject) {
        var apiUrl = 'http://itxrest.inditex.com/LOMOServiciosRESTCommerce-ws/common/1/stock/campaign/' + Item.campaign + '/product/part-number/' + Item.partNumber + '?physicalStoreId=' + ids.join() + '&ajaxCall=true'
        var options = {
            url: apiUrl,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13'
            }
        };
        // console.log('apiURL: ', apiUrl)
        request(options, function(error, response, body) {
            if ((!error) && (response.statusCode == 200)) {
                body = JSON.parse(body)

                var inventory = body.stocks
                    // console.log('INVENTORY: ',JSON.stringify(inventory))
                resolve(inventory)
            } else {
                if (error) {
                    console.log(error.lineNumber + ': ', error)
                    reject(error)
                } else {
                    console.log('Bad response')
                    reject('Bad response from inventory request')
                }
            }
        })

    })
}

function processItems(inventory, itemData, Stores) {

    return new Promise(function(resolve, reject) {

        //If this item has already been scraped, update inventory,parents, and location fields of item.
        if (exists) {
            if (!inventory || inventory.length < 1 || inventory == null) {
                console.log('No inventory found for this item.', itemData.id)
                inventory = []
            }

            if (!itemData.parents) {
                console.log('This item has no parents!', itemData._id)
                return reject('This item has no parents.')
            }

            var updatedInv = updateInventory(inventory, Stores)

            if (updatedInv[0] == null) {
                console.log('Item parents and locations property lengths dont match up, skipping: ', updatedInv)
                return reject('Item parents and locations property lengths dont match up, skipping item.')
            }

            if (updatedInv[0].length < 1 || updatedInv[1].length < 1) {
                updatedInv[0] = [notfoundstore._id]
                updatedInv[1] = [notfoundstore.loc.coordinates]
            }

            db.Landmarks.findOne({
                '_id': itemData._id
            }).update({
                $set: {
                    'source_generic_item.inventory': inventory,
                    'parents': updatedInv[0],
                    'loc.coordinates': updatedInv[1],
                    'updated_time': new Date()
                }
            }, function(e, result) {
                if (e) {
                    console.log('Inventory update error: ', e)
                }
                console.log('Finished updating inventory.')
                return resolve()
            })

        } //end of if item exists

        //If item has not been scraped, create a new item 
        if (!exists) {

            if (!inventory || inventory.length < 1 || inventory == null) {
                console.log('No inventory found for this item.', itemData.id)
                inventory = []
            }

            //Create new item for each store in inventory list.
            var i = new db.Landmark();
            i.parents = [notfoundstore._id]
            i.loc.coordinates = [notfoundstore.loc.coordinates]
            i.world = false;
            i.source_generic_item = itemData;
            i.hasloc = true;
            i.price = parseFloat(itemData.price);
            i.itemImageURL = itemData.hostedImages;
            i.name = itemData.name;
            i.owner = owner;
            i.linkback = itemData.src;
            i.linkbackname = 'zara.com';
            var tags = i.name.split(' ')
            tags = tags.concat(itemData.tags)
            tags.forEach(function(tag) {
                i.itemTags.text.push(tag)
            })
            i.itemTags.text.push('zara')
            i.itemTags.text.push(itemData.type)
            i.itemTags.text.push(itemData.color)
            i.itemTags.text = tagParser.parse(i.itemTags.text)
            if (tagParser.colorize(itemData.color)) {
                i.itemTags.colors.push(tagParser.colorize(itemData.color))
            }
            i.source_generic_item.inventory = inventory
            if (!itemData.name) {
                itemData.name = 'Zara'
            }
            uniquer.uniqueId(itemData.name, 'Landmark').then(function(output) {
                    i.id = output;
                    //Update location property for item with location of each store found in inventory.
                    async.eachSeries(inventory, function(store, callback) {
                                db.Landmarks.findOne({
                                    'source_generic_store.storeId': store.physicalStoreId.toString().trim()
                                }, function(err, s) {
                                    if (err) {
                                        console.log(err)
                                        return callback()
                                    }
                                    if (!s) {
                                        //The parent store doesn't exist in db, skip this store for now.
                                        console.log('Cannot find store in db: ', store.physicalStoreId)
                                        return callback()
                                    } else if (s) {
                                        // console.log('Found store coords: ',s.loc)
                                        i.parents.push(s._id)
                                        i.loc.coordinates.push(s.loc.coordinates)
                                        callback()
                                    }
                                })
                            },
                            function(e) {
                                if (e) {
                                    console.log(e)
                                }

                                //Save item
                                i.save(function(e, item) {
                                    if (e) {
                                        console.log(e);
                                    }
                                    console.log('Saved!', item.id)
                                    resolve(item)
                                })
                            }) //end of async.eachSeries
                }) //end of uniquer
        } //end of if not exists
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
        return store.physicalStoreId.toString().trim()
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