var cheerio = require('cheerio');
var db = require('db');
var Promise = require('bluebird');
var async = require('async');
var uniquer = require('../../uniquer');
var request = require('request')
var item_scraper = require('./item_scraper')
var catalogs = require('./catalogs')
var fs = require('fs')

//This will loop forever through each of the catalogs 
async.whilst(
    function() {
        return true
    },
    function(loop) {
        async.eachSeries(catalogs, function(catalog, callback) {
            loadCatalog(catalog).then(function(res) {
                console.log('Done with catalog.')
                wait(callback, 10000)
            }).catch(function(err) {
                if (err) {
                    var today = new Date().toString()
                    fs.appendFile('errors.log', '\n' + today + ' Category: ' + categoryName + '\n' + err, function(err) {});
                    console.log('Error with catalog: ', catalog, err)
                }
                wait(callback, 10000)
            })
        }, function(err) {
            if (err) {
                var today = new Date().toString()
                fs.appendFile('errors.log', '\n' + today + ' Category: ' + categoryName + '\n' + err)
            } else {
                var today = new Date().toString()
                fs.appendFile('progress.log', '\n' + today + '*Finished scraping all catalogs. ')
            }
            console.log('Finished scraping all catalogs. Restarting in 2000 seconds.')
            wait(loop, 2000000)
        })
    },
    function(err) {
        if (err) {
            var today = new Date().toString()
            fs.appendFile('errors.log', '\n' + today + err, function(err) {});
        }
    })

function loadCatalog(url) {
    return new Promise(function(resolve, reject) {
        var options = {
            url: url,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13'
            }
        };
        request(options, function(error, response, body) {
            if ((!error) && (response.statusCode == 200)) {
                $ = cheerio.load(body); //load HTML
                async.eachSeries($('li.product.grid-element>a'), function(item, callback) {
                    var detailsUrl = item.attribs.href;

                    if (detailsUrl.toString().indexOf('/us/en/-c') > -1) {

                        console.log('Invalid url, skipping: ', detailsUrl)
                        return callback()
                    }

                    console.log('Scraping>>>', detailsUrl)
                    item_scraper(detailsUrl).then(function(result) {
                        // console.log('Done.')
                        callback()
                    }).catch(function(err) {
                        callback()
                    })
                }, function(err) {
                    console.log('Done scraping catalog!')
                    resolve()
                })

            } else {
                if (error) {
                    var today = new Date().toString()
                    fs.appendFile('errors.log', '\n' + today + 'Category: ' + categoryName + '\n' + error, function(err) {});
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