var cheerio = require('cheerio');
var db = require('db');
var Promise = require('bluebird');
var async = require('async');
var uniquer = require('../../uniquer');
var request = require('request')
var item_scraper = require('./item_scraper')

//List of Zara NEW-IN catalogs
var womens = 'http://www.zara.com/us/en/new-in/woman/view-all-c756542.html'
var mens = 'http://www.zara.com/us/en/new-in/man/view-all-c758514.html'
var trf = 'http://www.zara.com/us/en/new-in/trf-c749006.html'
var girls = 'http://www.zara.com/us/en/new-in/girl-c286502.html'
var boys = 'http://www.zara.com/us/en/new-in/boy-c286503.html'
var babygirls = 'http://www.zara.com/us/en/new-in/baby-girl-c286504.html'
var babyboys = 'http://www.zara.com/us/en/new-in/baby-boy-c286505.html'
var mini = 'http://www.zara.com/us/en/new-in/mini-c286506.html'
var catalogs = [womens, mens, trf, girls, boys, mini, babygirls, babyboys]

//This will loop forever through each of the catalogs listed above
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
                console.log('Error with catalog: ', catalog)
                wait(callback, 10000)
            })
        }, function(err) {
            console.log('Finished scraping all catalogs. Restarting in 2000 seconds.')
            wait(loop, 2000000)
        })
    },
    function(err) {

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

                    if (detailsUrl.toString().indexOf('new-in') == -1) {
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