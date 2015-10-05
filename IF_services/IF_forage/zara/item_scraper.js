//TODO:
//1. Double check catalog var names for errors, is it completing all of them 
//2. Find out max number of stores for inventory check

//NY stores
// 3074,3818,3037,1260,3946,303,3036
//SF stores
//3611,3441
//LA stores
//6493,3723,3844,3985,3805,3612
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

//Global var to hold fake user object
owner = {}
    //TODO: Count number of new items saved
saveCount = 0;
//TODO: Updatecount
updateCount = 0;

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
                    loadFakeUser().then(function(items) {
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
                        if (items && items.length > 0) {
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
                // || (match && match.itemImageURL[0].indexOf('s3.amazonaws.com') == -1)
                function(existingItem, callback) {
                    if (!exists || (exists && existingItem.itemImageURL[0].indexOf('s3.amazonaws.com') == -1)) {
                        //The || is for the case in which item was previously scraped but without AWS images
                        if (exists) {
                            exists = !exists
                                // console.log('Removing existing item to be updated.')
                                //remove outdated item, this doesn't need to happen async
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
                    getInventory(item, stores).then(function(inventory) {
                        callback(null, item, inventory)
                    }).catch(function(err) {
                        callback(err)
                    })
                },
                function(item, inventory, callback) {
                    if (item.partNumber == undefined || item.partNumber == null || !item.partNumber) {
                       return callback('Partnumber missing from zara API query.')
                    }
              
                    upload.uploadPictures('zara_' + item.partNumber.trim() + item.name.replace(/\s/g, '_'), item.images).then(function(images) {
                        item.hostedImages = images
                        callback(null, item, inventory)
                    }).catch(function(err) {
                        if (err) console.log('Image upload error: ', err);
                        callback(err)
                    })
                },
                function(item, inventory, callback) {
                    processItems(inventory, item).then(function(item) {
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
            .populate('parents')
            .exec(function(e, items) {
                if (items) {
                    // console.log('Item exists.',items.length)
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
            },
            'linkbackname': 'zara.com'
        }, function(e, stores) {
            if (e) {
                console.log(e)
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


function getInventory(itemData, stores) {

    //We switch var Item reference depending on whether this is a whole new item or an existing one in the db.
    var Item = !exists ? itemData : itemData.source_generic_item
        //Map-out storeIds out of array to use in URL query below.
        // var storeIds = stores.map(function(obj) {
        //     return obj.source_generic_store.storeId
        // })

    var storeIds = [3074, 3818, 3037, 1260, 3946, 303, 3036, 3611, 3441, 6493, 3723, 3844, 3985, 3805, 3612]

    // http://itxrest.inditex.com/LOMOServiciosRESTCommerce-ws/common/1/stock/campaign/I2015/product/part-number/15517003004?physicalStoreId=3036,3037,3074,3818,1260,303,3946&ajaxCall=true
    return new Promise(function(resolve, reject) {
        // var apiUrl = 'http://itxrest.inditex.com/LOMOServiciosRESTCommerce-ws/common/1/stock/campaign/I2015/product/part-number/02398310800?physicalStoreId=' + storeIds.join() + '&ajaxCall=true';
        var apiUrl = 'http://itxrest.inditex.com/LOMOServiciosRESTCommerce-ws/common/1/stock/campaign/' + Item.campaign + '/product/part-number/' + Item.partNumber + '?physicalStoreId=' + storeIds.join() + '&ajaxCall=true'
        var options = {
            url: apiUrl,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13'
            }
        };
        // console.log('apiURL: ',apiUrl)
        request(options, function(error, response, body) {
            if ((!error) && (response.statusCode == 200)) {
                body = JSON.parse(body)
                if (!body.stocks) {
                    console.log('No stocks.')
                }
                var inventory = body.stocks
                    // console.log('INVENTORY: ',JSON.stringify(inventory))
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
        //If this item has already been scraped, update inventory,parents, and location fields of item.
        if (exists) {

            // console.log('itemData.parents',itemData)

            var inventoryStoreIds = inventory.map(function(store) {
                return store.physicalStoreId.toString().trim()
            })
            var inventoryString = inventoryStoreIds.join()
            if (!itemData.parents) {
                console.log('This item has no parents!', itemData._id)
                return reject('This item has no parents!')
            }
            var dbStoreIds = itemData.parents.map(function(store) {
                return store.source_generic_store.storeId
            })

            var updatedParents = itemData.parents.filter(function(store) {
                return inventoryString.indexOf(store.source_generic_store.storeId) > -1
            })

            var updatedParentMongoIds = updatedParents.map(function(store) {
                return store._id
            })

            var updatedLocs = [];

            updatedParents.forEach(function(store) {
                updatedLocs.push(store.loc.coordinates)
            })

            db.Landmarks.findOne({
                '_id': itemData._id
            }).update({
                $set: {
                    'source_generic_item.inventory': inventory,
                    'parents': updatedParentMongoIds,
                    'loc.coordinates': updatedLocs
                }
            }, function(e, result) {
                if (e) {
                    console.log('Inventory update error: ', e)
                }
                console.log('Updated inventory for item.')
                return resolve('Finished updating inventory.')
            })

        } //end of if item exists

        //If item has not been scraped, create a new item 
        if (!exists) {
            //Create new item for each store in inventory list.
            var i = new db.Landmark();
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

                                if (i.loc.coordinates.length < 1) {
                                    return reject('Item is out of stock in all stores in db:', i.id)
                                }
                                //Save item
                                i.save(function(e, item) {
                                    if (e) {
                                        console.error(e);
                                    }
                                    console.log('Saved!', item.id)
                                    saveCount++
                                    resolve(item)
                                })
                            }) //end of async.eachSeries
                }) //end of uniquer
        } //end of if not exists
    })
}