var scrapers = require('./scrapers');
var getRows = require('./getRows');
var colors = require('colors');
var async = require('async');
var scrapingUtils = require('./scrapingUtils');

getRows().then(function(rows) {
    console.log('got rows');
    async.eachSeries(rows, function(r, done) {
        console.log('\n---------------------------------\n'.blue)
        console.log('processing'.green, r.LinkbackName);
        var url;
        var item;
        var err;
        scrapers.scrapeSiteCatalog(r).then(function(urls) {
            url = urls[0];
            if (urls.length === 0) {
                console.log('no urls found'.red);
                return;
            }

            console.log('found url'.green, urls[0]);
            return scrapers.scrapeItemDetail(urls[0], r).then(function(i) {
                if (i) {
                    item = i;
                }
            })
        }).catch(function(e) {
            err = e;
        }).finally(function() {
            if (err) {
                console.log(err)
            }

            if (item) {
                // show all the scraped info
                scrapingUtils.itemStringFields.map(function(k) {
                    if (item[k]) {
                        console.log(k.green, r[k].cyan, item[k].replace(/\n/g, '\n  '))
                    } else if (!item[k] && r[k]) {
                        console.log(k.red, r[k].cyan)
                    } else {
                        console.log(k.yellow, 'no query selector'.cyan);
                    }
                });
                scrapingUtils.itemArrayFields.map(function(k) {
                    if (item[k] && item[k][0]) {
                        console.log(k.green, r[k].cyan, item[k])
                    } else if ((!item[k] || !item[k][0]) && r[k]) {
                        console.log(k.red, r[k].cyan, item[k])
                    } else {
                        console.log(k.yellow, 'no query selector'.cyan);
                    }
                });
            }
            done();
        });
    })
}).catch(function(e) {
    console.error('error getting rows');
    console.error(e);
})