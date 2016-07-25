var http = require('http');
var cheerio = require('cheerio');
// var db = require('db');
var Promise = require('bluebird');
var async = require('async');
// var uniquer = require('../../uniquer');
var request = require('request');
var UglifyJS = require("uglifyjs");

var Stores = []
var url = 'http://bananarepublic.gap.com/browse/product.do?cid=70160&vid=1&pid=676126002';

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

        //get baseId (used to query for rest of sizes/colors for this product)
        var baseId = getQueryParams(newItem.src).pid; //get product Id from URL
        if (baseId.length > 6){
            baseId = baseId.slice(0, -3); //remove last 3 digits to get baseId 
            getProductsfromBase('http://bananarepublic.gap.com/browse/productData.do?pid=676126&vid=1&scid=&actFltr=false&locale=en_US&internationalShippingCurrencyCode=&internationalShippingCountryCode=us&globalShippingCountryCode=us');
        }
        else {
            console.log('error, baseId unexpected size', baseId);
        }

        function getProductsfromBase(baseURL){
            console.log(baseURL);
            var options = {
                url: baseURL,
                method:'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.155 Safari/537.36',
                    'Cookie': 'JSESSIONID=1e77febc-b7c1-4936-a914-66c923bcfc64; gid.h=025|||; ABSegOverride=none; ABSeg=BSeg; locale=en_US|||; unknownShopperId=584B52EF14D69356C5CD3AB6A65652F2|||'
                }
            };
            request(options, function(error, response, body) {

                console.log(body);
                
                //CHECK IF JS, NOT THE HTML

                // var parsed = UglifyJS.parse(body);
                // parsed.figure_out_scope();

                // for (var i = 0; i < parsed.body.length; i++) { 
                //     console.log(parsed.body[i]);
                // }

                //console.log(parsed.body[0]);
                // parsed.body.each(function(g) {
                //     console.log( g);
                //     // g.scope.body.each(function(e) {
                //     //     console.log(e);
                //     // });
                //     console.log('////////////////////////////////////////////////////////////');
                // });

            });
        }

        // request(options, function(error, response, body) {
        //     if ((!error) && (response.statusCode == 200)) {

        //         $ = cheerio.load(body); //load HTML

        //         // //iterate on images found in HTML
        //         // $('img').each(function(i, elem) {
        //         //     if (elem.attribs){
        //         //         if (elem.attribs.src){ //sort the two types of images to collect
        //         //             if (elem.attribs.src.indexOf("/product/Mini") > -1){ //finding all images that have Mini (all images to scrape)         
        //         //                 var s = elem.attribs.src.replace("Mini", "Large"); //get the bigger one
        //         //                 newItem.images.push(s);
        //         //             }
        //         //         }
        //         //     }
        //         // });


        //         // //////////Construct item name from Brand Name + Product Name /////////////
        //         // var brandName = '';
        //         // //get brand name
        //         // $("section[id='brand-title']").map(function(i, section) {
        //         //     for (var i = 0; i < section.children.length; i++) { 
        //         //         if (section.children[i].name == 'h2'){
        //         //            brandName = section.children[i].children[0].children[0].data;               
        //         //         }
        //         //     }
        //         // });
        //         // //get product name
        //         // $("section[id='product-title']").map(function(i, section) {
        //         //     for (var i = 0; i < section.children.length; i++) { 
        //         //         if (section.children[i].name == 'h1'){
        //         //            newItem.name = brandName + ' ' + section.children[i].children[0].data; //add brand name + product name together            
        //         //         }
        //         //     }
        //         // });
        //         // //////////////////////////////////////////////////////////////////////////

        //         // //get item price
        //         // $('td').each(function(i, elem) {
        //         //     if (elem.attribs.class.indexOf('item-price') > -1){
        //         //        newItem.price = elem.children[1].children[0].data.replace(/[^\d.-]/g, ''); //remove dollar sign symbol
        //         //     }
        //         // });

        //         // //get the styleId to query nordstrom server with from the product URL. lastindexof gets item from end of URL. 
        //         // //split('?') kills anything after productID in URL
        //         // newItem.styleId = newItem.src.substring(newItem.src.lastIndexOf("/") + 1).split('?')[0];  

        //         // if (newItem.styleId) {
        //         //     resolve(newItem);
        //         // } else {
        //         //     console.log('missing params', newItem);
        //         //     reject('missing params');
        //         // }
        //     } else {
        //         if (error) {
        //             console.log('error: ', error)
        //         } else if (response.statusCode !== 200) {
        //             console.log('response.statusCode: ', response.statusCode);
        //         }
        //     }
        // })
    })
}


function getInventory(newItem) {
    return new Promise(function(resolve, reject) {

        //query for inventory: 
        //URL > pid val 676126002
        //
        // http://bananarepublic.gap.com/resources/storeLocations/v1/us/10001/?searchRadius=100&skuid=6761260320002&locale=en_US&clientid=gid

        // http://bananarepublic.gap.com/resources/storeLocations/v1/us/10001/?searchRadius=100&skuid=6761260020000&locale=en_US&clientid=gid

        // http://bananarepublic.gap.com/resources/storeLocations/v1/us/10001/?searchRadius=100&skuid=6761260220002&locale=en_US&clientid=gid



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

function getQueryParams(qs) {
    qs = qs.split('+').join(' ');
    var params = {},
        tokens,
        re = /[?&]?([^=]+)=([^&]*)/g;
    while (tokens = re.exec(qs)) {
        params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
    }
    return params;
}