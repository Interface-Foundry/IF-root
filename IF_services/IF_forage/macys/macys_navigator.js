var cheerio = require('cheerio');
var db = require('db');
var Promise = require('bluebird');
var async = require('async');
var uniquer = require('../../uniquer');
var request = require('request');
var item_scraper = require('./macys_scraper');
var fs = require('fs');
var _ = require('lodash');
var catalogs = require('./catalogs.js');
var Nightmare = require('nightmare');
var vo = require('vo');

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
                    console.log('catalog.category', catalog.category)
                    var catName = catalog.category.trim()
                    fs.appendFile('./logs/progress.log', '\n' + today + 'Finished scraping  category: ' + catName)
                    console.log('Done with catalog.')
                    wait(callback, 10000)
                }).catch(function(err) {
                    if (err) {
                        console.log('27: ', err)
                        var today = new Date().toString()
                        fs.appendFile('./logs/errors.log', '\n' + today + ' Category: ' + catalog.category + '\n' + err, function(err) {});
                    }
                    console.log('Error with catalog: ', catalog.category)
                    wait(callback, 10000)
                })
            }, function(err) {
                if (err) {
                    console.log('35: ', err)
                    var today = new Date().toString()
                    fs.appendFile('./logs/errors.log', '\n' + today + ' Category: ' + catalog.category + '\n' + err, function(err) {});
                } else {
                    var today = new Date().toString()
                    fs.appendFile('./logs/progress.log', '\n' + today + '***Finished scraping all catalogs***')
                }
                console.log('Finished scraping all catalogs for Urban Outfitters.');

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
            'linkbackname': 'macys.com'
        }, function(e, stores) {
            if (e) {
                console.log(e)
                reject(e)
            }
            if (!stores) {
                reject('No stores in db.')
            }
            if (stores) {
                console.log('Loaded ', stores.length, 'stores.')
                resolve(stores)
            }
        })
    })
}


function loadCatalog(category, stores) {
    return new Promise(function(resolve, reject) {
        // var catInput = category.url.split('/PageIndex')[0].split('/shop/')[1].split('?id=')[0]
        // var onePageUrl = 'http://www1.macys.com/shop/' + catInput + '/Pageindex,Productsperpage/1,All?id=' + category.id;

        console.log('Starting catalog: ', category.category, '\n')
        next = ''
        pageCount = 2;
        async.doWhilst(
            function(finishedPage) {
                //Set global variable here
                var url = next ? next : category.url
                console.log('Current page: ', url)
                loadPages(url, category, stores).then(function(data) {
                    if (data.next && data.next.length > 0) {
                        console.log('Data: ', data.items.length)
                        var catInput = category.url.split('/PageIndex')[0].split('/shop/')[1].split('?id=')[0]
                        category.id = category.url.split('?id=')[1].split('&')[0]
                        next = 'http://www1.macys.com/shop/' + catInput + '/Pageindex,Productsperpage/' + pageCount + ',40?id=' + category.id + '&edge=hybrid'

                        async.eachSeries(data.items, function(item, finishedItem) {
                                var detailsUrl = 'http://www1.macys.com' + item.toString().trim()
                                console.log('\nScraping: ', detailsUrl, '\n');
                                item_scraper(detailsUrl, category.category, stores).then(function(result) {
                                    console.log('Done with item.')
                                    wait(finishedItem, 3000)
                                }).catch(function(err) {
                                    console.log('Item scraper error: ', err)
                                    wait(finishedItem, 3000)
                                })
                            },
                            function(err) {
                                if (err) console.log('192: ', err)
                                pageCount++;
                                console.log('Finished page.')
                                setTimeout(finishedPage, 1000);
                            })
                    } else {
                        console.log('That was the last page')
                        next = ''
                        setTimeout(finishedPage, 1000);
                    }

                }).catch(function(err) {
                    if (err) console.log('99', err);
                    setTimeout(callback, 1000);
                })
            },
            function() {
                return next;
            },
            function(err) {
                if (err) {
                    console.log('109', err)
                    return reject(err)
                }
                console.log('Finished Catalog.')
                resolve()
            }
        );

        function loadPages(url, category, stores) {

            return new Promise(function(resolve, reject) {
                var nightmare = Nightmare();
                nightmare
                    .goto(url)
                    .wait()
                    .wait(5000)
                    .scrollTo(1000000, 0)
                    .wait()
                    .wait(10000)
                    .evaluate(function() {
                        // now we're executing inside the browser scope.
                        return {
                            items: $.map($("a.imageLink"), function(a) {
                                return $(a).attr("href").trim()
                            }),
                            next: $('a.arrowRight').prop('href').trim()
                        }
                    }).then(function(pageData) {
                        setTimeout(resolve(pageData), 1000);
                        console.log('Exiting nightmare..');
                        nightmare.end();
                    })
            })
        }
    })
}

// ** URL to get an array of all productIDs in a catalog // http://www1.macys.com/catalog/category/facetedmeta?edge=hybrid&parentCategoryId=118&categoryId=29891&facet=false&dynamicfacet=true&pageIndex=3&productsPerPage=40&
// ** URL to load pages // http://www1.macys.com/shop/womens-clothing/womens-activewear/Pageindex,Productsperpage/35,40?id=29891&edge=hybrid
// ** URL to load all items per category on one page // http://www1.macys.com/shop/womens-clothing/womens-activewear/Pageindex,Productsperpage/1,All?id=29891&edge=hybrid&cm_sp=us_hdr-_-women-_-29891_activewear_COL1
// ** category.url: http://www1.macys.com/shop/womens-clothing/womens-activewear/Pageindex,Productsperpage/1,All?id=29891&edge=hybrid&cm_sp=us_hdr-_-women-_-29891_activewear_COL1
// var catInput = category.url.split('/PageIndex')[0].split('/shop/')[1].split('?id=')[0]

function wait(callback, delay) {
    var startTime = new Date().getTime();
    while (new Date().getTime() < startTime + delay);
    callback();
}