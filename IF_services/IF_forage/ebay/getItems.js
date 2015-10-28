var db = require('db');
var Promise = require('bluebird');
var async = require('async');
var uniquer = require('../../uniquer');
var request = require('request');
var fs = require('fs');
var _ = require('lodash');
var tagParser = require('../tagParser');
//KEYS
var DEV_ID = '35e910f1-fcc5-41b9-a3d0-62a07cd5aaad'
var APP_ID = 'Kip246d35-a1ac-41ca-aed1-97e635a44de'
var CERT_ID = 'e2885f30-57c3-4c92-8b97-8ffe6fec4fda'
db.EbayCategories.find({}, function(err, categories) {
    async.eachSeries(categories, function iterator(category, finishedCategory) {
            console.log('Category: ', category.CategoryName);
            var pageNum = 1;
            var pageMax;
            async.doWhilst(
                function(finishedPage) {

                    var url = 'http://svcs.ebay.com/services/search/FindingService/v1?OPERATION-NAME=findItemsAdvanced&SERVICE-VERSION=1.12.0&SECURITY-APPNAME=Kip246d35-a1ac-41ca-aed1-97e635a44de&RESPONSE-DATA-FORMAT=JSON&REST-PAYLOAD&paginationInput.entriesPerPage=1&categoryId=' + category.CategoryID + '&descriptionSearch=true'
                    if (pageMax && pageNum > 1) {
                        url = url.concat('&paginationInput.pageNumber=' + pageNum)
                            // console.log('Going to next page: ', url)
                    }
                    var options = {
                        url: url,
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13',
                            'X-EBAY-API-RESPONSE-ENCODING': 'JSON'
                        }
                    };
                    request(options, function(error, response, body) {
                        if ((!error) && (response.statusCode == 200)) {
                            body = JSON.parse(body);
                            if (pageNum == 1) {
                                pageMax = body.findItemsAdvancedResponse[0].paginationOutput[0].totalPages[0];
                                if (pageMax > 3) {
                                    pageMax = 3
                                }
                                console.log('Found ', pageMax, ' pages.');
                            }
                            console.log('Page Number: ', pageNum)
                            var items = body.findItemsAdvancedResponse[0].searchResult[0].item;
                            var index = 1;
                            async.eachSeries(items, function iterator(item, finishedItem) {
                                    console.log('Item #: ', index)
                                    index++
                                    db.EbayItem.findOne({
                                        'itemId': item.itemId[0]
                                    }, function(err, match) {
                                        if (err) {
                                            console.log('124: ', err)
                                        }
                                        if (!match) {
                                            getItemDetails(item).then(function(i) {
                                                var ebayItem = new db.EbayItem(i);
                                                ebayItem.save(function(err, saved) {
                                                    if (err) console.log('130', err)
                                                    console.log('Saved: ', saved.name)
                                                    fs.appendFile('./results.js', '\n' + JSON.stringify(saved.name), function(err) {
                                                        if (err) console.log(err)
                                                    })
                                                    return finishedItem()
                                                })
                                            }).catch(function(err) {
                                                if (err) console.log('53: ', err)
                                                return finishedItem()
                                            })
                                        } else {
                                            console.log('Item exists!')
                                            finishedItem();
                                        }
                                    })
                                },
                                function finished(err) {
                                    if (err) console.log(err);
                                    // console.log('Finished page: ', pageNum)
                                    pageNum++;
                                    finishedPage()
                                });
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
                },
                function() {
                    return pageNum <= pageMax;
                },
                function(err) {
                    if (err) {
                        console.log('39', err)
                    }
                    console.log('Finished Category.')
                    finishedCategory()
                }
            );
        },
        function finished(err) {

        })
})

function getItemDetails(i) {
    return new Promise(function(resolve, reject) {
        var url = 'http://open.api.ebay.com/shopping?callname=GetMultipleItems&responseencoding=JSON&appid=Kip246d35-a1ac-41ca-aed1-97e635a44de&siteid=0&version=525&ItemID=' + i.itemId[0] + '&IncludeSelector=Details,Description,TextDescription,ItemSpecifics'
        var options = {
            url: url,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13',
                'X-EBAY-API-RESPONSE-ENCODING': 'JSON'
            }
        };
        request(options, function(error, response, body) {
            if ((!error) && (response.statusCode == 200)) {
                body = JSON.parse(body);
                var item = body.Item[0];
                var newItem = {};
                newItem.itemId = item.ItemID;
                newItem.name = item.Title;
                newItem.description = item.Description;
                newItem.price = item.CurrentPrice;
                if (i.condition && i.condition.length > 0) {
                    newItem.condition = i.condition[0];
                }
                newItem.src = item.ViewItemURLForNaturalSearch;
                newItem.images = item.PictureURL;
                newItem.category = item.PrimaryCategoryName;
                newItem.details = item.ItemSpecifics.NameValueList;
                newItem.tags = [];
                item.Title.split(' ').forEach(function(word) {
                    newItem.tags.push(word);
                });
                item.PrimaryCategoryName.split(':').forEach(function(word) {
                    newItem.tags.push(word);
                })
                var descTags = item.Description.split(' ').map(function(word) {
                    return word.toString().toLowerCase().trim()
                });
                descTags = descTags.join(' ').removeStopWords().split(' ');
                console.log('descTags: ',descTags)
                var specTags = item.ItemSpecifics.NameValueList.map(function(obj) {
                    return obj.Value[0].toString().toLowerCase().trim();
                })
                specTags = specTags.join(' ').removeStopWords().split(' ');
                newItem.tags.concat(descTags).concat(specTags);
                try {
                    newItem.tags = tagParser.parse(newItem.tags)
                } catch (err) {
                    console.log('tagParser error: ', err)
                }
                resolve(newItem)
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


String.prototype.removeStopWords = function() {
    var x;
    var y;
    var word;
    var stop_word;
    var regex_str;
    var regex;
    var cleansed_string = this.valueOf();
    var stop_words = new Array(
        'flat',
        'table',
        'approximate',
        'business',
        'day',
        'cleared',
        'weekends',
        'buyers',
        'note',
        'usa',
        'stores',
        'listing',
        'purchased',
        'person',
        'sizes',
        'kindly',
        'please',
        'pls',
        'charges',
        'satisfied',
        'buyer',
        'processed',
        'seller',
        'payment',
        'shipping',
        'shipped',
        'returns',
        'returned',
        'refunds',
        'feedback',
        'store',
        'categories',
        'accept',
        'acceptable',
        'via',
        'paypal',
        'please',
        'requests',
        'request',
        'packages',
        'etc',
        'processed',
        'replacement',
        'exceptions',
        'received',
        'verification',
        'confirmed',
        'addresses',
        'address',
        'transit',
        'provided',
        'carrier',
        'excludes',
        'transit',
        'urgent',
        'tracking',
        'packaging',
        'ebay',
        'supplier',
        'located',
        'location',
        'supply',
        'supplier',
        'email',
        'newsletters',
        'newsletter',
        'adding',
        'services',
        'copyright',
        'rights',
        'information',
        'questions',
        'considered',
        'issue',
        'verification',
        'products',
        'solutions',
        'signup',
        'accepted',
        'guarantee',
        'links',
        'promotions',
        'money',
        'helpful',
        'items',
        'included',
        'shown',
        'actual',
        'item',
        'particularly',
        'shipment',
        'customer',
        'status',
        'available',
        'warehouse',
        'delivery',
        'countries',
        'auction',
        'result',
        'item',
        'unpaid',
        'account',
        'automatically',
        'close',
        'accumulate',
        'measurement',
        'except',
        'determined',
        'include',
        'customs',
        'importation',
        'reliable',
        'credit',
        'standing',
        'including',
        'welcome',
        'thanks',
        'your',
        'add',
        'policy',
        'policies',
        'maintain',
        'bidding',
        'bid',
        'receipt',
        'provide',
        'specific',
        'reason',
        'return',
        'section',
        'handling',
        'returnsnotaccepted',
        'service',
        'customer',
        'customers',
        'added',
        'days',
        'returnsrefunds',
        'according',
        'you',
        'buy',
        'ship',
        'video',
        'surveillance',
        'detailed',
        'parcel',
        'combined',
        'discount',
        'sales',
        'method',
        'wholes',
        'comes',
        'contact',
        'help',
        'trouble',
        'combined',
        'offer',
        'confirm',
        'registered',
        'trademark',
        'inspected',
        'clearance',
        'msrp',
        'neglect',
        'accident',
        'alterations',
        'misuse',
        'loss',
        'abuse',
        'caused',
        'defects',
        'accidents',
        'defect',
        'resulting',
        'improper',
        'scratches',
        'workmanship',
        'additional',
        'costs',
        'cost',
        'taxes',
        'tax',
        'responsibility',
        'import',
        'duties',
        'charge',
        'terms',
        'specifications',
        'price',
        'varies',
        'depending',
        'purchase',
        'measurements',
        'approximate',
        'hours',
        'days',
        'weekends',
        'holidays',
        'arrive',
        'international',
        'company',
        'conditions',
        'cannot',
        'wait',
        'patiently',
        'declared',
        'choose',
        'system',
        'custom',
        'concerns'
    )

    // Split out all the individual words in the phrase
    words = cleansed_string.match(/[^\s]+|\s+[^\s+]$/g)

    // Review all the words

    if (!words || words == null || words == undefined) {
        return ''
    }

    for (x = 0; x < words.length; x++) {

        //Remove any word with digits in them "3W" "4E" etc
        var matches = words[x].match(/\d+/g);
        if (matches !== null) {
            cleansed_string = cleansed_string.replace(words[x], "");
        }

        // For each word, check all the stop words
        for (y = 0; y < stop_words.length; y++) {
            // Get the current word
            word = words[x].replace(/\s+|[^a-z]+/ig, ""); // Trim the word and remove non-alpha

            // Get the stop word
            stop_word = stop_words[y];

            // If the word matches the stop word, remove it from the keywords
            if (word.toLowerCase() == stop_word) {
                // Build the regex
                regex_str = "^\\s*" + stop_word + "\\s*$"; // Only word
                regex_str += "|^\\s*" + stop_word + "\\s+"; // First word
                regex_str += "|\\s+" + stop_word + "\\s*$"; // Last word
                regex_str += "|\\s+" + stop_word + "\\s+"; // Word somewhere in the middle
                regex = new RegExp(regex_str, "ig");
                // Remove the word from the keywords
                cleansed_string = cleansed_string.replace(regex, " ");
            }
        }
    }
    return cleansed_string.replace(/^\s+|\s+$/g, "");
}