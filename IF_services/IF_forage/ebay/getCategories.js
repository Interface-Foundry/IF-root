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
nindex = 0
notfinished = true

async.whilst(
    function() {
        return notfinished
    },
    function loop(restart) {
        console.log('Nodes: ', nodes.length);
        // nodes[nindex] = []
        var currentCategory = (nindex == 0) ? root : nodes[nindex].CategoryID
        if (nodes[nindex] && nodes[nindex].CategoryLevel && nodes[nindex].CategoryLevel >= 5) {
            console.log('I guess its finished?')
            notfinished = !notfinished
            restart('finished')
        }
        var url = 'http://open.api.ebay.com/Shopping?callname=GetCategoryInfo&appid=' + APP_ID + '&version=677&siteid=0&CategoryID=' + currentCategory + '&IncludeSelector=ChildCategories'
        if (nodes[nindex] && nodes[nindex].CategoryName) {
            console.log('Category: ', nodes[nindex].CategoryName);
        }
        buildNodes(url).then(function(leaf) {
            if (leaf == true) {
                console.log('Level complete. ');
                if (nodes && nodes.length > 0) {
                    if (nodes[nindex] && nodes[nindex].CategoryName) {
                        console.log('Category: ', nodes[nindex].CategoryName);
                    }
                    nindex++;
                    restart()
                }
            } else {
                console.log('Not level complete.')
                nindex++;
                restart()
            }
        })
    },
    function finished(err) {
        if (err) console.log(err)
        console.log('Collected nodes.. building tree..')
            //Build tree
        var map = {},
            node, tree = [];
        for (var i = 0; i < nodes.length; i += 1) {
            node = nodes[i];
            node.children = [];
            map[node.CategoryID] = i; // use map to look-up the parents
            if (node.CategoryParentID !== "-1") {
                nodes[map[node.CategoryParentID]].children.push(node);
            } else {
                tree.push(node);
            }
        }
        console.log('Scraped ',nodes.length, ' nodes.');
        var categories = _.chain(tree).flatten(tree, true).uniq(tree, "CategoryID").value();
        console.log('Found ', categories.length, ' categories.')
        fs.appendFile('./test.js', '\n' + JSON.stringify(categories), function(err) {
            if (err) console.log(err)
            console.log('Tree built!')
        })
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
                    nodes.push(category)
                    if (category.LeafCategory) {
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