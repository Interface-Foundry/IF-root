var job = require('job');
var Promise = require('bluebird');
var request = require('request');
var cheerio = require('cheerio');
var db = require('db');

// queue for scraping
var scrape = job('scrape-generic-site');

// array of sites to scrape
var sites = [];

// anine bing, LA
var anineBing = {
    setUp: function() {
        db.Landmarks.findOne({
            name: 'Anine Bing',
            world: true
        }).exec(function(e, l) {
            
        })
    },
    getUrls: function() {
        return new Promise(function(resolve, reject) {
            var url = 'http://www.aninebing.com/collections/new-arrivals';
            request(url, function (e, r, b) {
                if (e) {
                    reject(e);
                }
                var $ = cheerio.load(b);
                var urls = $('#collection-grid .prod-image-wrap>a').map(function(){return 'http://www.aninebing.com' + $(this).attr('href')})
                resolve(urls);
            })
        });
    },
    linkbackname: 'aninebing.com',
    wrapper: 'section.content',
    name: 'h1.product-title',
    price: '.price',
    description: '#description',
    itemImageURL: 'product-images=>data-src'
}


// scrape all sites
sites.map(function(site) {
    site.setUp()
        .then(function(siteData) {
            site.getUrls().then(function(urls) {
                urls.map(function(url) {
                    scrape({
                        url: url,
                        parentId: siteData.parentId,
                        ownerId: siteData.ownerId,
                        linkbackname: site.linkbackname,
                        wrapper: site.wrapper,
                        name: site.name,
                        price: site.price,
                        description: site.description,
                        categories: site.categories,
                        itemImageURL: site.itemImageURL,
                        related: site.related
                    })
                })
            })
        })
});

