var http = require('http');
var cheerio = require('cheerio');
// var db = require('db');
var Promise = require('bluebird');
var async = require('async');
// var uniquer = require('../../uniquer');
var request = require('request');
var urlapi = require('url');

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
        getItem(url).then(function(item) {
            callback(null, item)
        }).catch(function(err) {
            callback(err)
        })
    },
    // function(item, callback) {
    //     getInventory(item).then(function(item) {
    //         callback(null, item)
    //     }).catch(function(err) {
    //         callback(err)
    //     })
    // },
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

        // var queryURL = url.substring(url.lastIndexOf("/") + 1).split('?')[0]; //get product ID from URL
        // queryURL =  //use ID to query for item

        // console.log();

        //console.log(queryURL);
        var newItems = []; //multiple colors for item == multiple items
        //construct newItem object
        var newItem = {
            src: url, 
            images: [],
            colors: []
        };
        var latestColor;

        var options = {
            url: 'http://www.urbanoutfitters.com/api/v1/product/'+getParameterByName('id')+'',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13'
            }
        };
        request(options, function(error, response, body) {
            if ((!error) && (response.statusCode == 200)) {

                //console.log(body);
                body = JSON.parse(body);

                for (var i = 0; i < body['product']['colors'].length; i++) { 

                    newItems[i] = {
                        images: [],
                        src: url
                    }

                    for (var z = 0; z < body['product']['colors'][i]['viewCode'].length; z++) { 
                        newItems[i].images.push('http://images.urbanoutfitters.com/is/image/UrbanOutfitters/' + body['product']['colors'][i].id + '_' + body['product']['colors'][i]['viewCode'][z] + '?$mlarge$&defaultImage=');
                    }
                    newItems[i].name = body['product']['displayName'] + ' ' + body['product']['colors'][i]['displayName'];
                    newItems[i].productId = body['product']['productId'];
                    //newItem.push();
                    // latestColor = body['product']['colors'][i].id);
                    // if (body['product']['colors'][i].id))
                    //newItems.push(newItem);
                }

                console.log(newItems);

                // $ = cheerio.load(body); //load HTML

                // newItem.styleId = newItem.src.substring(newItem.src.lastIndexOf("/") + 1).split('?')[0];  

                //API QUERY FOR ITEM INFO
                //http://www.urbanoutfitters.com/api/v1/product/33749656?siteCode=urban

                // $('.product-swatches').filter(function(){
                //     var data = $(this);

                //    // console.log(data);
                // });

                // //iterate on images found in HTML
                // $('img').each(function(i, elem) {

                //     //console.log(elem);

                //     // if (elem.parent){
                //     //     if(elem.parent.attribs){
                //     //         if(elem.parent.attribs['ng-include']){
                //     //             if(elem.parent.attribs['ng-include'].indexOf('product-detail') > -1){

                //     //                 console.log(elem.parent.children);


                //     //             }
                //     //         }
                //     //     }
                //     // }

                //         if (elem.attribs['ng-include']){ 
                //             console.log(elem.attribs['ng-include']);
                //             if (elem.attribs['ng-include'].indexOf('product-detail') > -1){ //sort the two types of images to collect
                //                 //"http://www.urbanoutfitters.com/urban/images/swatches/33749656_010_s.png"

                //                 console.log(elem);


                //                 // if (elem.attribs.src.indexOf('/images/swatches/') > -1){ //get color swatches

                //                 //     var n = elem.attribs.src.lastIndexOf('/');
                //                 //     var result = elem.attribs.src.substring(n + 1);

                //                 //     //console.log(result);

                //                 // }

                //                 // //Collect color numbers first, then collect all images on page 
                //                 // //loop through ng-repeat 


                //                 // if (elem.attribs.src.indexOf("/product/Mini") > -1){ //finding all images that have Mini (all images to scrape)         
                //                 //     var s = elem.attribs.src.replace("Mini", "Large"); //get the bigger one
                //                 //     newItem.images.push(s);
                //                 // }
                //             }
                //         }
                //     //}
                // });

                // //////////Construct item name from Brand Name + Product Name /////////////
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
                //     reject('missing params')
                // }

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


function getInventory(newItem) {
    return new Promise(function(resolve, reject) {

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

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(url);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
