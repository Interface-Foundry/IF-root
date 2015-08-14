var scrapers = require('./scrapers');
var getRows = require('./getRows');
var colors = require('colors');
var async = require('async');

getRows().then(function(rows) {
    console.log('got rows');
    async.map(rows, function(r, done) {
        var url;
        var item;
        var err;
        scrapers.scrapeSiteCatalog(r).then(function(urls) {
            url = urls[0];
            console.log('got urls:', urls[0]);
            return scrapers.scrapeItemDetail(urls[0], r).then(function(i) {
                item = i;
            })
        }).catch(function(e) {
            err = e;
        }).finally(function() {
            console.log(url.blue);
            if (err) {
                console.log(err)
            }
            console.log(JSON.stringify(item, null, 2));
            done();
        });
    })
}).catch(function(e) {
    console.error('error getting rows');
    console.error(e);
})