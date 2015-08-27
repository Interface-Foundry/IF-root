var http = require('http');
var cheerio = require('cheerio');
// var db = require('db');
var Promise = require('bluebird');
var async = require('async');
// var uniquer = require('../../uniquer');
var request = require('request');
var UglifyJS = require("uglifyjs");


var Stores = []
var url = 'http://www.menswearhouse.com/mens-clothes/mens-outerwear/modern-fit-trim-outerwear/pronto-blue-modern-fit-moto-jacket-cognac-726F726G03';

async.waterfall([
    // function(callback) {
    //     checkIfScraped(url).then(callback(null,url)).catch(function(err) {
    //         callback(err)
    //     })
    // },
    function(callback) {
        getItem(url).then(function(item) {
            callback(null, item)
        }).catch(function(err) {
            callback(err)
        })
    },
    function(item, callback) {
        getInventory(item).then(function(item) {
            callback(null, item)
        }).catch(function(err) {
            callback(err)
        })
    },
    // function(item, callback) {
    //     getInventory(item).then(function(inventory) {
    //         callback(null, item, inventory)
    //     }).catch(function(err) {
    //         callback(err)
    //     })
    // },
    // function(item, inventory, callback) {
    //     updateInventory(inventory, item).then(function(item) {
    //         callback(null, item)
    //     }).catch(function(err) {
    //         callback(err)
    //     })
    // },
    // function(item, callback) {
    //     saveStores(item).then(function(item) {
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
            images: []
        };

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

                var itemCount = 0;

                //iterate on images found in HTML
                $('div').each(function(i, elem) {
                    if (elem.attribs){

                        //console.log(elem.attribs);
                        if(elem.attribs.id){
                            if (elem.attribs.id.indexOf('current_') > -1){

                                //console.log('current_ ',elem.children[0].data);
                                if (elem.children[0].data.length > 5){
                                    //NEW ITEM CREATED (BY COLOR)
                                    var itemCollect = {
                                        sizeIds: []
                                    };
                                    newItems.push(itemCollect);
                                    console.log(newItems[itemCount]);
                                    newItems[itemCount].itemPartNumbersMap = elem.children[0].data;
                                    console.log('test',newItems);
                                }



                            }
                            else if (elem.attribs.id.indexOf('detail_') > -1){

                               // console.log('detail_ ',elem.children[0].data);

                                itemCollect.parentProductId = elem.children[0].data.parentProductId;
                                readItemPartNumbers(itemCollect.parentProductId);

                            }
                            else if (elem.attribs.id.indexOf('swatches_') > -1){

                                //console.log('swatches_ ',elem.children[0].data);

                            }
                            else if (elem.attribs.id.indexOf('sizes_') > -1){

                                //console.log('sizes_ ',elem.children[0].data);

                                if (elem.children[0].data.length > 5){ //prevent false positive data
                                   itemCollect.sizeMap = eval("(" + elem.children[0].data + ")").sizeMap; //lol idk but it works
                                   readProductSizes(itemCollect.parentProductId);

                                }
                            }
                            else if (elem.attribs.id.indexOf('pdpprices_') > -1){

                                //console.log('pdpprices_ ',elem.children[0].data);
                                itemCount++; //SHOULD GO LAST IN LOOP


                            }
                        }


                    }
                });

                function readItemPartNumbers(productId) {

                    var dataString = itemCollect.itemPartNumbersMap;    
                    var pairs = dataString.split("|");
                    var partNumbers = [];
                    for (var j in pairs) {
                        var nvp = pairs[j].split(" ");
                        if (nvp.length == 2 && nvp[0] && nvp[1]) {
                            itemCollect.sizeIds.push({ //add item + part numbers to itemCollect
                                itemNumber: nvp[0],
                                partNumber: nvp[1]
                            });
                        }
                    }
   
                    itemCollect.name = eval("(" + itemCollect.itemPartNumbersMap + ")").cmProdInfo.shortDesc;
                }


                function readProductSizes(productId) {
                    // if (!data || !data.sizeMap || !data.sizeMap.xSizes) {
                    //     this.hasSizes = false;
                    //     return
                    // }
                    console.log(itemCollect.sizeIds);
                    var sizeMap = {};

                    var sizes = itemCollect.sizeMap.xSizes.split("|");

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
                    
                    console.log('sizeMap ',sizeMap);

                }


    // readItemCatentryId: function(productId) {
    //     var container = document.getElementById("swatches_" + productId);
    //     if (!container) {
    //         return
    //     }
    //     var data = eval("(" + container.innerHTML + ")");
    //     if (!data || !data.colorMap) {
    //         return
    //     }
    //     this.currentItemCatentryId = data.colorMap.buyableCatEntryId;
    //     this.currentItemId = this.currentItemCatentryId;
    //     if (this.currentItemCatentryId && this.currentItemCatentryId.indexOf("_") > -1) {
    //         var catPairs = this.currentItemCatentryId.split("_");
    //         this.currentItemId = catPairs[0];
    //         this.currentItemCatentryId = catPairs[0];
    //         console.log("currentItemCatentryId set to :" + this.currentItemCatentryId + ">> currentItemAvailablity :" + catPairs[1]);
    //         var add_cart_id = "#add-to-cart_" + this.currentProductId;
    //         console.log("Current Selected Product Swatch Id: " + this.currentProductId);
    //         if (catPairs[1] == "INSTORE") {
    //             jQuery(add_cart_id).text("Out Of Stock");
    //             jQuery(add_cart_id).removeClass("blue-btn");
    //             jQuery(add_cart_id).addClass("oos-btn")
    //         } else {
    //             if (catPairs[1] == "ONLINE") {
    //                 this.getElementById("puis-feature").hide();
    //                 this.getElementById("puis-selected-item-web-only").show();
    //                 var colorTxt = "Color: " + this.currentItemColor;
    //                 return
    //             } else {
    //                 jQuery(add_cart_id).text("Add to Cart");
    //                 jQuery(add_cart_id).removeClass("oos-btn");
    //                 jQuery(add_cart_id).addClass("blue-btn")
    //             }
    //         }
    //         this.getElementById("puis-feature").show();
    //         this.getElementById("puis-selected-item-web-only").hide()
    //     }
    // },

                //////////Construct item name from Brand Name + Product Name /////////////
                // var brandName = '';
                // //get brand name
                // $("section[id='brand-title']").map(function(i, section) {
                //     for (var i = 0; i < section.children.length; i++) { 
                //         if (section.children[i].name == 'h2'){
                //            brandName = section.children[i].children[0].children[0].data;               
                //         }
                //     }
                // });
                // //get product name
                // $("section[id='product-title']").map(function(i, section) {
                //     for (var i = 0; i < section.children.length; i++) { 
                //         if (section.children[i].name == 'h1'){
                //            newItem.name = brandName + ' ' + section.children[i].children[0].data; //add brand name + product name together            
                //         }
                //     }
                // });
                // //////////////////////////////////////////////////////////////////////////

                // //get item price
                // $('td').each(function(i, elem) {
                //     if (elem.attribs.class.indexOf('item-price') > -1){
                //        newItem.price = elem.children[1].children[0].data.replace(/[^\d.-]/g, ''); //remove dollar sign symbol
                //     }
                // });

                // //get the styleId to query nordstrom server with from the product URL. lastindexof gets item from end of URL. 
                // //split('?') kills anything after productID in URL
                // newItem.styleId = newItem.src.substring(newItem.src.lastIndexOf("/") + 1).split('?')[0];  

                // if (newItem.styleId) {
                //     resolve(newItem);
                // } else {
                //     console.log('missing params', newItem);
                //     reject('missing params');
                // }
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


function getInventory(newItem) {
    return new Promise(function(resolve, reject) {

        //catalogId 
        //storeId
        //distance
        //latlong
        //partNumber
        //726F726G03
        //http://www.menswearhouse.com/StoreLocatorInventoryCheck?catalogId=12004&langId=-1&storeId=12751&distance=25&latlong=40.74071,-73.99418&partNumber=TMW726F30003

        /* 
        catalogId=12004
        &langId=-1
        &storeId=12751
        &distance=25
        &latlong=40.74071,-73.99418
        &partNumber=TMW726F30003
        */

// http://www.menswearhouse.com/StoreLocatorInventoryCheck?catalogId=12004&langId=-1&storeId=12751&distance=25&latlong=40.74071,-73.99418&partNumber=TMW726F10003
// http://www.menswearhouse.com/StoreLocatorInventoryCheck?catalogId=12004&langId=-1&storeId=12751&distance=25&latlong=40.74071,-73.99418&partNumber=TMW726F30003
// http://www.menswearhouse.com/StoreLocatorInventoryCheck?catalogId=12004&langId=-1&storeId=12751&distance=25&latlong=40.74071,-73.99418&partNumber=TMW726F50003


//<input type="hidden" value="700478997" id="currProductId" name="currProductId">

        var postalcode = '10002'; //iterate through all zipcodes
        var radius = '100'; //max is 100 miles
        var physicalStores = [];

        var url = 'http://shop.nordstrom.com/es/GetStoreAvailability?styleid='+newItem.styleId+'&type=Style&instoreavailability=true&radius='+radius+'&postalcode='+postalcode+'&format=json';
        
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

                async.eachSeries(body["PersonalizedLocationInfo"].Stores, function iterator(item, callback) {

                    var url = 'http://test.api.nordstrom.com/v1/storeservice/storenumber/'+item.StoreNumber+'?format=json&apikey=pyaz9x8yd64yb2cfbwc5qd6n';
    
                    var options = {
                        url: url,
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13'
                        }
                    };
                    request(options, function(error, response, body) {
                        body = JSON.parse(body);
                        var storeObj = {
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
                        physicalStores.push(storeObj);     
                        setTimeout(function() { callback() }, 800);  //slowly collecting stores that carry item cause there's a rate limiter on the API
                    });

                },function(err,res){
                    console.log('newItem: ', newItem);
                    console.log('stores in zip code '+postalcode+' have '+newItem.name+': ', physicalStores);
                });

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

    });
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