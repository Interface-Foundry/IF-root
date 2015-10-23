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

//Top categoryID for Clothing, Shoes & Accessories
var root = '11450'

var findByCategoryUrl = 'http://svcs.ebay.com/services/search/FindingService/v1?OPERATION-NAME=findItemsByCategory&SERVICE-VERSION=1.0.0&SECURITY-APPNAME=' + 'Kip246d35-a1ac-41ca-aed1-97e635a44de' + '&RESPONSE-DATA-FORMAT=JSON&REST-PAYLOAD&categoryId=10181&paginationInput.entriesPerPage=2'
var topLevelUrl = 'http://open.api.ebay.com/Shopping?callname=GetCategoryInfo&appid=' + APP_ID + '&version=677&siteid=0&CategoryID=' + root + '&IncludeSelector=ChildCategories'

nodes = []

nodeIndex = 0
async.whilst(
    function() {
        return nodes.length < 50
    },
    function loop(restart) {
        var url = (nodes && nodes.length > 0) ? 'http://open.api.ebay.com/Shopping?callname=GetCategoryInfo&appid=' + APP_ID + '&version=677&siteid=0&CategoryID=' + nodes[nodeIndex].CategoryID + '&IncludeSelector=ChildCategories' : topLevelUrl


        buildNodes(url).then(function(levelComplete) {
            if (levelComplete) {
                if (nodes && nodes.length > 0) {
                    console.log('Gathered ', nodes.length, ' nodes for level ', nodeIndex)
                    // console.log(nodes[nodes.length - 1].CategoryName)
                    i++;
                    restart()
                }
            } else {
                restart()
            }
        })


    },
    function finished(err) {
        if (err) console.log(err)
        fs.appendFile('./finished.js', '\n' + JSON.stringify(nodes), function(err) {})
        console.log('Final nodes: ', nodes.length)

    })

function buildNodes(url) {
    return new Promise(function(resolve, reject) {
        var options = {
            url: url,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13',
                'X-EBAY-API-RESPONSE-ENCODING': 'JSON'
            }
        };
        request(options, function(error, response, body) {
            if ((!error) && (response.statusCode == 200)) {
                body = JSON.parse(body)
                if (!body.CategoryArray) {
                    console.log('Empty results', body)
                    return reject('Empty results')
                }
                var categoryArray = body.CategoryArray.Category
                var leafReached = false
                async.eachSeries(categoryArray, function iterator(category, callback) {
                    category.children = []

                    nodes.push(category);
                    if (!category.LeafCategory) {
                        leafReached = true;
                    }
                    callback()
                }, function finished(err) {
                    if (err) {
                        console.log('41: ', err)
                    }
                    // console.log('FINISHED...', nodes.length)
                    return resolve(leafReached)
                })



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