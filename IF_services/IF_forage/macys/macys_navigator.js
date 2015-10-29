//TO RUN ON UBUNTU SERVERS 
//I know this is so annoying
//
// sudo apt-get update

// sudo apt-get install -y libgtk2.0-0 libgconf-2-4 libasound2 libxtst6 libxss1 libnss3 xvfb

// npm install segmentio/nightmare

// NODE_ENV=production xvfb-run -a node ~/root/IF_services/IF_forage/macys/macys_navigator.js

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


//This will loop forever through each of the catalogs listed above
async.whilst(
    function() {
        return true
    },
    function(loop) {
        loadStores().then(function(stores) {
            // console.log(1)
            async.eachSeries(catalogs, function(catalog, callback) {
                // console.log(2)
                loadCatalog(catalog, stores).then(function(res) {
                    // console.log(3)
                    var today = new Date().toString()
                    console.log('catalog.category', catalog.category)
                    var catName = catalog.category.trim();
                    // fs.appendFile('./logs/progress.log', '\n' + today + 'Finished scraping  category: ' + catName)
                    console.log('Done with catalog.');
                    wait(callback, 10000);
                }).catch(function(err) {
                    if (err) {
                        console.log('27: ', err)
                        var today = new Date().toString()
                            // fs.appendFile('./logs/errors.log', '\n' + today + ' Category: ' + catalog.category + '\n' + err, function(err) {});
                    }
                    console.log('Error with catalog: ', catalog.category)
                    wait(callback, 10000)
                })
            }, function(err) {
                if (err) {
                    console.log('35: ', err)
                    var today = new Date().toString()
                        // fs.appendFile('./logs/errors.log', '\n' + today + ' Category: ' + catalog.category + '\n' + err, function(err) {});
                } else {
                    var today = new Date().toString()
                        // fs.appendFile('./logs/progress.log', '\n' + today + '***Finished scraping all catalogs***')
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
            "loc": {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [-73.9894285, 40.7393083]
                    },
                    $maxDistance: 9656064
                }
            },
            "linkbackname": "macys.com",
            "source_generic_store": {
                $exists: true
            }
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
                            console.log('Data: ', data.items.length);
                            var catInput = category.url.split('/PageIndex')[0].split('/shop/')[1].split('?id=')[0]
                            category.id = category.url.split('?id=')[1].split('&')[0]
                            next = 'http://www1.macys.com/shop/' + catInput + '/Pageindex,Productsperpage/' + pageCount + ',40?id=' + category.id + '&edge=hybrid';
                            async.eachSeries(data.items, function(item, finishedItem) {
                                    var detailsUrl = 'http://www1.macys.com' + item.toString().trim()
                                    console.log('\nScraping: ', detailsUrl, '\n');
                                    item_scraper(detailsUrl, category.category, stores).then(function(result) {
                                            console.log('Done with item.')
                                            wait(function() {
                                                finishedItem()
                                            }, 3000)
                                        })
                                        .timeout(820000)
                                        .catch(function(err) {
                                            if (err) console.log('Item scraper error: ', err)
                                            var today = new Date().toString()
                                            wait(function() {
                                                finishedItem()
                                            }, 3000)
                                        })
                                },
                                function(err) {
                                    if (err) console.log('192: ', err)
                                    pageCount++;
                                    console.log('Finished page.')
                                    wait(function() {
                                        finishedPage()
                                    }, 1000);
                                })
                        } else {
                            console.log('That was the last page')
                            next = ''
                            wait(function() {
                                finishedPage()
                            }, 1000);
                        }
                    })
                    .timeout(820000)
                    .catch(function(err) {
                        if (err) console.log('99', err);
                        var today = new Date().toString()
                            // fs.appendFile('./logs/errors.log', '\n' + today + ' Category: ' + category.category + '\n' + 'Timed out!!!', function(err) {});
                        return reject('LoadPages error.')
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
                    // try {
                    //****NIGHTMARE ATTEMPT****** 
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
                                    return $(a).attr("href")
                                }),
                                next: $("a.arrowRight").prop("href")
                            }
                        }).then(function(pageData) {
                            console.log('Exiting nightmare..');
                            nightmare.end(function() {
                                wait(function() {
                                    return resolve(pageData)
                                }, 2000);
                            });
                        }, function(err) {
                            if (err) console.log('Error: ', err)
                            reject(err)
                        })
                })
                .cancellable()
                .catch(function(e) {
                    throw e;
                })
        }
    })
}


//****NODE PHANTOM ATTEMPT******
// phantom.create(function(ph) {
//     ph.createPage(function(page) {
//         page.open(url,
//             function(status) {
//                 console.log('Opened site? %s', status);
//                 // page.scrollPosition = {
//                 //     top: 100000,
//                 //     left: 0
//                 // };

//                 page.evaluate(function() {
//                     console.log('Evaluating page..')
//                     try {
//                         var itemElements = document.querySelectorAll('a.imageLink')
//                         var items = Array.prototype.map.call(linkElements, function(e) {
//                             return e.getAttribute('href').trim();
//                         });
//                         var nextElements = document.querySelectorAll('a.arrowRight')
//                         var next = Array.prototype.map.call(nextElements, function(e) {
//                             return e.getAttribute('href').trim();
//                         });
//                         var data = {
//                             items: items,
//                             next: next
//                         }
//                         console.log('!!', data)
//                         resolve(data)
//                     } catch (err) {
//                         console.log('OMGGGS', err)
//                     }
//                 })

//                 // wait(function() {
//                 //     delayedScrape(page, ph).then(function(data) {
//                 //         console.log('Data: ', data)
//                 //         ph.exit();
//                 //         wait(function() {
//                 //             resolve(data)
//                 //         }, 1000);
//                 //     }, function(err) {
//                 //         ph.exit();
//                 //         if (err) {
//                 //             console.log('188:', err)
//                 //             reject(err)
//                 //         }
//                 //     })
//                 // }, 6000)
//             });
//     });
// });


//****CASPER ATTEMPT****** (failed due to using only old version of phantom and no longer maintained)
// function getLinks() {
//     var links = document.querySelectorAll('a.imageLink');
//     return Array.prototype.map.call(links, function(e) {
//         return e.getAttribute('href').trim();
//     });
// }

// function getNext() {
//     var links = document.querySelectorAll('a.arrowRight');
//     return Array.prototype.map.call(links, function(e) {
//         return e.getAttribute('href').trim();
//     });
// }

// casper.start(url, function() {
//     this.wait(5000, function() {
//         this.echo("I've waited for 5 seconds.");
//     });
// }).then(function() {
//     this.scrollToBottom();
// }).then(function() {
//      this.wait(10000, function() {
//         this.echo("I've waited for 10 seconds.");
//     });
// }).then(function() {
//     var itemLinks = this.evaluate(getLinks);
//     var nextLinks = this.evaluate(getNext);
//     var pageData = {
//         items: itemLinks,
//         next: nextLinks
//     }
//     setTimeout(resolve(pageData), 1000);
// });




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