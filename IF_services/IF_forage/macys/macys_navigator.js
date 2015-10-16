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
                    console.log('catalog.category',catalog.category)
                    var catName = catalog.category.trim()
                    fs.appendFile('./logs/progress.log', '\n' + today + 'Finished scraping  category: ' + catName)
                    console.log('Done with catalog.')
                    wait(callback, 10000)
                }).catch(function(err) {
                    if (err) {
                        console.log('27: ',err)
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

        console.log('Starting catalog: ', category.category)
        category.id = category.url.split('?id=')[1].split('&')[0]
        pageCount = 1;
        lastPage = null;
        async.doWhilst(
            function(callback) {
                console.log('Current page: ', pageCount)
                loadPage(pageCount, category, stores).then(function(max) {
                    if (pageCount == 1) {
                        lastPage = max
                        console.log('Max page set:', lastPage)
                    }
                    pageCount++
                    callback()
                }).catch(function(err) {
                    if (err) console.log('99',err);
                    setTimeout(callback, 1000);
                })

            },
            function() {
                return pageCount <= lastPage;
            },
            function(err) {
                if (err) {
                    console.log('109',err)
                    return reject(err)
                }
                console.log('Finished Catalog.')
                resolve()
            }
        );

    })
}

function loadPage(pageCount, category, stores) {
    return new Promise(function(resolve, reject) {

        // http://www1.macys.com/shop/womens-clothing/womens-activewear/Pageindex,Productsperpage/35,40?id=29891&edge=hybrid

        var url = pageCount > 1 ? 'http://www1.macys.com/shop/womens-clothing/womens-activewear/Pageindex,Productsperpage/' + pageCount + ',40?id=' + category.id + '&edge=hybrid' : category.url
        // console.log('Current page: ', url)
        var options = {
            url: url,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13'
            }
        };

        request(options, function(error, response, body) {
            if ((!error) && (response.statusCode == 200)) {
                $ = cheerio.load(body); //load HTML
                // console.log($('a.paginationSpacer'))
                if (pageCount == 1 && $('div.pagination a')) {
                    var temp = []
                    for (var key in $('div.pagination a')) {
                        if ($('div.pagination a').hasOwnProperty(key) && $('div.pagination a')[key].attribs && $('div.pagination a')[key].attribs.href) {
                            temp.push($('div.pagination a')[key].attribs.href)
                        }
                    }
                    temp = _.uniq(temp)
                    if (temp.length > 0) {
                           lastPage = parseInt(temp[temp.length - 1].split('&pageIndex=')[1])
                       } else {
                        console.log('There is only one page',temp)
                        lastPage = 0
                       }
                 
                        // console.log(lastPage)
                    resolve(lastPage)
                }

                async.eachSeries($('a.imageLink'), function(item, callback) {
                    if (!item.attribs.href) {
                        console.log('invalid!')
                        return callback()
                    }
                    var detailsUrl = 'http://www1.macys.com' + item.attribs.href.toString().trim()

                    console.log('Scraping: ', detailsUrl)
                    // console.log('.')
                    // callback()
                    
                    item_scraper(detailsUrl, category.category, stores).then(function(result) {
                    console.log('Done.**')
                    wait(callback, 3000)
                    }).catch(function(err) {
                        console.log('Item scraper error: ', err)
                        wait(callback, 3000)
                    })


                }, function(err) {
                    if (err) console.log('192 : ', err)
                    // console.log('Done scraping page.')
                    resolve()
                })


            } else {
                if (error) {
                    console.log('200 error: ', error)
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