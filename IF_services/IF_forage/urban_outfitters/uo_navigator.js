//Note: If you are getting 'missing id' logs in console, run uo_store_scraper first.

var cheerio = require('cheerio');
var db = require('db');
var Promise = require('bluebird');
var async = require('async');
var uniquer = require('../../uniquer');
var request = require('request')
var item_scraper = require('./uo_scraper')
var fs = require('fs')
var catalogs = require('./catalogs.js')


//This will loop forever through each of the catalogs listed above
async.whilst(
    function() {
        return true
    },
    function(loop) {

        loadStores().then(function(stores) {


            async.eachSeries(catalogs, function(catalog, callback) {
                loadCatalog(catalog, stores).then(function(res) {
                    var today = new Date().toString()
                    fs.appendFile('progress.log', '\n' + today + 'Finished scraping  category: ', catalog.category)
                    console.log('Done with catalog.')
                    wait(callback, 10000)
                }).catch(function(err) {
                    if (err) {
                        var today = new Date().toString()
                        fs.appendFile('errors.log', '\n' + today + ' Category: ' + catalog.category + '\n' + err, function(err) {});
                    }
                    console.log('Error with catalog: ', catalog.category)
                    wait(callback, 10000)
                })
            }, function(err) {
                if (err) {
                    var today = new Date().toString()
                    fs.appendFile('errors.log', '\n' + today + ' Category: ' + catalog.category + '\n' + err, function(err) {});
                } else {
                    var today = new Date().toString()
                    fs.appendFile('progress.log', '\n' + today + '***Finished scraping all catalogs***')
                }
                console.log('Finished scraping all catalogs for Urban Outfitters.')
            })


        }).catch(function(err) {
            if (err) {
                console.log('Error loading stores: ', err)
            }
        })


    },
    function(err) {
        if (err) console.log('Navigator loop error: ', err)
    })


function loadStores() {
    return new Promise(function(resolve, reject) {
        db.Landmarks.find({
            'source_generic_store': {
                $exists: true
            },
            'linkbackname': 'urbanoutfitters.com'
        }, function(e, stores) {
            if (e) {
                console.log(e)
                reject(e)
            }
            if (!stores) {
                reject('No stores in db.')
            }
            if (stores) {
                resolve(stores)
            }
        })
    })
}




function loadCatalog(category, stores) {
    return new Promise(function(resolve, reject) {
        var options = {
            url: category.url,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13'
            }
        };
        console.log('Starting catalog: ', category.category)
        request(options, function(error, response, body) {
            if ((!error) && (response.statusCode == 200)) {
                $ = cheerio.load(body); //load HTML
                async.eachSeries($('p.product-image>a'), function(item, callback) {
                    if (!item.attribs.href) {
                        console.log('invalid!')
                        return callback()
                    }
                    var detailsUrl = item.attribs.href;
                    detailsUrl = 'http://www.urbanoutfitters.com/urban/catalog/' + detailsUrl.toString().trim()
                    item_scraper(detailsUrl, category.category, stores).then(function(result) {
                        // console.log('Done.**')
                        wait(callback, 3000)
                    }).catch(function(err) {
                        console.log('Item scraper error: ', err)
                        wait(callback, 3000)
                    })
                }, function(err) {
                    if (err) console.log('async error, nav 129: ', err)
                    console.log('Done scraping catalog!')
                    resolve()
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