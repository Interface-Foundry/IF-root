var cheerio = require('cheerio');
var db = require('db');
var Promise = require('bluebird');
var async = require('async');
var uniquer = require('../../uniquer');
var request = require('request')
var item_scraper = require('./mw_item_scraper')
var states = require('./states');
var catalogs = require('./catalogs');

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
                                    wait(callback, 10000)
                                }).catch(function(err) {
                                    console.log('Error with catalog: ', catalog)
                                    wait(callback, 10000)
                                })
                            }, function(err) {
                                console.log('Finished scraping all catalogs. Restarting in 2000 seconds.')
                                wait(loop, 2000000)
                            })
                        },
                        function(err) {
                            if (err) {
                                console.log(err);
                            } else {
                                cb('Done with state.')
                            }
                        });
                },
                function(err) {
                    if (err) {
                        console.log(err);
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
                        loop()
                    }
                });
        })
    },
    function(err) {
        if (err) console.log(err)

    })


function loadCatalog(category, zipcode) {
    return new Promise(function(resolve, reject) {
        var options = {
            url: category.url,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13'
            }
        };
        console.log('Starting catalog: ', category.url, ' for zipcode: ', zipcode)
        request(options, function(error, response, body) {
            if ((!error) && (response.statusCode == 200)) {
                $ = cheerio.load(body); //load HTML
                async.eachSeries($('div.prod-img>a'), function(item, callback) {
                    var detailsUrl = item.attribs.href;
                    item_scraper(detailsUrl, category.category, zipcode).then(function(result) {
                        wait(callback, 4000)
                    }).catch(function(err) {
                        console.log(err)
                        wait(callback, 4000)
                    })
                }, function(err) {
                    if (err) console.log(err)
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