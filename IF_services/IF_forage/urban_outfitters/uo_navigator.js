//Note: If you are getting 'missing id' logs in console, run uo_store_scraper first.

var cheerio = require('cheerio');
var db = require('db');
var Promise = require('bluebird');
var async = require('async');
var uniquer = require('../../uniquer');
var request = require('request')
var item_scraper = require('./uo_scraper')
var fs = require('fs')

//List of NEW-IN catalogs
var catalogs = [{
    category: 'T-Shirt',
    url: 'http://www.urbanoutfitters.com/urban/catalog/category.jsp?id=M-GRAPHICS&cm_sp=MENS-_-L2-_-MENS:M-GRAPHICS#/'
}, {
    category: 'Top',
    url: 'http://www.urbanoutfitters.com/urban/catalog/category.jsp?id=M_TOPS&cm_sp=MENS-_-L2-_-MENS:M_TOPS#/'
}, {
    category: 'Activewear',
    url: 'http://www.urbanoutfitters.com/urban/catalog/category.jsp?id=UOWW-WACTIVE&cm_sp=WOMENS-_-L2-_-WOMENS:UOWW-WACTIVE#/'
}, {
    category: 'Accessory',
    url: 'http://www.urbanoutfitters.com/urban/catalog/category.jsp?id=WOMENS_ACCESSORIES&cm_sp=WOMENS-_-L2-_-WOMENS:WOMENS_ACCESSORIES'
}, {
    category: 'Shoe',
    url: 'http://www.urbanoutfitters.com/urban/catalog/category.jsp?id=WOMENS_SHOES&cm_sp=WOMENS-_-L2-_-WOMENS:WOMENS_SHOES#/'
}, {
    category: 'Jacket',
    url: 'http://www.urbanoutfitters.com/urban/catalog/category.jsp?id=M_OUTERWEAR&cm_sp=MENS-_-L2-_-MENS:M_OUTERWEAR#/'
}, {
    category: 'Bottom',
    url: 'http://www.urbanoutfitters.com/urban/catalog/category.jsp?id=M_BOTTOMS&cm_sp=MENS-_-L2-_-MENS:M_BOTTOMS#/'
}, {
    category: 'Activewear',
    url: 'http://www.urbanoutfitters.com/urban/catalog/category.jsp?id=UOWW-MACTIVE&cm_sp=MENS-_-L2-_-MENS:UOWW-MACTIVE#/'
}, {
    category: 'Underwear',
    url: 'http://www.urbanoutfitters.com/urban/catalog/category.jsp?id=M_ACC_UNDERWEAR&cm_sp=MENS-_-L2-_-MENS:M_ACC_UNDERWEAR#/'
}, {
    category: 'Accessories',
    url: 'http://www.urbanoutfitters.com/urban/catalog/category.jsp?id=MENS_ACCESSORIES&cm_sp=MENS-_-L2-_-MENS:MENS_ACCESSORIES#/'
}, {
    category: 'Shoes',
    url: 'http://www.urbanoutfitters.com/urban/catalog/category.jsp?id=MENS_SHOES&cm_sp=MENS-_-L2-_-MENS:MENS_SHOES#/'
}, {
    category: 'Dress',
    url: 'http://www.urbanoutfitters.com/urban/catalog/category.jsp?id=W_APP_DRESSES&cm_sp=WOMENS-_-L2-_-WOMENS:W_APP_DRESSES#/'
}, {
    category: 'Denim',
    url: 'http://www.urbanoutfitters.com/urban/catalog/category.jsp?id=W-DENIM&cm_sp=WOMENS-_-L2-_-WOMENS:W-DENIM#/'
}, {
    category: 'Top',
    url: 'http://www.urbanoutfitters.com/urban/catalog/category.jsp?id=W_TOPS&cm_sp=WOMENS-_-L2-_-WOMENS:W_TOPS#/'
}, {
    category: 'Jacket',
    url: 'http://www.urbanoutfitters.com/urban/catalog/category.jsp?id=W_OUTERWEAR&cm_sp=WOMENS-_-L2-_-WOMENS:W_OUTERWEAR#/'
}, {
    category: 'Bottom',
    url: 'http://www.urbanoutfitters.com/urban/catalog/category.jsp?id=W_BOTTOMS&cm_sp=WOMENS-_-L2-_-WOMENS:W_BOTTOMS#/'
}, {
    category: 'Underwear',
    url: 'http://www.urbanoutfitters.com/urban/catalog/category.jsp?id=W_INTIMATES&cm_sp=WOMENS-_-L2-_-WOMENS:W_INTIMATES'
}]


//This will loop forever through each of the catalogs listed above
async.whilst(
    function() {
        return true
    },
    function(loop) {
        async.eachSeries(catalogs, function(catalog, callback) {
            loadCatalog(catalog).then(function(res) {
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
    },
    function(err) {

    })

function loadCatalog(category) {
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
                    item_scraper(detailsUrl, category.category).then(function(result) {
                        // console.log('Done.**')
                        wait(callback, 3000)
                    }).catch(function(err) {
                        console.log('Item scraper error: ',err)
                        wait(callback, 3000)
                    })
                }, function(err) {
                    if (err) console.log('async error, nav 129: ',err)
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