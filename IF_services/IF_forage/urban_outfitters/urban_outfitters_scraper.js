var http = require('http');
var cheerio = require('cheerio');
// var db = require('db');
var Promise = require('bluebird');
var async = require('async');
// var uniquer = require('../../uniquer');
var request = require('request');
var urlapi = require('url');
var _ = require('underscore');

var Stores = []
var url = 'http://www.urbanoutfitters.com/urban/catalog/productdetail.jsp?id=33749656&category=W-ADIDAS';

// http://www.urbanoutfitters.com/urban/catalog/availability_include_store_json.jsp?country=US&distance=50&selectedColor=054&skuId=32175697&zipCode=10002
// skuId ---> need to iterate through all sku based on size (or what is the main URL sku??)


async.waterfall([
    // function(callback) {
    //     checkIfScraped(url).then(callback(null,url)).catch(function(err) {
    //         callback(err)
    //     })
    // },
    function(callback) {
        scrapeItem(url).then(function(item) {
            callback(null, item)
        }).catch(function(err) {
            callback(err)
        })
    },
    function(item, callback) {
        cloneItems(item).then(function(items) {
            console.log('Items: ', items[0].physicalStores[0])
            callback(null, items)
        }).catch(function(err) {
            callback(err)
        })
    },
    function(items, callback) {
        saveStores(items).then(function(item) {
            callback(null, item)
        }).catch(function(err) {
            callback(err)
        })
    }
    // function(item, inventory, callback) {
    //     updateInventory(inventory, item).then(function(item) {
    //         callback(null, item)
    //     }).catch(function(err) {
    //         callback(err)
    //     })
    // },

    // function(item, callback) {
    //     saveItems(item).then(function(items) {
    //         callback(null, items)
    //     }).catch(function(err) {
    //         callback(err)
    //     })
    // }
], function(err, items) {
    if (err) {
        console.log(err)
    }
    //console.log('finished scraping item!!', items)
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


function scrapeItem(url) {
    return new Promise(function(resolve, reject) {

        // var queryURL = url.substring(url.lastIndexOf("/") + 1).split('?')[0]; //get product ID from URL
        // queryURL =  //use ID to query for item

        // console.log();

        //console.log(queryURL);
        var newItems = []; //multiple colors for item == multiple items
        //construct newItem object
        // var newItem = {
        //     src: url, 
        //     images: [],
        //     colors: []
        // };
        var latestColor;

        var options = {
            url: 'http://www.urbanoutfitters.com/api/v1/product/' + getParameterByName('id') + '',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13'
            }
        };
        request(options, function(error, response, body) {
            if ((!error) && (response.statusCode == 200)) {

                //console.log(body);
                body = JSON.parse(body);

                for (var i = 0; i < body.product.skusInfo.length; i++) { //get all the skuIDs

                    newItems[i] = { //make new item object in array of items
                        name: body.product.skusInfo[i].description + ' ' + body.product.skusInfo[i].color,
                        src: url,
                        skuId: body.product.skusInfo[i].skuId, //used to query for inventory  (this is a UNIQUE id for each color/size of each item)
                        productId: body.product.skusInfo[i].productIds[0], //the parent id for the item (use this just for getting image URLs below)
                        price: body['product']['skusInfo'][0]['priceLists'][0]['salePrice'], //might not be super accurate if there are price changes on some items based on garment size
                        color: body.product.skusInfo[i].color,
                        colorId: body.product.skusInfo[i].colorId,
                        size: body.product.skusInfo[i].size,
                        sizeId: body.product.skusInfo[i].sizeId,
                        physicalStores: []
                    }

                    if (body.product.skusInfo.length == i + 1) {
                        getImages();
                    }
                }

                function getImages() {

                    for (var i = 0; i < body['product']['colors'].length; i++) { //looping through colors (each color is another item to add to DB)

                        var collectedImages = []; //viewcodes are used to display correct image in series (collect all viewcodes to know pics available for each color of each item)

                        for (var z = 0; z < body['product']['colors'][i]['viewCode'].length; z++) { //looping through the viewcodes to get all images for each color

                            //collecting images for each item color based on viewcodes (photo angles)
                            collectedImages.push('http://images.urbanoutfitters.com/is/image/UrbanOutfitters/' + body['product']['colors'][i].id + '_' + body['product']['colors'][i]['viewCode'][z] + '?$mlarge$&defaultImage=');

                            if (body['product']['colors'][i]['viewCode'].length == z + 1) { //end of for loop for this item viewcode count
                                var imgsToObjs = _.filter(newItems, function(obj) {
                                    return obj.colorId == body['product']['colors'][i].colorCode
                                }); //find the items in our newItems array to add our images to (based on color)
                                for (var x = 0; x < imgsToObjs.length; x++) { //iterate through _.filter results to find all items that match current color code
                                    imgsToObjs[x].images = collectedImages; //push collectedImages to each item that matches color
                                }
                            }
                        }

                        //END OF LOOP, MOVE ON NOW to getting inventory
                        if (body['product']['colors'].length == i + 1) {
                            if (newItems[0].productId) { //if there's at least one item in array that has a productId
                                resolve(newItems); //go to inventory query
                            } else {
                                console.log('missing params', newItem);
                                reject('missing params')
                            }
                        }
                    }
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


function cloneItems(newItems) {
    return new Promise(function(resolve, reject) {

        var postalcode = '66006'; //iterate through all zipcodes? chose this one because we can probably querying whole USA with this lat lng in center of map
        var radius = '6000'; //max is 6000 miles i think? so like...the whole USA? looks like it works :)
        //var physicalStores = [];
        //var colorIdsTemp = [];

        async.eachSeries(newItems, function iterator(item, callback) {

            var url = 'http://www.urbanoutfitters.com/urban/catalog/availability_include_store_json.jsp?country=US&distance=' + radius + '&selectedColor=' + item.colorId + '&skuId=' + item.skuId + '&zipCode=' + postalcode + '';
            var options = {
                url: url,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13'
                }
            };

            // console.log('URL', url)

            request(options, function(error, response, body) {
                if ((!error) && (response.statusCode == 200)) {
                    body = JSON.parse(body);
                    item.physicalStores = body.stores; //put store results in each item object

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

            setTimeout(function() {
                callback()
            }, 800); //slowly collecting stores that carry item cause there's a rate limiter on the API

        }, function(err, res) {

            var finalItems = [];
            var currentColorId = '';
            var iterateCheck = 0;

            var colorItemObjs = _.groupBy(newItems, 'colorId'); //group items by colorId

            for (var key in colorItemObjs) {

                for (var z = 0; z < colorItemObjs[key].length; z++) {

                    //ADD TO CURRENT ITEM BY COLOR
                    if (colorItemObjs[key][z].colorId == currentColorId) {

                        finalItems[iterateCheck].sizeIds.push({ //store the sizes for each product / color
                            skuId: colorItemObjs[key][z].skuId,
                            size: colorItemObjs[key][z].size,
                            sizeId: colorItemObjs[key][z].sizeId
                        });

                        if (colorItemObjs[key][z].physicalStores) { //add stores for additional item sizes if there are results
                            for (var x = 0; x < colorItemObjs[key][z].physicalStores.length; x++) {
                                finalItems[iterateCheck].physicalStores.push(colorItemObjs[key][z].physicalStores[x]);
                            }
                        }
                    }
                    //CREATE NEW ITEM BY COLOR
                    else {

                        currentColorId = colorItemObjs[key][z].colorId; //update currentColorId with latest color in array

                        var newItem = { //create final items (there's a better way to do this with underscore =_=)
                            productId: colorItemObjs[key][z].productId,
                            name: colorItemObjs[key][z].name,
                            price: colorItemObjs[key][z].price,
                            color: colorItemObjs[key][z].color,
                            colorId: colorItemObjs[key][z].colorId,
                            src: colorItemObjs[key][z].src,
                            sizeIds: [],
                            images: colorItemObjs[key][z].images,
                            physicalStores: []
                        };

                        newItem.sizeIds.push({ //store the sizes for each product / color
                            skuId: colorItemObjs[key][z].skuId,
                            size: colorItemObjs[key][z].size,
                            sizeId: colorItemObjs[key][z].sizeId
                        });

                        if (colorItemObjs[key][z].physicalStores) { //add stores if there are results
                            for (var x = 0; x < colorItemObjs[key][z].physicalStores.length; x++) {
                                newItem.physicalStores.push(colorItemObjs[key][z].physicalStores[x]);
                            }
                        }

                        //create new item
                        finalItems.push(newItem); //add final item by color (will contain all sizes and skuIDs per size)
                    }
                }

                iterateCheck++;

                //ON FINAL Z LOOP END
                if (Object.keys(colorItemObjs).length == iterateCheck) { //fake async
                    finalOutput(finalItems);
                }

            }

            function finalOutput(finalItems) {
                finalItems.forEach(function(item) {
                    item.physicalStores.forEach(function(store) {
                            store.storeId = store.link.indexOf('/id=')[1]
                        })
                        //Remove duplicates
                    item.physicalStores = _.uniq(item.physicalStores, 'storeId');
                    item.physicalStores = _.uniq(item.physicalStores, 'storeName');
                })
                return resolve(finalItems)
            }


        });

    });
}


function saveItems(newItem) {
    return new Promise(function(resolve, reject) {
        var savedItems = []
        async.eachSeries(Stores, function(store, callback) {
            var i = new db.Landmark();
            i.source_zara_item = newItem;
            i.world = false;
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




function saveStores(items) {
    return new Promise(function(resolve, reject) {
        var storeIds = []
        var count = 0
        async.each(items, function(item, callback) {
            var store = item.physicalStores[count]

            db.Landmarks
                .findOne({
                    'source_generic_store.storeId': store.storeId,
                    'linkbackname': 'nordstrom.com'
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



function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(url);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}