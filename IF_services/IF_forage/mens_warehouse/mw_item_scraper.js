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

module.exports = function(url, category, zipcode) {
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
                function(callback) {
                    scrapeItem(url).then(function(item) {
                        wait(function() {
                            callback(null, item)
                        }, 3000)
                    }).catch(function(err) {
                        callback(err)
                    })
                },
                function(item, callback) {
                    getLatLong(zipcode).then(function(coords) {
                        callback(null, item, coords)
                    }).catch(function(err) {
                        callback(err)
                    })
                },
                function(item, coords, callback) {
                    getInventory(item, coords).spread(function(items, stores) {
                        callback(null, items, stores)
                    }).catch(function(err) {
                        callback(err)
                    })
                },
                function(items, stores, callback) {
                    saveStores(items, stores).spread(function(items, stores) {
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


function scrapeItem(url) {
    return new Promise(function(resolve, reject) {
        var newItems = [];
        var options = {
            url: url,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13'
            }
        };
        request(options, function(error, response, body) {
            if ((!error) && (response.statusCode == 200)) {
                $ = cheerio.load(body); //load HTML
                var itemCountLoop = 0; //used to compare num items to current loop
                var itemCount = 0;

                // $('p.help-links a.flat-btn').each(function(i, elem) {
                //     if (elem.attribs && elem.attribs.href && elem.attribs.href.indexOf('catalogId') > -1 && elem.attribs.href.indexOf('storeId') > -1) {
                //         var catalogId = elem.attribs.href.split('?')[1].split('=')[1].split('&')[0]
                //     }
                // })

                // console.log('CatalogId: ',catalogId)

                //initial count of num of items to collect
                $('div').each(function(i, elem) {
                    if (elem.attribs && elem.attribs.id && elem.attribs.id.indexOf('current_') > -1) {
                        itemCountLoop++;
                    }
                });
                //iterate on images found in HTML
                $('div').each(function(i, elem) {
                    if (elem.attribs) {
                        if (elem.attribs.id) {
                            if (elem.attribs.id.indexOf('current_') > -1) {

                                //console.log('current_ ',elem.children[0].data);
                                if (elem.children[0].data.length > 5) {
                                    //NEW ITEM CREATED (BY COLOR)
                                    var itemCollect = {
                                        sizeIds: [],
                                        images: [],
                                        physicalStores: []
                                    };
                                    // itemCollect.storeId = (storeId) ? storeId : null;
                                    // itemCollect.catalogId = catalogId ? catalogId : null;
                                    newItems.push(itemCollect);
                                    newItems[itemCount].itemPartNumbersMap = elem.children[0].data;
                                }
                            } else if (elem.attribs.id.indexOf('detail_') > -1) {

                                if (elem.children[0].data.length > 5) { //prevent false positive data

                                    if (elem.children[0].data.length < 70) { //filter data glitch
                                        var detailObj = elem.children[0].next.next.data.replace('",', '{ ProdDetail:{'); //fixing glitchy data incoming from mens warehouse
                                    } else {
                                        var detailObj = elem.children[0].data; //no data glitch, proceed
                                    }

                                    newItems[itemCount].parentProductId = eval("(" + detailObj + ")").ProdDetail.parentProductId; //get parent product ID
                                    newItems[itemCount].src = eval("(" + detailObj + ")").ProdDetail.SocialURL; //get parent product ID

                                    ////////// EXTRACT TAGS //////////
                                    var details = eval("(" + detailObj + ")").ProdDetail.details.split("|"); //from details
                                    if (eval("(" + detailObj + ")").ProdDetail.longDesc) {
                                        var longDesc = eval("(" + detailObj + ")").ProdDetail.longDesc.split(" "); //from longDescription
                                    } else {
                                        var longDesc = ['']; //no longDesc
                                    }
                                    var tagMerge = details.concat(longDesc);
                                    tagMerge = details.concat(longDesc).join(" ");

                                    newItems[itemCount].tags = getNoneStopWords(tagMerge); //add tags to newItem
                                    newItems[itemCount].tags = eliminateDuplicates(newItems[itemCount].tags);

                                    //remove STOP words from: 
                                    // http://stackoverflow.com/questions/6686718/javascript-code-to-filter-out-common-words-in-a-string
                                    function getNoneStopWords(sentence) {
                                        var common = getStopWords();
                                        var wordArr = sentence.match(/\w+/g),
                                            commonObj = {},
                                            uncommonArr = [],
                                            word, i;
                                        for (i = 0; i < common.length; i++) {
                                            commonObj[common[i].trim()] = true;
                                        }
                                        for (i = 0; i < wordArr.length; i++) {
                                            word = wordArr[i].trim().toLowerCase();
                                            if (!commonObj[word]) {
                                                uncommonArr.push(word);
                                            }
                                        }
                                        return uncommonArr;
                                    }

                                    function getStopWords() {
                                        return ["free", "stand", "features", "adds", "full", "extra", "featuring", "up", "upper", "details", "detail", "down", "featuring", "featuring", "look", "interior", "exterior", "multiple", "single", "a", "able", "about", "across", "after", "all", "almost", "also", "am", "among", "an", "and", "any", "are", "as", "at", "be", "because", "been", "but", "by", "can", "cannot", "could", "dear", "did", "do", "does", "either", "else", "ever", "every", "for", "from", "get", "got", "had", "has", "have", "he", "her", "hers", "him", "his", "how", "however", "i", "if", "in", "into", "is", "it", "its", "just", "least", "let", "like", "likely", "may", "me", "might", "most", "must", "my", "neither", "no", "nor", "not", "of", "off", "often", "on", "only", "or", "other", "our", "own", "rather", "said", "say", "says", "she", "should", "since", "so", "some", "than", "that", "the", "their", "them", "then", "there", "these", "they", "this", "tis", "to", "too", "twas", "us", "wants", "was", "we", "were", "what", "when", "where", "which", "while", "who", "whom", "why", "will", "with", "would", "yet", "you", "your", "ain't", "aren't", "can't", "could've", "couldn't", "didn't", "doesn't", "don't", "hasn't", "he'd", "he'll", "he's", "how'd", "how'll", "how's", "i'd", "i'll", "i'm", "i've", "isn't", "it's", "might've", "mightn't", "must've", "mustn't", "shan't", "she'd", "she'll", "she's", "should've", "shouldn't", "that'll", "that's", "there's", "they'd", "they'll", "they're", "they've", "wasn't", "we'd", "we'll", "we're", "weren't", "what'd", "what's", "when'd", "when'll", "when's", "where'd", "where'll", "where's", "who'd", "who'll", "who's", "why'd", "why'll", "why's", "won't", "would've", "wouldn't", "you'd", "you'll", "you're", "you've"];
                                    }
                                    //http://stackoverflow.com/questions/9751413/removing-duplicate-element-in-an-array
                                    function eliminateDuplicates(arr) {
                                        var i, len = arr.length,
                                            out = [],
                                            obj = {};
                                        for (i = 0; i < len; i++) {
                                            obj[arr[i]] = 0;
                                        }
                                        for (i in obj) {
                                            out.push(i);
                                        }
                                        return out;
                                    }
                                    ///////////////////////////////////////

                                    var imageURL = eval("(" + detailObj + ")").ProdDetail.ProdFullImage;
                                    newItems[itemCount].images.push('http://images.menswearhouse.com/is/image/TMW/' + imageURL + '?$40Zoom$'); //get parent product ID

                                    //GET IMAGES
                                    //http://images.menswearhouse.com/is/image/TMW/MW40_726F_03_PRONTO_BLUE_COGNAC_SET?$40Zoom$
                                    //MW40_726F_03_PRONTO_BLUE_COGNAC_SET


                                    readItemPartNumbers(); //parse item parts

                                }

                            } else if (elem.attribs.id.indexOf('swatches_') > -1) {

                                //console.log('swatches_ ',elem.children[0].data);

                            } else if (elem.attribs.id.indexOf('sizes_') > -1) {

                                //console.log('sizes_ ',elem.children[0].data);

                                if (elem.children[0].data.length > 5) { //prevent false positive data
                                    newItems[itemCount].sizeMap = eval("(" + elem.children[0].data + ")").sizeMap; //blah blah JS container or smthing
                                    readProductSizes();
                                }

                            } else if (elem.attribs.id.indexOf('pdpprices_') > -1) {


                                if (elem.children[0].data.length > 5) {
                                    newItems[itemCount].price = eval("(" + elem.children[0].data + ")").PriceDetail.regListPrice; //get item price
                                    if (!newItems[itemCount].price) { //get this price if the other one doesn't exist (backup)
                                        newItems[itemCount].price = eval("(" + elem.children[0].data + ")").PriceDetail.regOfferPrice;
                                    }
                                }

                                //console.log('pdpprices_ ',elem.children[0].data);
                                itemCount++; //SHOULD GO LAST IN LOOP, used to select index in newItems array

                                //ALL ITEMS ARE COLLECTED, NOW MOVE ON TO INVENTORY
                                if (itemCount == itemCountLoop) {
                                    if (newItems[0]) {
                                        //console.log(newItems);
                                        resolve(newItems);
                                    } else {
                                        console.log('missing params', newItems[0]);
                                        reject('missing params');
                                    }
                                }
                            }
                        }
                    }
                });

                function readItemPartNumbers(productId) {
                    var dataString = newItems[itemCount].itemPartNumbersMap;
                    var pairs = dataString.split("|");
                    var partNumbers = [];
                    for (var j in pairs) {
                        var nvp = pairs[j].split(" ");

                        //MISSING ONE ITEM IN PartNumberMap !!!
                        if (nvp.length == 2 && nvp[0] && nvp[1]) {
                            newItems[itemCount].sizeIds.push({ //add item + part numbers to itemCollect
                                itemNumber: nvp[0],
                                partNumber: nvp[1]
                            });
                        }
                    }
                    newItems[itemCount].name = eval("(" + newItems[itemCount].itemPartNumbersMap + ")").cmProdInfo.shortDesc; //get the short description from itempartnummap
                }


                function readProductSizes(productId) {
                    var sizeMap = {};
                    var sizes = newItems[itemCount].sizeMap.xSizes.split("|");
                    for (var i in sizes) {
                        var s = sizes[i].split("_");
                        if (s && s[0] && s[1] && s[2]) {
                            var sizeType = s[0];
                            var sizeDesc = s[1];
                            var itemId = s[2];
                            sizeMap[itemId] = {
                                size: sizeDesc,
                                isBT: (sizeType.indexOf("BIG") != -1)
                            }
                        }
                    }
                    //match sizeMap to sizeIds
                    for (var i in newItems[itemCount].sizeIds) {
                        var itemNumber = newItems[itemCount].sizeIds[i].itemNumber;
                        if (sizeMap['' + newItems[itemCount].sizeIds[i].itemNumber + ''] && sizeMap['' + newItems[itemCount].sizeIds[i].itemNumber + ''].size) {
                            var sizeName = sizeMap['' + newItems[itemCount].sizeIds[i].itemNumber + ''].size;
                            newItems[itemCount].sizeIds[i].sizeName = sizeName;
                        }
                    }
                }

            } else {
                if (error) {
                    console.log('error: ', error)
                } else if (response.statusCode !== 200) {
                    console.log('response.statusCode: ', response.statusCode);
                }
            }
        })
    })
}


function getInventory(newItems, coords) {
    return new Promise(function(resolve, reject) {
        var storesToSave = []
        async.eachSeries(newItems, function iterator(item, callback) {
            async.eachSeries(item.sizeIds, function iterator(sizeItem, callback2) {
                var radius = 200; //TODO: Test if this is max radius
                var url = 'http://www.menswearhouse.com/StoreLocatorInventoryCheck?catalogId=12004&langId=-1&storeId=12751&distance=' + radius + '&latlong=' + parseFloat(coords[1]) + ',' + parseFloat(coords[0]) + '&partNumber=' + sizeItem.partNumber + ''; //note: you can get a list of all stores by lat lng by removing the partNumber val
                // console.log('Inventory URL: ', url)
                var options = {
                    url: url,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13'
                    }
                };
                request(options, function(error, response, body) {
                    if ((!error) && (response.statusCode == 200)) {
                        sizeItem.physicalStores = eval("(" + body + ")").result; //put store results in each item object
                        storesToSave.push(eval("(" + body + ")").result)
                        for (var x in eval("(" + body + ")").result) {
                            item.physicalStores.push(eval("(" + body + ")").result[x]);
                        }
                    } else {
                        if (error) {
                            console.log('getinventory error ', error)
                            reject(error)
                        } else {
                            console.log('bad response')
                            reject('Bad response from inventory request')
                        }
                    }
                });
                setTimeout(function() {
                    callback2()
                }, 800);
            }, function(err, res) {
                if (err) console.log('378', err)
                item.physicalStores = _.uniq(item.physicalStores, 'stlocId'); //remove duplicate physical stores
                setTimeout(function() {
                    callback()
                }, 800); //slowly collecting stores that carry item cause there's a rate limiter on the API
            });
        }, function(err, res) {
            if (err) console.log(err)
            storesToSave = _.flatten(storesToSave);
            storesToSave = _.uniq(storesToSave, 'stlocId');
            //DONE GETTING ALL SIZES FOR ALL ITEMS AND COLORS
            //******* DATA NOTES *********
            //******* physicalStores = list of stores that carry this item
            //******* parentProductId = unique Id parent for all item colors and sizes. use this to check if the item was scraped 
            resolve([newItems, storesToSave])
        });
    });
}


function saveStores(items, stores) {
    return new Promise(function(resolve, reject) {
        var Stores = [];
        // console.log('stores', stores.length)
        async.eachSeries(stores, function(store, callback) {
            db.Landmarks.findOne({
                    'source_generic_store.stlocId': store.stlocId,
                    'linkbackname': 'menswearhouse.com'
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
                        newStore.name = 'Mens Wearhouse ' + store.address.storeName
                        newStore.linkbackname = 'menswearhouse.com';
                        newStore.addressString = store.address.address1 + ' ' + store.address.address2 + ' ' + store.address.city + ' ' + store.address.state + ' ' + store.address.country + ' ' + store.address.zipcode
                        newStore.tel = store.address.phone;
                        newStore.world = true;
                        newStore.hasloc = true;
                        newStore.loc.type = 'Point'
                        newStore.loc.coordinates = [parseFloat(store.address.latlong.split(',')[1]), parseFloat(store.address.latlong.split(',')[0])]
                        uniquer.uniqueId(newStore.name, 'Landmark').then(function(output) {
                            newStore.id = output;
                            //Save store
                            newStore.save(function(e, s) {
                                if (e) {
                                    console.error(e);
                                }
                                console.log('Saved store!', s.id)
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
            //Now delete extraneous info from physicalStores and sizeIds properties
            items.forEach(function(item) {
                    item.sizeIds.forEach(function(part) {
                        part.availableStores = []
                        if (part.physicalStores !== null && part.physicalStores !== undefined) {
                            part.physicalStores.forEach(function(store) {
                                Stores.forEach(function(dbStore) {
                                    if (store.stlocId == dbStore.source_generic_store.stlocId) {
                                        store.mongoId = dbStore._id
                                    }
                                })
                                part.availableStores.push(store.mongoId)
                            })
                            delete part.physicalStores;
                        }
                    })
                    item.inventory = item.sizeIds
                    delete item.sizeIds
                    delete item.physicalStores
                    delete item.itemPartNumbersMap;
                })
                // fs.appendFile('items.js', JSON.stringify(items), function(err) {
                //     if (err) throw err;
                // });
            resolve([items, Stores])
        })
    })
}



function saveItems(items, Stores) {
    return new Promise(function(resolve, reject) {
        //Variable to hold existing Items to update inventory later
        var Items = [];
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
        items.forEach(function(item) {
            sizeInventory.push(item.inventory)
        })
        async.eachSeries(items, function iterator(item, callback) {
            //Check if item already exists
            db.Landmarks.findOne({
                'source_generic_item.parentProductId': item.parentProductId,
                'name': item.name,
                'linkbackname': 'menswearhouse.com'
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
                    newItem.price = parseFloat(item.price);
                    newItem.owner = owner;
                    newItem.world = false;
                    newItem.hasloc = true;
                    newItem.name = item.name
                    newItem.linkback = item.src;
                    newItem.linkbackname = 'menswearhouse.com';
                    newItem.itemImageURL = item.images;
                    newItem.itemTags.text.push('menswearhouse')

                    var nametags = newItem.name.split(' ').map(function(word) {
                        return word.toString().toLowerCase()
                    })
                    nametags.forEach(function(tag) {
                        newItem.itemTags.text.push(tag)
                    })
                    newItem.source_generic_item.tags.forEach(function(tag) {
                        newItem.itemTags.text.push(tag)
                    })
                    newItem.itemTags.text = tagParser.parse(newItem.itemTags.text)
                    delete newItem.source_generic_item.tags
                    delete newItem.source_generic_item.physicalStores
                    uniquer.uniqueId('menswearhouse ' + newItem.name, 'Landmark').then(function(output) {
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
                    Items.push(i);
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
                            'source_generic_item.inventory': {
                                $each: sizeInventory
                            },
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
                        // console.log('Updated inventory.', i)
                        callback()
                    })
                }
            })

        }, function(err) {
            if (err) {
                console.log('Inventory update error: ', e)
            }
            // console.log('Updated inventory.', i)
            return resolve(Items)
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
                console.log('682', err)
                return callback()
            }
            if (!stores) {
                console.log('Stores not found!')
                return callback()
            } else if (stores) {
                stores.forEach(function(store) {
                    if (distance(store.loc.coordinates[1], store.loc.coordinates[0], parseFloat(coords[1]), parseFloat(coords[0]), 'K') < 325) {
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
                    var inv = []
                    storesToRemove.forEach(function(store) {
                        inv.concat(store.source_generic_store.inventory)
                    })
                    inv = _.flatten(inv)
                    inv = _.uniq(inv, 'partNumber')
                    console.log('Updating ',items.length)
                    async.eachSeries(items, function iterator(item, callback) {
                        db.Landmarks.update({
                            'source_generic_item.parentProductId': item.parentProductId,
                            'name': item.name,
                            'linkbackname': 'menswearhouse.com'
                        }, {
                            $pullAll: {
                                'parents': storesToRemove,
                                'source_generic_item.inventory': inv,
                                'loc.coordinates': locs
                            }
                        }, function(err, res) {
                            if (err) console.log('726', err)
                            if (res) {
                                console.log('Updated operation for ', item.id, '\nResult: ', res.nModified)
                                callback()
                            }
                        })
                    }, function(err) {
                        if (err) {
                            console.log(err)
                        }
                        return resolve()
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