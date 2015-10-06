var cheerio = require('cheerio');
var db = require('db');
var Promise = require('bluebird');
var async = require('async');
var uniquer = require('../../uniquer');
var request = require('request');
var item_scraper = require('./nordstrom_scraper');
var states = require('./states');
var fs = require('fs');

//List of NEW-IN catalogs
var womens = {
    category: 'Womens',
    url: 'http://shop.nordstrom.com/c/womens-new-arrivals?dept=8000001&origin=topnav'
}
var mens = {
    category: 'Mens',
    url: 'http://shop.nordstrom.com/c/mens-clothing-whats-new?origin=leftnav'
}
var wshoes = {
    category: 'Womens Shoes',
    url: 'http://shop.nordstrom.com/c/womens-shoe-new?dept=8000001&origin=topnav'
}
var mshoes = {
    category: 'Mens Shoes',
    url: 'http://shop.nordstrom.com/c/mens-shoes-whats-new?origin=leftnav'
}
var handbags = {
    category: 'Handbags',
    url: 'http://shop.nordstrom.com/c/handbags-new-arrivals?origin=leftnav'
}
var catalogs = [womens, mens, mshoes, wshoes,handbags]

stateIndex = 0;
currentState = states[stateIndex]
notFoundCount = 0;

async.whilst(
    function() {
        return states[stateIndex]
    },
    function(loop) {
        var query = {
            'state': currentState
        }
        db.Zipcodes.find(query).then(function(zips) {
            var count = 0;
            console.log('\nCurrent state: ' + currentState)
            async.whilst(
                function() {
                    return count <= zips.length
                },
                function(cb) {

                    //For each zipcode
                    async.eachSeries(zips, function(zip, finishedZipcode) {
                            zipcode = zip.zipcode
                            async.eachSeries(catalogs, function(catalog, callback) {
                                loadCatalog(catalog, zipcode).then(function(res) {
                                    console.log('Done with catalog.')
                                    var today = new Date().toString()
                                    fs.appendFile('progress.log', '\n' + today + 'Finished Category: ' + catalog.category, function(err) {});
                                    wait(callback, 10000)
                                }).catch(function(err) {
                                    if (err) {
                                        var today = new Date().toString()
                                        fs.appendFile('errors.log', '\n' + today + 'Category: ' + catalog.category + '\n' + err, function(err) {});
                                    }
                                    console.log('Error with catalog: ', catalog)
                                    wait(callback, 10000)
                                })
                            }, function(err) {
                                if (err) {
                                    var today = new Date().toString()
                                    fs.appendFile('errors.log', '\n' + today + 'Category: ' + catalog.category + '\n' + err, function(err) {});
                                }
                                console.log('Finished scraping all catalogs. Restarting in 2000 seconds.')
                                wait(loop, 2000000)
                            })
                        },
                        function(err) {
                            if (err) {
                                var today = new Date().toString()
                                fs.appendFile('errors.log', '\n' + today + 'Category: ' + catalog.category + '\n' + err, function(err) {});
                            } else {
                                var today = new Date().toString()
                                fs.appendFile('progress.log', '\n' + today + '*Finished scraping all catalogs for: ', currentState)
                                cb('Done with state.')
                            }
                        });

                },
                function(err) {
                    if (err) {
                        var today = new Date().toString()
                        fs.appendFile('errors.log', '\n' + today + +'Category: ' + catalog.category + '\n' + err, function(err) {});
                    }
                    stateIndex++;
                    if (states[stateIndex]) {
                        currentState = states[stateIndex]
                        console.log('Next state..')
                        loop()
                    } else {
                        console.log('Finished all states!')
                        stateIndex = 0;
                        currentState = states[stateIndex]
                        fs.appendFile('progress.log', '\n' + today + '***Finished scraping all catalogs for all states!!*** ')
                        // Turn off infinite loop, CRON job will handle it.
                        // loop()
                    }
                });
        })
    },
    function(err) {
        if (err) {
            var today = new Date().toString()
            fs.appendFile('errors.log', '\n' + today + err, function(err) {});
        }
    })


function loadCatalog(category, zipcode) {
    return new Promise(function(resolve, reject) {

        var options = {
            url: category.url,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13'
            }
        };

        console.log('Starting catalog: ', category.category, ' for zipcode: ', zipcode)
        request(options, function(error, response, body) {
            if ((!error) && (response.statusCode == 200)) {
                $ = cheerio.load(body); //load HTML
                async.eachSeries($('div.main-content-right a'), function(item, callback) {
                    if ((item.attribs.href.indexOf('?origin=category') == -1) || (item.attribs.href == '#') || (item.attribs.href.indexOf('/s/') == -1)) {
                        // console.log('invalid!')
                        return callback()
                    }
                    var detailsUrl = item.attribs.href;
                    detailsUrl = 'http://shop.nordstrom.com' + detailsUrl.toString().trim()

                    // console.log('Scraping>>>', detailsUrl)

                    item_scraper(detailsUrl, category.category, zipcode).then(function(result) {
                        wait(callback, 4000)
                    }).catch(function(err) {
                        console.log(err)
                        wait(callback, 4000)
                    })
                }, function(err) {
                    if (err) {
                        var today = new Date().toString()
                        fs.appendFile('errors.log', '\n' + today + ' Category: ' + catalog.category + '\n' + err, function(err) {});
                    }
                    console.log('Done scraping catalog!')
                    resolve()
                })

            } else {
                if (error) {
                    var today = new Date().toString()
                    fs.appendFile('errors.log', '\n' + today + 'Category: ' + catalog.category + '\n' + error, function(err) {});
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