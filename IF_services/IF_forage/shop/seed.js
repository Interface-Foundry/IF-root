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
    getUrls: function() {
        return new Promise(function(resolve, reject) {
            var url = 'http://www.aninebing.com/collections/new-arrivals';
            request(url, function (e, r, b) {
                if (e) {
                    reject(e);
                }
                var $ = cheerio.load(b);
                var urls = $('#collection-grid .prod-image-wrap>a').map(function(){
                    return 'http://www.aninebing.com' + $(this).attr('href')
                }).toArray();
                resolve(urls);
            })
        });
    },
    storeName: 'Anine Bing',
    storeAddress: '8130 W 3rd St Los Angeles, CA 90048',
    storeLoc: {type: 'Point', coordinates: [-118.367010, 34.072209]},
    storeId: 'aninebing',
    linkbackname: 'aninebing.com',
    wrapper: 'section.content',
    name: 'h1.product-title',
    price: '.price',
    description: '#description',
    itemImageURL: '.product-images img=>data-src'
};
sites.push(anineBing);


var creaturesOfComfort = {
    getUrls: function() {
        var url = 'http://shop.creaturesofcomfort.us/newarrivals.aspx';
        return new Promise(function(resolve, reject) {
            request(url, function (e, r, b) {
                if (e) {
                    reject(e);
                }
                var $ = cheerio.load(b);
                var urls = $('.product_wrapper>a.product_details').map(function(){
                    return 'http://shop.creaturesofcomfort.us' + $(this).attr('href')
                }).toArray();
                resolve(urls);
            })
        });
    },
    storeName: 'Creatures of Comfort',
    storeAddress: '7971 Melrose Ave, Los Angeles, CA 90046',
    storeLoc: {type: 'Point', coordinates: [-118.3634901, 34.0839154]},
    storeId: 'creaturesofcomfort',
    linkbackname: 'creaturesofcomfort.us',
    name: '.productDetailText>h1',
    price: '.price',
    description: '.description',
    itemImageURL: 'a.MagicThumb-swap=>href'
}
sites.push(creaturesOfComfort);


function seed(site) {
    (new Promise(function(resolve, reject) {
        //make sure there's a user who is the owner in the database
        db.Users.findOne({
            name: site.storeName,
            addr: site.storeAddress
        }).exec(function(e, u) {
            if (e) {
                console.error(e);
                reject(e);
            }
            if (u) {
                site.owner = u.getSimpleUser();
                delete site.owner.avatar;
                resolve();
            } else {
                var owner = new db.User({
                    name: site.storeName,
                    addr: site.storeAddress,
                    profileID: site.storeId
                });
                owner.save(function(e, o) {
                    if (e) {
                        console.error(e);
                        return reject(e);
                    }
                    site.owner = o.getSimpleUser();
                    delete site.owner.avatar;
                    resolve();
                })
            }
        })
    })).then(function() {
        return new Promise(function(resolve, reject) {
            //make sure there's a store who is the parent in the database
            db.Landmarks.findOne({
                name: site.storeName
            }).exec(function(e, l) {
                if (e) {
                    console.error(e);
                    reject(e);
                }
                if (l) {
                    site.parent = l.getSimpleItem();
                    delete site.parent.itemImageURL;
                    resolve();
                } else {
                    var store = new db.Landmark({
                        owner: site.owner,
                        world: true,
                        id: site.storeId,
                        loc: site.storeLoc,
                        valid: true,
                        addressString: site.storeAddress,
                        name: site.storeName

                    });
                    store.save(function(e, s) {
                        if (e) {
                            console.error(e);
                            return reject(e);
                        }

                        site.parent = s.getSimpleItem();
                        delete site.parent.itemImageURL;
                        resolve();
                    })
                }
            })
        })
        }).then(function() {
            site.getUrls().then(function(urls) {
                urls.map(function(url) {
                    scrape({
                        url: url,
                        loc: site.storeLoc,
                        parent: site.parent,
                        owner: site.owner,
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
}

sites.map(seed);

