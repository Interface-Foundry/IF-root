// TODO: Getting blocked, figure out header changing system - Check out line 433

var http = require('http');
var cheerio = require('cheerio');
var db = require('db');
var Promise = require('bluebird');
var async = require('async');
var uniquer = require('../../uniquer');
var urlify = require('urlify').create({
    addEToUmlauts: true,
    szToSs: true,
    spaces: "_",
    nonPrintable: "_",
    trim: true
});
var request = require('request');
var states = require('../zara/states');
//Global var to hold category
cat = '';
//Global var to hold fake user object
owner = {};

module.exports = function(url, category) {

    cat = category;

    return new Promise(function(resolve, reject) {

        stateIndex = 0;
        currentState = states[stateIndex]
        notFoundCount = 0;

        async.whilst(
            function() {
                return states[stateIndex]
            },
            function(loop) {

                var query = {
                    'state': currentState
                }

                db.Zipcodes.find(query).then(function(zips) {
                    var count = 0;
                    console.log('\nCurrent state: ' + currentState)
                    async.whilst(
                        function() {
                            return count <= zips.length
                        },
                        function(cb) {
                            //Load owner user 
                            loadFakeUser().then(function() {
                                    //For each zipcode
                                    async.eachSeries(zips, function(zip, finishedZipcode) {
                                            zipcode = zip.zipcode
                                            getColorUrls(url).then(function(colorUrls) {
                                                    if (!colorUrls) {
                                                        colorUrls = []
                                                        colorUrls[0] = url
                                                    }
                                                    //For each color available for item
                                                    async.eachSeries(colorUrls, function(url, finishedItem) {
                                                            console.log('Scraping>>>', url)
                                                                //Process Item
                                                            async.waterfall([
                                                                        function(callback) {
                                                                            scrapeItem(url).then(function(item) {
                                                                                wait(function() {
                                                                                    callback(null, item, zipcode)
                                                                                }, 3000)

                                                                            }).catch(function(err) {
                                                                                callback(err)
                                                                            })
                                                                        },
                                                                        function(item, zipcode, callback) {
                                                                            getInventory(item, zipcode).then(function(inventory) {
                                                                                // console.log('hitting this?',inventory)
                                                                                callback(null, item, inventory)
                                                                            }).catch(function(err) {
                                                                                callback(err)
                                                                            })
                                                                        },
                                                                        function(item, inventory, callback) {
                                                                            saveStores(item, inventory).then(function(stores) {
                                                                                callback(null, item, stores)
                                                                            }).catch(function(err) {
                                                                                callback(err)
                                                                            })
                                                                        },
                                                                        function(item, stores, callback) {
                                                                            saveItems(item, stores).then(function(items) {
                                                                                callback(null, item, stores)
                                                                            }).catch(function(err) {
                                                                                callback(err)
                                                                            })
                                                                        },
                                                                        function(item, stores, callback) {
                                                                            getLatLong(zipcode).then(function(coords) {
                                                                                callback(null, item, stores, coords)
                                                                            }).catch(function(err) {
                                                                                callback(err)
                                                                            })
                                                                        },
                                                                        function(item, stores, coords, callback) {
                                                                            updateInventory(item, stores, coords).then(function() {
                                                                                callback(null, item)
                                                                            }).catch(function(err) {
                                                                                callback(err)
                                                                            })
                                                                        }
                                                                    ],
                                                                    function(err) {
                                                                        if (err) console.log(err)
                                                                        finishedItem()
                                                                    }) //end of async waterfall processing item

                                                        }, function(err) {
                                                            if (err) {
                                                                console.log(err)
                                                            }
                                                            //Prematurely ejects states if no new stores found after 15 zipcode searches to save time
                                                            if (notFoundCount >= 50) {
                                                                notFoundCount = 0;
                                                                return cb('Finished ' + currentState + '.')
                                                            }
                                                            count++
                                                            finishedZipcode()
                                                        }) //end of each series for colors


                                                }).catch(function(err) {
                                                    console.log(err)
                                                    cb()
                                                }) // end of getColors

                                        },
                                        function(err) {
                                            if (err) {
                                                console.log(err);
                                            } else {
                                                cb('Done with state.')
                                            }
                                        });

                                }).catch(function(err) {
                                    console.log('Could not load owner user.')

                                }) //end of load user
                        },
                        function(err) {
                            if (err) {
                                console.log(err);
                            }
                            stateIndex++;
                            if (states[stateIndex]) {
                                currentState = states[stateIndex]
                                console.log('Next state..')
                                loop()
                            } else {
                                console.log('Finished all states!')
                                return resolve()
                            }
                        });
                })
            },
            function(err) {
                if (err) console.log(err)

                resolve()
            })
    })
}

