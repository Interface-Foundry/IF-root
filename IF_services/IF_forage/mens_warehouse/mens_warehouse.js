var http = require('http');
var cheerio = require('cheerio');
// var db = require('db');
var Promise = require('bluebird');
var async = require('async');
// var uniquer = require('../../uniquer');
var request = require('request');
var UglifyJS = require("uglifyjs");
var _ = require('underscore');


var Stores = []
var url = 'http://www.menswearhouse.com/mens-shoes/mens-dress-shoes/joseph-abboud-bixby-brown-cap-toe-lace-up-dress-shoes-403U03';
//http://www.menswearhouse.com/mens-shoes/mens-dress-shoes/joseph-abboud-bixby-brown-cap-toe-lace-up-dress-shoes-403U03
//http://www.menswearhouse.com/mens-clothes/mens-outerwear/modern-fit-trim-outerwear/pronto-blue-modern-fit-moto-jacket-cognac-726F726G03

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
        // var newItem = {
        //     src: url, 
        //     images: []
        // };

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

                //initial count of num of items to collect
                $('div').each(function(i, elem) {
                    if (elem.attribs && elem.attribs.id && elem.attribs.id.indexOf('current_') > -1){
                        itemCountLoop++;
                    }
                });

                //iterate on images found in HTML
                $('div').each(function(i, elem) {
                    if (elem.attribs){
                        if(elem.attribs.id){
                            if (elem.attribs.id.indexOf('current_') > -1){

                                //console.log('current_ ',elem.children[0].data);
                                if (elem.children[0].data.length > 5){
                                    //NEW ITEM CREATED (BY COLOR)
                                    var itemCollect = {
                                        sizeIds: [],
                                        images: [],
                                        physicalStores: []
                                    };
                                    newItems.push(itemCollect);
                                    newItems[itemCount].itemPartNumbersMap = elem.children[0].data;
                                }
                            }
                            else if (elem.attribs.id.indexOf('detail_') > -1){

                                if (elem.children[0].data.length > 5){ //prevent false positive data

                                    if (elem.children[0].data.length < 70){ //filter data glitch
                                        var detailObj = elem.children[0].next.next.data.replace('",','{ ProdDetail:{'); //fixing glitchy data incoming from mens warehouse
                                    }
                                    else {
                                        var detailObj = elem.children[0].data; //no data glitch, proceed
                                    }
                                    
                                    newItems[itemCount].parentProductId = eval("(" + detailObj + ")").ProdDetail.parentProductId; //get parent product ID
                                    newItems[itemCount].src = eval("(" + detailObj + ")").ProdDetail.SocialURL; //get parent product ID

                                    ////////// EXTRACT TAGS //////////
                                    var details = eval("(" + detailObj  + ")").ProdDetail.details.split("|"); //from details
                                    if (eval("(" + detailObj  + ")").ProdDetail.longDesc){
                                        var longDesc = eval("(" + detailObj  + ")").ProdDetail.longDesc.split(" "); //from longDescription
                                    }
                                    else {
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
                                            commonObj[ common[i].trim() ] = true;
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
                                        return ["free","stand","features","adds","full","extra","featuring","up","upper","details","detail","down","featuring","featuring","look","interior","exterior","multiple","single","a", "able", "about", "across", "after", "all", "almost", "also", "am", "among", "an", "and", "any", "are", "as", "at", "be", "because", "been", "but", "by", "can", "cannot", "could", "dear", "did", "do", "does", "either", "else", "ever", "every", "for", "from", "get", "got", "had", "has", "have", "he", "her", "hers", "him", "his", "how", "however", "i", "if", "in", "into", "is", "it", "its", "just", "least", "let", "like", "likely", "may", "me", "might", "most", "must", "my", "neither", "no", "nor", "not", "of", "off", "often", "on", "only", "or", "other", "our", "own", "rather", "said", "say", "says", "she", "should", "since", "so", "some", "than", "that", "the", "their", "them", "then", "there", "these", "they", "this", "tis", "to", "too", "twas", "us", "wants", "was", "we", "were", "what", "when", "where", "which", "while", "who", "whom", "why", "will", "with", "would", "yet", "you", "your", "ain't", "aren't", "can't", "could've", "couldn't", "didn't", "doesn't", "don't", "hasn't", "he'd", "he'll", "he's", "how'd", "how'll", "how's", "i'd", "i'll", "i'm", "i've", "isn't", "it's", "might've", "mightn't", "must've", "mustn't", "shan't", "she'd", "she'll", "she's", "should've", "shouldn't", "that'll", "that's", "there's", "they'd", "they'll", "they're", "they've", "wasn't", "we'd", "we'll", "we're", "weren't", "what'd", "what's", "when'd", "when'll", "when's", "where'd", "where'll", "where's", "who'd", "who'll", "who's", "why'd", "why'll", "why's", "won't", "would've", "wouldn't", "you'd", "you'll", "you're", "you've"];
                                    }
                                    //http://stackoverflow.com/questions/9751413/removing-duplicate-element-in-an-array
                                    function eliminateDuplicates(arr) {
                                        var i,len=arr.length,out=[],obj={};
                                         for (i=0;i<len;i++) {
                                            obj[arr[i]]=0;
                                         }
                                         for (i in obj) {
                                            out.push(i);
                                         }
                                         return out;
                                    }
                                    ///////////////////////////////////////

                                    var imageURL = eval("(" + detailObj  + ")").ProdDetail.ProdFullImage;
                                    newItems[itemCount].images.push('http://images.menswearhouse.com/is/image/TMW/'+imageURL+'?$40Zoom$'); //get parent product ID

                                    //GET IMAGES
                                   //http://images.menswearhouse.com/is/image/TMW/MW40_726F_03_PRONTO_BLUE_COGNAC_SET?$40Zoom$
                                   //MW40_726F_03_PRONTO_BLUE_COGNAC_SET


                                   readItemPartNumbers(); //parse item parts

                                }

                            }
                            else if (elem.attribs.id.indexOf('swatches_') > -1){

                                //console.log('swatches_ ',elem.children[0].data);

                            }
                            else if (elem.attribs.id.indexOf('sizes_') > -1){

                                //console.log('sizes_ ',elem.children[0].data);

                                if (elem.children[0].data.length > 5){ //prevent false positive data
                                   newItems[itemCount].sizeMap = eval("(" + elem.children[0].data + ")").sizeMap; //blah blah JS container or smthing
                                   readProductSizes();
                                }

                            }
                            else if (elem.attribs.id.indexOf('pdpprices_') > -1){


                                if (elem.children[0].data.length > 5){
                                    newItems[itemCount].price = eval("(" + elem.children[0].data + ")").PriceDetail.regListPrice; //get item price
                                    if (!newItems[itemCount].price){ //get this price if the other one doesn't exist (backup)
                                        newItems[itemCount].price = eval("(" + elem.children[0].data + ")").PriceDetail.regOfferPrice;
                                    }
                                }

                                //console.log('pdpprices_ ',elem.children[0].data);
                                itemCount++; //SHOULD GO LAST IN LOOP, used to select index in newItems array
                                
                                //ALL ITEMS ARE COLLECTED, NOW MOVE ON TO INVENTORY
                                if (itemCount == itemCountLoop){
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
                    for (var i in newItems[itemCount].sizeIds){
                        var itemNumber = newItems[itemCount].sizeIds[i].itemNumber;
                        if (sizeMap[''+newItems[itemCount].sizeIds[i].itemNumber+''] && sizeMap[''+newItems[itemCount].sizeIds[i].itemNumber+''].size){
                            var sizeName = sizeMap[''+newItems[itemCount].sizeIds[i].itemNumber+''].size;
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


function getInventory(newItems) {
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
        
        var lat = 40.74071;
        var lng = -73.99418;
        var radius = 200; //i think this is max? idk

        async.eachSeries(newItems, function iterator(item, callback) {

            async.eachSeries(item.sizeIds, function iterator(item2, callback2) {

                var url = 'http://www.menswearhouse.com/StoreLocatorInventoryCheck?catalogId=12004&langId=-1&storeId=12751&distance='+radius+'&latlong='+lat+','+lng+'&partNumber='+item2.partNumber+''; //note: you can get a list of all stores by lat lng by removing the partNumber val
                var options = { 
                    url: url,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13'
                    }
                };
                request(options, function(error, response, body) {
                    if ((!error) && (response.statusCode == 200)) {

                        item2.physicalStores = eval("(" + body + ")").result; //put store results in each item object

                        for (var x in eval("(" + body + ")").result){
                            item.physicalStores.push(eval("(" + body + ")").result[x]);
                        }
                        
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

                setTimeout(function() { callback2() }, 800);  //slowly collecting stores that carry item cause there's a rate limiter on the API
            },function(err,res){

                item.physicalStores = _.uniq(item.physicalStores, 'stlocId'); //remove duplicate physical stores

                setTimeout(function() { callback() }, 800);  //slowly collecting stores that carry item cause there's a rate limiter on the API
            });

        },function(err,res){

            //DONE GETTING ALL SIZES FOR ALL ITEMS AND COLORS
            console.log('/////////////////// FINAL ITEMS ///////////////////');
            //******* DATA NOTES *********
            //******* physicalStores = list of stores that carry this item
            //******* parentProductId = unique Id parent for all item colors and sizes. use this to check if the item was scraped 
            console.log(newItems); // the items (sorted by color, item created per color)

        });


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