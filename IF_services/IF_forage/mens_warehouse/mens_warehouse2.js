var http = require('http');
var cheerio = require('cheerio');
var db = require('db');
var Promise = require('bluebird');
var async = require('async');
var uniquer = require('../../uniquer');
var request = require('request');


var Stores = []
    // var url = 'http://www.menswearhouse.com/mens-clothes/mens-outerwear/modern-fit-trim-outerwear/pronto-blue-modern-fit-moto-jacket-cognac-726F726G03';
var url = 'http://www.menswearhouse.com/mens-suits/slim-fit-extra-trim-suits/awearness-by-kenneth-cole-blue-sharkskin-slim-fit-suit-30KP30KR56';
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

                //NEW ITEM CREATED (BY COLOR)
                var itemCollect = {
                    imgURLs: [],
                    sizeIds: []
                };

                $('div img').each(function(i, elem) {
                    if (elem.attribs.src.indexOf('images.menswearhouse.com/is/image/TMW/') > -1 && elem.attribs.itemprop == 'image') {
                        itemCollect.imgURLs.push(elem.attribs.src)
                    }
                })

                $('h3.final-price').each(function(i, elem) {
                    itemCollect.price = elem.children[0].data
                })

                $('p.help-links a.flat-btn').each(function(i, elem) {
                    if (elem.attribs && elem.attribs.href && elem.attribs.href.indexOf('catalogId') > -1 && elem.attribs.href.indexOf('storeId') > -1) {
                        itemCollect.catalogId = elem.attribs.href.split('?')[1].split('=')[1].split('&')[0]
                        itemCollect.storeId = elem.attribs.href.split('storeId=')[1]
                    }
                })

                //iterate on images found in HTML
                $('div').each(function(i, elem) {
                    if (elem.attribs) {

                        if (elem.attribs.id) {

                            if (elem.attribs.id.indexOf('current_') > -1) {
                                var el = eval("(" + elem.children[0].data + ")")
                                itemCollect.itemPartNumbersMap = el.cmProdInfo.itemPartNumbersMap;
                                itemCollect.name = el.cmProdInfo.shortDesc;
                            }

                            if (elem.attribs.id.indexOf('detail_') > -1) {
                                var el = eval("(" + elem.children[0].data + ")")
                                itemCollect.parentProductId = el.ProdDetail.parentProductId;
                                readItemPartNumbers(itemCollect);
                            }

                            if (elem.attribs.id.indexOf('swatches_') > -1) {

                                //console.log('swatches_ ',elem.children[0].data);

                            }

                            if (elem.attribs.id.indexOf('sizes_') > -1) {
                                if (elem.children[0].data.length > 5) { //prevent false positive data
                                    itemCollect.sizeMap = eval("(" + elem.children[0].data + ")").sizeMap; //lol idk but it works
                                    readProductSizes(itemCollect);
                                }
                            }

                            if (elem.attribs.id.indexOf('pdpprices_') > -1) {
                                itemCount++; //SHOULD GO LAST IN LOOP
                            }
                        }

                        // delete itemCollect.itemPartNumbersMap

                        resolve(itemCollect)
                            console.log('Final item: ',itemCollect)


                    }
                });

                function jsonEscape(str) {
                    return str.replace(/\n/g, " ").replace(/\r/g, "\\\\r").replace(/\t/g, "\\\\t");
                }

                function readItemPartNumbers(itemCollect) {
                    // console.log('^^^', itemCollect)
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

                    // itemCollect.name = eval("(" + itemCollect.itemPartNumbersMap + ")").cmProdInfo.shortDesc;
                }


                function readProductSizes(itemCollect) {
                    // if (!data || !data.sizeMap || !data.sizeMap.xSizes) {
                    //     this.hasSizes = false;
                    //     return
                    // }
                    // console.log(itemCollect.sizeIds);
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

                    itemCollect.sizeMap = sizeMap;

                    // console.log('sizeMap ', sizeMap);

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

        var Stores = [];

        // 38.8006756,-95.2369805
        //catalogId 
        //storeId
        //distance
        //latlong
        //partNumber
        //726F726G03

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

        var url = 'http://www.menswearhouse.com/StoreLocatorInventoryCheck?catalogId=' + newItem.catalogId + '&langId=-1&storeId=' + newItem.storeId + '&distance=6000&latlong=38.8006756,-95.2369805&partNumber=' + newItem.sizeIds[0].partNumber

        var options = {
            url: url,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13'
            }
        };

        request(options, function(error, response, body) {
            if ((!error) && (response.statusCode == 200)) {
                body = eval("(" + body + ")").result
                console.log('!!!!!!', body.length)
                async.eachSeries(body, function iterator(store, callback) {

                    var storeObj = {
                        name: store.address.storeName,
                        stlocId: store.stlocId,
                        Address: store.address1 + store.address2 + store.city + store.country + store.state,
                        City: store.city,
                        State: store.state,
                        ZipCode: store.zipcode,
                        PhoneNumber: store.phone,
                        Hours: store.hours,
                        Description: store.desc,
                        Lat: store.latlong.split(',')[0],
                        Lng: store.latlong.split(',')[1]
                    }

                    Stores.push(storeObj);

                    setTimeout(function() {
                        callback()
                    }, 800); //slowly collecting stores that carry item cause there's a rate limiter on the API


                }, function(err, res) {
                    resolve(Stores)
                    console.log('stores in zip code ' + Stores.length);
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

function saveStores(stores) {
    return new Promise(function(resolve, reject) {
        var Stores = [];
        var count = 0
        async.each(stores, function(store, callback) {

            db.Landmarks
                .findOne({
                    'source_generic_store.storeId': store.stlocId,
                    'linkbackname': 'menswearhouse.com'
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
                        n.name = 'Mens Wearhouse ' + store.name;
                        n.source_generic_store = store;
                        n.world = true;
                        n.addressString = store.Address;
                        n.tel = store.PhoneNumber;
                        n.linkback = 'http://www.menswearhouse.com';
                        n.linkbackname = 'menswearhouse.com'
                        n.hasloc = true;
                        n.loc.coordinates[0] = parseFloat(store.Lng);
                        n.loc.coordinates[1] = parseFloat(store.Lat);
                        uniquer.uniqueId('menswearhouse ' + store.Address, 'Landmark').then(function(output) {
                            n.id = output;
                            n.save(function(e, newStore) {
                                if (e) {
                                    // console.error(e);
                                    return callback()
                                }
                                Stores.push(newStore)
                                callback()
                            })
                        })
                    } else if (s) {
                        Stores.push(newStore)
                        callback()
                    }
                })
        }, function(err) {
            if (err) {
                return reject(err)
            }

            resolve(Stores)
        })
    })
}



function saveItem(stores, item) {
    return new Promise(function(resolve, reject) {
        var parents = [];

        // i.parent.mongoId = s._id;
        // if (s.name) {
        //     i.parent.name = s.name;
        // } else {
        //     i.parent.name = s.id
        // }
        // i.parent.id = s.id;

        stores.forEach(function(store) {
            var obj = {}
            obj.mongoId = store._id;
            obj.name = store.name;
            obj.id = store.id
            parents.push(obj)
        })

        //Check if this item/store exists
        db.Landmarks.findOne({
            'source_generic_item.productId': item.productId,
            'source_generic_item.storeId': store.storeId
        }, function(err, match) {
            if (err) {
                console.log(err)
                return callback1()
            }
            if (!match) {

                //Create new item for each store in inventory list.
                var i = new db.Landmark();
                i.world = false;
                i.source_generic_item = item;
                delete i.source_generic_item.physicalStores;
                i.price = parseFloat(item.price);
                i.itemImageURL = item.images;
                i.name = item.name;
                //TODO: owner;
                // i.owner = owner;
                i.linkback = item.src;
                i.linkbackname = 'menswearhouse.com';
                var tags = i.name.split(' ').map(function(word) {
                    return word.toString().toLowerCase()
                })
                tags.forEach(function(tag) {
                    i.itemTags.text.push(tag)
                })
                i.itemTags.text.push('Urban Outfitters')
                i.itemTags.text.push(item.color)
                i.itemTags.text = tagParser.parse(i.itemTags.text)
                if (tagParser.colorize(item.color)) {
                    i.itemTags.colors.push(tagParser.colorize(item.color))
                }
                i.itemTags.text.push(cat)
                i.source_generic_item.storeId = store.storeId;
                i.hasloc = true;
                i.loc.type = 'Point'
                uniquer.uniqueId(i.name, 'Landmark').then(function(output) {
                        // console.log('*3')
                        i.id = output;
                        db.Landmarks.findOne({
                            'source_generic_store.storeId': store.storeId,
                            'linkbackname': 'urbanoutfitters.com'
                        }, function(err, s) {
                            if (err) {
                                console.log(err)
                                return callback2()
                            }
                            if (!s) {
                                //The parent store doesn't exist in db, skip this item for now.
                                // console.log('Store in list doesnt exist in the db: ', store.physicalStoreId)
                                console.log('missing id: ', store.storeId)
                                return callback2()
                            }
                            //Check if the store with storeId exists in db
                            else if (s) {
                                // console.log('Found store!')
                                i.tel = s.tel;
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
                                console.log('Saved: ', item.id)
                                return callback2();
                            })
                        })
                    }) //end of uniquer
            }
      

      

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