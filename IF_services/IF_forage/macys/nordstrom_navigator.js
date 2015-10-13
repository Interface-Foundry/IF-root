var cheerio = require('cheerio');
var db = require('db');
var Promise = require('bluebird');
var async = require('async');
var uniquer = require('../../uniquer');
var request = require('request');
var item_scraper = require('./nordstrom_scraper');
var states = require('./states');
var fs = require('fs');
var _ = require('lodash');
var catalogs = require('./catalogs')

//Error check for all the catalogs in the catalogs.js file, just to make sure since there are a lot of variables and links in there..
for (var i = 0; i < catalogs.length; i++) {
    if (!catalogs[i] || catalogs[i] == undefined || catalogs[i] == null) {
        console.log('There is  a type in the catalogs file.  Please check at index: ',i)
    }
}

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
                                        fs.appendFile('errors.log', '\n' + today + 'Category: ' + catalog.category + '\n' + err);
                                    }
                                    console.log('Error with catalog: ', catalog)
                                    wait(callback, 10000)
                                })
                            }, function(err) {
                                if (err) {
                                    var today = new Date().toString()
                                    console.log('There was an error with current catalog, moving onto next one...')
                                    fs.appendFile('errors.log', '\n' + today + err.lineNumber + 'Category: ' + catalog.category + '\n' + err);
                                }
                                console.log('Finished scraping all catalogs. Restarting in 2000 seconds.')
                                wait(loop, 2000000)
                            })
                        },
                        function(err) {
                            if (err) {
                                var today = new Date().toString()
                                fs.appendFile('errors.log', '\n' + today + err.lineNumber + 'Category: ' + catalog.category + '\n' + err);
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
                        fs.appendFile('errors.log', '\n' + today + err.lineNumber + 'Category: ' + catalog.category + '\n' + err);
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


function loadCatalog(catalog, zipcode) {
    return new Promise(function(resolve, reject) {
        var options = {
            url: catalog.url,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13'
            }
        };
        console.log('Starting catalog: ', catalog.category, ' for zipcode: ', zipcode)
        request(options, function(error, response, body) {
            if ((!error) && (response.statusCode == 200)) {
                $ = cheerio.load(body); //load HTML

                //----Parse out all page links from body----//
                var pages = [];
                for (var key in $('a.imageLink')) {
                    if ($('a.imageLink').hasOwnProperty(key) && $('a.imageLink')[key].attribs && $('a.imageLink')[key].attribs.href) {
                        pages.push($('a.imageLink')[key].attribs.href)
                    }
                }
                pages = _.uniq(pages)
                var pageLinks = pages.length > 0 ? [catalog.url, catalog.url.concat(pages[0]), catalog.url.concat(pages[1]), catalog.url.concat(pages[2])] : [catalog.url]
                if (pageLinks.length > 1) {
                    var linkFormat = pages[0].split('page=')[0].concat('page=')
                    var lastVisiblePageNum = parseInt(pages[pages.length - 2].split('=')[2])
                    var lastPageNum = parseInt(pages[pages.length - 1].split('=')[2])
                    for (var i = lastVisiblePageNum + 1; i <= lastPageNum; i++) {
                        var link = catalog.url.concat((linkFormat.concat(i)))
                        pageLinks.push(link)
                    }
                }
               

                //Load pages and scrape each page.
                loadPages(pageLinks, zipcode, catalog).then(function() {
                    console.log('Finished scraping all pages for catalog: ', catalog.category)
                    resolve();
                }).catch(function(err) {
                    if (err) {
                        var today = new Date().toString()
                        fs.appendFile('errors.log', '\n' + today + 'Category: ' + catalog.category + '\n' + err);
                        return reject(err)
                    }
                    reject()
                })


            } else {
                if (error) {
                    var today = new Date().toString()
                    fs.appendFile('errors.log', '\n' + today + 'Category: ' + catalog.category + '\n' + error);
                    reject(error)
                } else if (response.statusCode !== 200) {
                    console.log('Error - Response.statusCode: ', response.statusCode)
                    reject(response.statusCode)
                }
            }
        })
    })
}

function loadPages(links, zipcode, catalog) {
    return new Promise(function(resolve, reject) {

        //Loop through each page in the catalog.
        async.eachSeries(links, function iterator(link, callback1) {
            var options = {
                url: link,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13'
                }
            };
            request(options, function(error, response, body) {
                if ((!error) && (response.statusCode == 200)) {
                    $ = cheerio.load(body); 

                    //Loop through each item in the page.
                    async.eachSeries($('a.imageLink'), function(item, callback2) {
                        if ((item.attribs.href.indexOf('?origin=category') == -1) || (item.attribs.href == '#') || (item.attribs.href.indexOf('/s/') == -1)) {
                            // console.log('invalid!')
                            return callback2()
                        }
                        // var detailsUrl = item.attribs.href;
                        // detailsUrl = 'http://shop.nordstrom.com' + detailsUrl.toString().trim()

                        console.log('Scraping>>>', detailsUrl)
                        callback2()
                        // item_scraper(detailsUrl, catalog.category, zipcode).then(function(result) {
                        //     wait(callback2, 4000)
                        // }).catch(function(err) {
                        //     console.log(err.lineNumber + err)
                        //     wait(callback2, 4000)
                        // })
                    }, function(err) {
                        if (err) {
                            var today = new Date().toString()
                            fs.appendFile('errors.log', '\n' + today + err.lineNumber + ' Category: ' + catalog.category + '\n' + err);
                        }
                        console.log('************Finished scraping page..')
                        callback1()
                    })


                } else {
                    if (error) {
                        var today = new Date().toString()
                        fs.appendFile('errors.log', '\n' + today + 'Category: ' + catalog.category + '\n' + error);
                        callback1()
                    } else if (response.statusCode !== 200) {
                        console.log('Error - Response.statusCode: ', response.statusCode)
                        callback1()
                    }
                }
            })
        }, function finished(err) {
            if (err) {
                var today = new Date().toString()
                fs.appendFile('errors.log', '\n' + today + 'Category: ' + catalog.category + '\n' + err);
                return reject(err)
            }
             console.log('!!!!!********Finished all pages..')
            resolve()

        })
    })
}


function wait(callback, delay) {
    var startTime = new Date().getTime();
    while (new Date().getTime() < startTime + delay);
    callback();
}
