var cheerio = require('cheerio');
var db = require('db');
var Promise = require('bluebird');
var async = require('async');
var uniquer = require('../../uniquer');
var request = require('request');
//Global var to hold fake user object
owner = {}

module.exports = function scrapeItem(url) {

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
                    loadFakeUser().then(function(items) {
                        callback(null)
                    }).catch(function(err) {
                        callback(null)
                    })
                },
                function(callback) {
                    checkIfScraped(url).then(function(items) {
                        if (items && items.length > 0) {
                            exists = true;
                            existingItems = items; //proxy var for later processing
                            callback(null, items)
                        } else {
                            callback(null, null)
                        }
                    }).catch(function(err) {
                        callback(err)
                    })
                },
                function(existingItems, callback) {
                    if (!exists) {
                        scrapeDetails(url).then(function(item) {
                            callback(null, item)
                        }).catch(function(err) {
                            callback(err)
                        })
                    } else if (exists) {
                        callback(null, existingItems)
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
                    processItems(inventory, item).then(function(savedItems) {
                        callback(null, savedItems)
                    }).catch(function(err) {
                        callback(err)
                    })
                }
            ],
            function(err, items) {
                if (err) {
                    console.log(err)
                    reject(err)
                }
                if (!exists) {}

                resolve()
            });
    })
}


function loadFakeUser() {
    return new Promise(function(resolve, reject) {
        db.Users
            .findOne({
                'profileID': 'zara1204'
            }).exec(function(e, o) {
                if (o) {
                    owner.profileID = o.profileID
                    owner.name = o.name;
                    owner.mongoId = o._id
                    resolve()
                }
                if (!o) {
                    var fake = new db.User()
                    fake.name = 'Zara'
                    fake.profileID = 'zara1204'
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

function checkIfScraped(url) {
    // first check if we have already scraped this thing
    return new Promise(function(resolve, reject) {
        db.Landmarks
            .find({
                'source_generic_item.src': url.toString().trim()
            })
            .exec(function(e, items) {
                if (items) {
                    existing = true
                    return resolve(items)
                }
                if (!items) {
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


function scrapeDetails(url) {
    return new Promise(function(resolve, reject) {
        //construct newItem object
        var newItem = {
            src: url,
            images: [],
            inventory: [],
            color: ''
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

                if ($('div.colors div.imgCont')) {
                    newItem.color = $('div.colors div.imgCont')['0'].attribs.title
                }

                //iterate on images found in HTML
                $('img.image-big').each(function(i, elem) {
                    if (elem.attribs) { //check for attributes
                        if (i == 0) { //grab item details on first iteration since it's the same for each image in series (except for last image for some reason) (is this a good idea? probably not!)
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

//Here we load all the zara stores in the db (there are only 54 in the US so not a big resource drain) 
//in order to match them as parent worlds to each item/store pair in the inventory list.
function loadStores() {
    return new Promise(function(resolve, reject) {
        db.Landmarks.find({
            'source_generic_store': {
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


function getInventory(itemData, stores) {

    //We switch var Item reference depending on whether this is a whole new item or an existing one in the db.
    var Item = !exists ? itemData : itemData[0].source_generic_item
        //Map-out storeIds out of array to use in URL query below.
    var storeIds = stores.map(function(obj) {
        return obj.source_generic_store.storeId
    })

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
                    console.log('No stocks.')
                }
                var inventory = body.stocks
                resolve(inventory)
            } else {
                if (error) {
                    console.log('getInventory error ')
                    reject(error)
                } else {
                    console.log('bad response')
                    reject('Bad response from inventory request')
                }
            }
        })

    })
}

function processItems(inventory, itemData) {

    return new Promise(function(resolve, reject) {
        if (!inventory && inventory.length < 1) {
            return reject('No inventory found for this item. Aborting.')
        }
        //If this item has already been scraped, just update inventory of items in db.
        if (exists) {
            async.eachSeries(itemData, function(item, callback) {
                async.eachSeries(inventory, function(store, callback2) {
                    if (item.source_generic_item.storeId == store.physicalStoreId) {
                        //Use sizeStocks property in inventory item if it exists, top-level if not. 
                        var query = store.sizeStocks ? store.sizeStocks : store;
                        //Update items inventory info
                        item.update({
                            $set: {
                                'source_generic_item.inventory': query
                            }
                        }, function(e, result) {
                            if (e) {
                                console.log('Inventory update error: ', e)
                                count++
                                return callback()
                            }
                            console.log('Updated inventory for store: ', store.physicalStoreId)
                            count++
                            callback()
                        })
                    } else {
                        callback2()
                    }
                }, function(err) {
                    callback()
                })
            }, function(err) {
                // console.log('Finished updating inventory.')
                resolve('Finished updating inventory.')
            })
        } //end of if item exists

        //If item has not been scraped, create a new item in db for each store in inventory list
        if (!exists) {
            var savedItems = []
            var count = 0;
            async.eachSeries(inventory, function(store, callback) {
                        //Create new item for each store in inventory list.
                        var i = new db.Landmark();
                        i.source_generic_item = itemData;
                        i.price = parseFloat(itemData.price);
                        i.itemImageURL = itemData.images;
                        i.name = itemData.name;
                        i.owner = owner;
                        i.linkback = itemData.src;
                        i.linkbackname = 'zara.com'
                        var tags = i.name.split(' ').map(function(word) {
                            return word.toString().toLowerCase()
                        })
                        i.itemTags.text.push('zara')
                        tags.forEach(function(tag) {
                            i.itemTags.text.push(tag)
                        })
                        i.itemTags.text.push(itemData.type)
                        i.itemTags.colors.push(itemData.color)

                        i.source_generic_item.storeId = store.physicalStoreId.toString().trim();
                        if (store.sizeStocks) {
                            i.source_generic_item.inventory = store.sizeStocks;
                        } else {
                            i.source_generic_item.inventory = store
                        }

                        i.hasloc = true;
                        i.loc.type = 'Point'
                        uniquer.uniqueId(itemData.name, 'Landmark').then(function(output) {
                                i.id = output;
                                db.Landmarks.findOne({
                                    'source_generic_store.storeId': store.physicalStoreId.toString().trim()
                                }, function(err, s) {
                                    if (err) {
                                        console.log(err)
                                        count++
                                        return callback()
                                    }
                                    if (!s) {
                                        //The parent store doesn't exist in db, skip this item for now.
                                        // console.log('Store in list doesnt exist in the db: ', store.physicalStoreId)
                                        console.log('missing id: ', store.physicalStoreId)
                                        count++
                                        return callback()
                                    }
                                    //Check if the store with storeId exists in db
                                    else if (s) {
                                        // console.log('Found store!')
                                        i.loc.coordinates[0] = parseFloat(s.loc.coordinates[0]);
                                        i.loc.coordinates[1] = parseFloat(s.loc.coordinates[1]);
                                        i.parent.mongoId = s._id;
                                        if (s.name) {
                                            i.parent.name = s.name;
                                        } else {
                                            i.parent.name = s.id
                                        }

                                        i.parent.id = s.id;
                                    }
                                    //Save item
                                    i.save(function(e, item) {
                                        if (e) {
                                            console.error(e);
                                        }
                                        savedItems.push(item)
                                        // console.log('Saved ', ite)
                                        count++
                                        callback();
                                    })
                                })
                            }) //end of uniquer
                    },
                    function(e) {
                        if (e) {
                            console.log('If item not exists async each error: ', e)
                        }
                        console.log('Saved ',savedItems.length,' items.')
                        resolve(savedItems)
                    }) //end of async.eachSeries
        } //end of if not exists
    })
}