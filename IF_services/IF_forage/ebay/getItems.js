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
var categoryFile = require('./categories.js')

async.forever(
    function(next) {
        run()
    },
    function(err) {
        if (err) console.log('\n\n\nERROR: ', err)
        next()
    }
);

function run() {
    async.eachSeries(categoryFile.categoryLevels, function iterator(categoryLevel, finishedLevel) {
            var count = 0;
            console.log('Starting... \nRepeats: ', count, '\nMax Repeats: ', categoryLevel.repeat)
            async.whilst(
                function() {
                    return count <= parseInt(categoryLevel.repeat);
                },
                function(repeatLevel) {
                    async.eachSeries(categoryLevel.categories, function iterator(category, finishedCategory) {
                            console.log('\n\n\nStarting Category: ', category.CategoryNamePath, '\n\n\n');
                            var pageNum = 1;
                            var pageMax;
                            async.doWhilst(
                                function(finishedPage) {
                                    var url = 'http://svcs.ebay.com/services/search/FindingService/v1?OPERATION-NAME=findItemsAdvanced&SERVICE-VERSION=1.12.0&SECURITY-APPNAME=Kip246d35-a1ac-41ca-aed1-97e635a44de&RESPONSE-DATA-FORMAT=JSON&REST-PAYLOAD&paginationInput.entriesPerPage=100&categoryId=' + category.CategoryID + '&descriptionSearch=true'
                                    if (pageMax && pageNum > 1) {
                                        url = url.concat('&paginationInput.pageNumber=' + pageNum);
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
                                                if (pageMax > 100) {
                                                    pageMax = 100
                                                }
                                                console.log('Found ', pageMax, ' pages.');
                                            }
                                            console.log('\n\nPage Number: ', pageNum, '\n\n');
                                            var items = body.findItemsAdvancedResponse[0].searchResult[0].item;
                                            var index = 1;
                                            if (!items || (items && items.length < 1)) {
                                                return finishedPage()
                                            }
                                            async.eachSeries(items, function iterator(item, finishedItem) {
                                                    // console.log('Item:', index);
                                                    index++;
                                                    db.EbayItem.findOne({
                                                        'itemId': item.itemId[0]
                                                    }, function(err, match) {
                                                        if (err) {
                                                            console.log('124: ', err);
                                                        }
                                                        if (!match) {
                                                            getItemDetails(item).then(function(i) {
                                                                var ebayItem = new db.EbayItem(i);
                                                                ebayItem.save(function(err, saved) {
                                                                    if (err) {
                                                                        console.log('130', err)
                                                                        return finishedItem()
                                                                    }
                                                                    console.log('Saved.', saved.name, '\n')
                                                                    return finishedItem();
                                                                })
                                                            }).catch(function(err) {
                                                                if (err) console.log('53: ', err)
                                                                return finishedItem()
                                                            })
                                                        } else {
                                                            console.log('Exists.', match.name, '\n');
                                                            finishedItem();
                                                        }
                                                    })
                                                },
                                                function finished(err) {
                                                    if (err) console.log(err);
                                                    console.log('Finished page: ', pageNum)
                                                    pageNum++;
                                                    finishedPage();
                                                });
                                        } else {
                                            if (error) {
                                                console.log('error: ', error);
                                                reject(error);
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
                                    finishedCategory()
                                });
                        },
                        function finishedCategories(err, n) {
                            count++;
                            console.log('\n\nRepeating category level.\n\n')
                            repeatLevel()
                        });
                },
                function finishedRepeating(err) {
                    finishedLevel()
                })
        },
        function finishedAll(err) {
            if (err) console.log(err);
            console.log('Finished all category levels!')
        })
}

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
                if (!body.Item || !body.Item[0]) {
                    console.log('122: Bad Response!', response)
                    return reject(response)
                }
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
                // console.log('\n\n168*** item.PictureURL', item.PictureURL)
                newItem.category = item.PrimaryCategoryName;
                newItem.details = item.ItemSpecifics.NameValueList;
                newItem.mainTags = [];
                item.Title.split(' ').forEach(function(word) {
                    newItem.mainTags.push(word);
                });
                item.PrimaryCategoryName.split(':').forEach(function(word) {
                    newItem.mainTags.push(word);
                })
                var descTags = item.Description.split(' ').map(function(word) {
                    return word.toString().toLowerCase().trim()
                })
                var specTags = item.ItemSpecifics.NameValueList.map(function(obj) {
                        return obj.Value[0].toString().toLowerCase().trim();
                    })
                    //This will filter out business-y words related to shipping, pricing, etc. found in the description text of each item.
                    //Not perfect, misspelled words and others will slip though.
                    //Look at tagParser.js in IF_services for the complete list of words. Please feel free to add to the list
                newItem.descriptionTags = tagParser.filter(_.uniq(descTags.concat(specTags)))
                try {
                    newItem.mainTags = tagParser.parse(newItem.mainTags)
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


function wait(callback, delay) {
    var startTime = new Date().getTime();
    while (new Date().getTime() < startTime + delay);
    callback();
}