var db = require('db');
var Promise = require('bluebird');
var async = require('async');
var uniquer = require('../../uniquer');
var request = require('request');
var fs = require('fs');
var _ = require('lodash');

//KEYS
var DEV_ID = '35e910f1-fcc5-41b9-a3d0-62a07cd5aaad'
var APP_ID = 'Kip246d35-a1ac-41ca-aed1-97e635a44de'
var CERT_ID = 'e2885f30-57c3-4c92-8b97-8ffe6fec4fda'

db.EbayCategories.find({}, function(err, categories) {
    async.eachSeries(categories, function iterator(category, callback) {
        console.log('Category: ', category.CategoryName)
        //detailsUrl
        var url = 'http://svcs.ebay.com/services/search/FindingService/v1?OPERATION-NAME=findItemsAdvanced&SERVICE-VERSION=1.12.0&SECURITY-APPNAME=Kip246d35-a1ac-41ca-aed1-97e635a44de&RESPONSE-DATA-FORMAT=JSON&REST-PAYLOAD&paginationInput.entriesPerPage=1&categoryId=' + category.CategoryID + '&descriptionSearch=true&outputSelector=AspectHistogram'
        // ,CategoryHistogram,ConditionHistogram,GalleryInfo,PictureURLLarge,PictureURLSuperSize,SellerInfo,StoreInfo,UnitPriceInfo'
        var pageNumber = 0
        var pageMax;
        var options = {
            url: url,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13',
                'X-EBAY-API-RESPONSE-ENCODING': 'JSON'
            }
        };

        async.doWhilst(
            function(finishedPage) {

                request(options, function(error, response, body) {
                    if ((!error) && (response.statusCode == 200)) {
                        body = JSON.parse(body);

                        console.log(JSON.stringify(body))
                        // var result = body.findItemsByCategoryResponse[0].searchResult[0].item;
                        // pageMax = body.findItemsByCategoryResponse[0].paginationOutput[0].totalPages[0]
                        // console.log('Found ', pageMax, ' pages.')


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
                return next;
            },
            function(err) {
                if (err) {
                    console.log('39', err)

                }
                console.log('Finished Catalog.')


            }
        );




    }, function finished() {

    })
})