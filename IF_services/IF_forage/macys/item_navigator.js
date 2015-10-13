var cheerio = require('cheerio');
var db = require('db');
var Promise = require('bluebird');
var async = require('async');
var uniquer = require('../../uniquer');
var request = require('request')
var item_scraper = require('./item_scraper')
var catalogs = require('./catalogs')
var _ = require('lodash');
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
                var today = new Date().toString()
                fs.appendFile('progress.log', '\n' + today + 'Finished category: ', catalog)
                wait(callback, 10000)
            }).catch(function(err) {
                if (err) {
                    var today = new Date().toString()
                        // fs.appendFile('errors.log', '\n' + today + ' Category: ' + categoryName + '\n' + err, function(err) {});
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
                // fs.appendFile('errors.log', '\n' + today + err, function(err) {});
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




                //----Parse out all page links from body----//
                var pages = [];
                for (var key in $('#paginateBottom>a')) {
                    if ($('#paginateBottom>a').hasOwnProperty(key) && $('#paginateBottom>a')[key].attribs && $('#paginateBottom>a')[key].attribs.href) {
                        pages.push($('#paginateBottom>a')[key].attribs.href)
                    }
                }
                pages = _.uniq(pages)

                //console.log('preclean pages ',pages);

                //take total num pages ---> add "66,60?" 1-66
                //var pageLinks = pages.length > 0 ? [url, url.concat(pages[0]), url.concat(pages[1]), url.concat(pages[2])] : [url]
                var pageLinks = [];
                if (pages.length > 1) {

                    //console.log('cleaning ',pageLinks);

                    var linkFormat = pages[0].split('pageIndex=')[0].concat('pageIndex=')
                    var lastVisiblePageNum = parseInt(pages[pages.length - 2].split('=')[2])
                    var lastPageNum = parseInt(pages[pages.length - 1].split('=')[2])

                    console.log(linkFormat);
                    console.log(lastVisiblePageNum);
                    console.log(lastPageNum);


                    for (var i = lastVisiblePageNum + 1; i <= lastPageNum; i++) {
                        var link = url.concat((linkFormat.concat(i)))
                        pageLinks.push(link)
                    }
                    console.log('page links ',pageLinks);
                }
               

                //DO STUFF HERE!!!!!!
                // //Load pages and scrape each page.
                // loadPages(pageLinks, catalog).then(function() {
                //     console.log('Finished scraping all pages for catalog: ', catalog.category)
                //     resolve();
                // }).catch(function(err) {
                //     if (err) {
                //         var today = new Date().toString()
                //         fs.appendFile('errors.log', '\n' + today + 'Category: ' + catalog.category + '\n' + err);
                //         return reject(err)
                //     }
                //     reject()
                // })


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

function loadPages(links, catalog) {
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
                        ///SCRAPE HERE!!!!!
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