function loadFakeUser() {
    return new Promise(function(resolve, reject) {
        db.Users
            .findOne({
                'profileID': 'nordstrom4201'
            }).exec(function(e, o) {
                if (o) {
                    owner.profileID = o.profileID
                    owner.name = o.name;
                    owner.mongoId = o._id
                    resolve()
                }
                if (!o) {
                    var fake = new db.User()
                    fake.name = 'Nordstrom'
                    fake.profileID = 'nordstrom4201'
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

function getColorUrls(url) {
    return new Promise(function(resolve, reject) {
        var colorUrls = [];
        var colors = [];
        var results = []
        var searchString = url.split('/s/')[1].split('/')[0];
        var searchUrl = 'http://shop.nordstrom.com/sr?origin=keywordsearch&contextualcategoryid=0&keyword=' + searchString
        var baseUrl = 'http://shop.nordstrom.com'
        var options = {
            url: searchUrl,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13'
            }
        };

        request(options, function(error, response, body) {
            if ((!error) && (response.statusCode == 200)) {

                $ = cheerio.load(body); //load HTML

                var obj = $('div.search-results-right-container a');
                var clr = $('li.selected a')

                //Gather all available selected colors
                for (var i in clr) {
                    if (clr[i].attribs && clr[i].attribs.title) {
                        colors.push(clr[i].attribs.title)
                    }
                }

                //Here we filter out items with no selected color 
                // for (var key in obj) {
                //     if (obj[key].attribs && obj[key].attribs.title && obj[key].attribs['aria-selected']) {
                //         // console.log(obj[key].attribs)
                //         if (obj[key].attribs['aria-selected'] == 'True') {
                //             // .closest('.fashion-display')
                //             // console.log(obj[key].parent.parent.parent.parent.children[1])
                //         }
                //     }
                // }

                for (var key in obj) {

                    if (obj[key].attribs && obj[key].attribs.href && obj[key].attribs.href.indexOf('/s/') > -1 && obj[key].attribs.href.indexOf('#reviewTabs') == -1) {
                        var newUrl = baseUrl + obj[key].attribs.href
                            // console.log(newUrl)
                        colorUrls.push(newUrl)
                    }


                }

                console.log('Found ' + colorUrls.length + ' colors for this item.')



                // if (colorUrls.length > colors.length) {
                //     console.log('colors: ', colors, '\n colorUrls: ', colorUrls)
                // }


                for (var i = 0; i < colors.length; i++) {

                    var object = {
                        color: colors[i],
                        url: colorUrls[i]
                    }
                    results.push(object)
                }
                // console.log('done')
                if (colorUrls.length > 0) {
                    resolve(colorUrls)
                } else {
                    resolve()
                }



            } else {
                if (error) {
                    console.log('error: ', error)
                } else if (response.statusCode !== 200) {
                    console.log('response.statusCode: ', response.statusCode);
                }
                reject()
            }
        })

    })
}



function scrapeItem(url) {
    return new Promise(function(resolve, reject) {
        //construct newItem object
        var newItem = {
            src: url,
            images: []
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

                // var colors = [];

                // $('div#color-buttons button.option-label img').each(function(i, elem) {
                //     colors.push(elem.attribs.alt)
                // })

                // newItem.colors = colors;

                //iterate on images found in HTML
                $('img').each(function(i, elem) {
                    if (elem.attribs) {
                        if (elem.attribs.src) { //sort the two types of images to collect
                            if (elem.attribs.src.indexOf("/product/Mini") > -1) { //finding all images that have Mini (all images to scrape)         
                                var s = elem.attribs.src.replace("Mini", "Large"); //get the bigger one
                                newItem.images.push(s);
                            }
                        }
                    }
                });

                //////////Construct item name from Brand Name + Product Name /////////////
                var brandName = '';
                //get brand name
                $("section[id='brand-title']").map(function(i, section) {
                    for (var i = 0; i < section.children.length; i++) {
                        if (section.children[i].name == 'h2') {
                            brandName = section.children[i].children[0].children[0].data;
                        }
                    }
                });
                //get product name
                $("section[id='product-title']").map(function(i, section) {
                    for (var i = 0; i < section.children.length; i++) {
                        if (section.children[i].name == 'h1') {
                            newItem.name = brandName + ' ' + section.children[i].children[0].data; //add brand name + product name together            
                        }
                    }
                });
                //////////////////////////////////////////////////////////////////////////

                //get item price
                $('td').each(function(i, elem) {
                    if (elem.attribs.class.indexOf('item-price') > -1) {
                        newItem.price = elem.children[1].children[0].data.replace(/[^\d.-]/g, ''); //remove dollar sign symbol
                    }
                });

                //get the styleId to query nordstrom server with from the product URL. lastindexof gets item from end of URL. 
                //split('?') kills anything after productID in URL
                newItem.styleId = newItem.src.substring(newItem.src.lastIndexOf("/") + 1).split('?')[0];

                if (newItem.styleId) {
                    resolve(newItem);
                } else {
                    console.log('missing params', newItem);
                    reject('missing params');
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

function getInventory(newItem, zipcode) {
    return new Promise(function(resolve, reject) {
        var radius = '100'; //max is 100 miles
        console.log('zipcode: ', zipcode)
        var url = 'http://shop.nordstrom.com/es/GetStoreAvailability?styleid=' + newItem.styleId + '&type=Style&instoreavailability=true&radius=' + radius + '&postalcode=' + zipcode + '&format=json';
        var options = {
            url: url,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13'
            }
        };

        request(options, function(error, response, body) {
            if ((!error) && (response.statusCode == 200)) {
                body = JSON.parse(body);
                body = JSON.parse(body); //o.m.g. request, just do the double parse and don't ask 
                resolve(body)
            } else {
                if (error) {
                    console.log('getinventory error ')
                    reject(error)
                } else {
                    console.log('bad response')
                    wait(function() {
                        reject('Bad response from inventory request')
                    }, 30000)

                }
            }
        })

    })
}

function saveStores(item, inventory) {
    return new Promise(function(resolve, reject) {
        var Stores = [];
        //bool to increment notFoundCount
        var notFound = true;

        async.eachSeries(inventory["PersonalizedLocationInfo"].Stores, function iterator(item, callback) {
            var newUrl = 'http://shop.nordstrom.com/st/524/directions'
            //524 is storeId
            var url = 'http://test.api.nordstrom.com/v1/storeservice/storenumber/' + item.StoreNumber + '?format=json&apikey=pyaz9x8yd64yb2cfbwc5qd6n';
            var options = {
                url: url,
                headers: {
                    'Accept': '*/*',
                    'Accept-Encoding': 'gzip, deflate, sdch',
                    'Accept-Language': 'en-US,en;q=0.8,ja;q=0.6',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                    // 'Host': 'i.nordstromimage.com',
                    'Pragma': 'no-cache',
                    'Referer': 'http://shop.nordstrom.com/s/volcom-fieldtrip-print-canvas-backpack/4144314?origin=keywordsearch',
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36'
                }
            };

            console.log('url   ',url)

            request(options, function(error, response, body) {

                body = JSON.parse(body);
                console.log('***Body', body)
                if (!body.StoreCollection || !body.StoreCollection[0]) {

                    wait(function() {
                        console.log('Body returned empty results.  Possibly blocked by Nordstrom. Try changing IP.')
                    }, 30000)
                    return callback()
                }
                var storeObj = {
                    storeId: item.StoreNumber,
                    name: body.StoreCollection[0].StoreName,
                    type: body.StoreCollection[0].StoreType,
                    StreetAddress: body.StoreCollection[0].StreetAddress,
                    City: body.StoreCollection[0].City,
                    State: body.StoreCollection[0].State,
                    PostalCode: body.StoreCollection[0].PostalCode,
                    PhoneNumber: body.StoreCollection[0].PhoneNumber,
                    Hours: body.StoreCollection[0].Hours,
                    Lat: body.StoreCollection[0].Latitude,
                    Lng: body.StoreCollection[0].Longitude
                }


                //Construct our own unique storeId 
                uniquer.uniqueId(body.StoreCollection[0].StoreName, 'Landmark').then(function(output) {
                        //Check if store exists in db
                        db.Landmarks.findOne({
                                'source_generic_store.storeId': storeObj.storeId
                            }, function(err, store) {
                                if (err) {
                                    console.log(err)
                                    setTimeout(function() {
                                        return callback()
                                    }, 800);
                                }
                                //If store does not exist in db yet, create it.
                                if (!store) {
                                    var newStore = new db.Landmarks();
                                    newStore.source_generic_store = storeObj;
                                    newStore.addressString = storeObj.StreetAddress.concat(', ' + storeObj.City).concat(', ' + storeObj.PostalCode)
                                    newStore.id = output;
                                    newStore.tel = storeObj.PhoneNumber;
                                    newStore.world = true;
                                    newStore.name = storeObj.name;
                                    newStore.hasloc = true;
                                    newStore.loc.type = 'Point';
                                    newStore.loc.coordinates[0] = storeObj.Lng;
                                    newStore.loc.coordinates[1] = storeObj.Lat;
                                    delete newStore.source_generic_store.Lng;
                                    delete newStore.source_generic_store.Lat
                                    newStore.save(function(e, s) {
                                        if (e) {
                                            console.log('Error saving new store: ', e)
                                        }
                                        console.log('Saved store.', s.id)
                                        notFound = false;
                                        //Push into proxy array for cloning items at the end of eachseries
                                        Stores.push(s)
                                        setTimeout(function() {
                                            return callback()
                                        }, 800);
                                    })
                                }
                                //If store already exists in db
                                else if (store) {
                                    console.log('Store exists.', store.id)
                                    Stores.push(store)
                                    setTimeout(function() {
                                        return callback()
                                    }, 800);
                                }
                            }) //end of findOne
                    }) //end of uniquer
            }); //end of request

        }, function(err, res) {
            if (err) console.log(err)
            if (notFound) {
                notFoundCount++
            }
            resolve(Stores)
        })
    })
}

function saveItems(newItem, Stores) {
    return new Promise(function(resolve, reject) {
        var savedItems = []

        //For each store create an item in db if it does not already exist
        async.eachSeries(Stores, function iterator(store, callback) {
            //Check if there is an item with parent field that is equal to store id in db
            db.Landmarks.findOne({
                $and: [{
                    'source_generic_item.styleId': newItem.styleId
                }, {
                    'parent.mongoId': store._id
                }]
            }, function(err, i) {
                if (err) console.log(err)

                //Create new item in db if it does not already exist
                if (!i) {
                    var item = new db.Landmarks();
                    item.source_generic_item = newItem;
                    item.price = parseFloat(newItem.price);
                    item.owner = owner;
                    item.name = item.source_generic_item.name
                    item.source_generic_item.storeId = store.source_generic_store.storeId;
                    item.linkback = item.source_generic_item.src;
                    item.linkbackname = 'nordstrom.com';
                    item.itemImageURL = item.source_generic_item.images;
                    var tags = item.name.split(' ').map(function(word) {
                        word = word.replace(/\W/g, '')
                        return word.toString().toLowerCase()
                    })
                    tags.forEach(function(tag) {
                            item.itemTags.text.push(tag)
                        })
                        // item.source_generic_item.colors.forEach(function(color) {
                        //     item.itemTags.colors.push(color)
                        // })
                    item.itemTags.text.push('nordstrom')
                    item.itemTags.text.push(cat)
                        //Get rid of blank tags
                    var i = item.itemTags.text.length
                    while (i--) {
                        if (item.itemTags.text[i] == '' || item.itemTags.text[i] == ' ') {
                            item.itemTags.text.splice(i, 1)
                        }
                    }
                    item.parent.mongoId = store._id;
                    item.parent.name = store.name;
                    item.parent.id = store.id;
                    item.name = newItem.name;
                    item.world = false;
                    item.loc.type = 'Point';
                    item.loc.coordinates[0] = store.loc.coordinates[0];
                    item.loc.coordinates[1] = store.loc.coordinates[1];
                    uniquer.uniqueId('nordstrom ' + newItem.name, 'Landmark').then(function(output) {
                        item.id = output;
                        //Save item
                        item.save(function(e, i) {
                            if (e) {
                                console.error(e);
                            }
                            console.log('Saved item!', i.id)
                            savedItems.push(i)
                                // console.log('Saved item', i.name)
                            return callback();
                        })
                    })
                }

                //If item exists in db 
                else if (i) {
                    console.log('Item already exists.', i._id)
                    callback()
                }
            })
        }, function(err) {
            if (err) console.log(err)

            console.log('Saved ', savedItems.length)

            resolve(savedItems)
        });
    })
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

function updateInventory(item, stores, coords) {
    return new Promise(function(resolve, reject) {
        var storeIds = stores.map(function(store) {
                return store.source_generic_store.storeId
            })
            //Remove items from mongo that no longer appear in inventory list for this item style
        db.Landmarks.remove({
            $and: [{
                'source_generic_item.styleId': item.styleId
            }, {
                'loc': {
                    //Since the inventory check for nordstrom only returns results 100 miles within zipcode
                    //We get a central lat long for the current zipcode and run a geowithin 100 miles
                    //Otherwise mongo would remove all items outside the current zip that match the query.
                    $geoWithin: {
                        $centerSphere: [
                            [parseFloat(coords[0]), parseFloat(coords[1])], 103 / 3963.2
                        ]
                    }
                }
            }, {
                'source_generic_item.storeId': {
                    $nin: storeIds
                }
            }]
        }, function(err, res) {
            if (err) reject(err)
            console.log('Removed: ', res.result.n)
            resolve(item)
        })
    })
}


function wait(callback, delay) {
    var startTime = new Date().getTime();
    while (new Date().getTime() < startTime + delay);
    callback();
}