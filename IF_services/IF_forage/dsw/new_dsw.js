require('colors');
require('vvv');
var kipScrapeTools = require('../kipScrapeTools');
var db = require('db');
var _ = require('lodash');

/**
 * First get all the stores and the dsw user, so we can reference them later on without additional db calls.
 */
var dswStores;
var dswUser;
db.Landmarks.find({
    world: true,
    'source_generic_store.source': 'dsw'
}).select('id name loc').exec(function (e, l) {
    if (e) {
        console.error(e);
        return
    }
    dswStores = l.map(function (s) {
        return {
            mongoId: s._id.toString(),
            id: s.id,
            name: s.name,
            loc: s.loc.toObject()
        };
    });
    db.Users.findOne({profileID: 'dsw'}, function(e, u) {
        if (e) { console.error(e); return }
        dswUser = u;
        getCatalogURLs()
    });
})

function getCatalogURLs() {
    var urls = ['http://www.dsw.com/Womens-Shoes-New-Arrivals/_/N-271o?activeCategory=102442'];

    urls.map(getItemURLs);
}

function getItemURLs(catalogUrl, done) {

    if (!catalogUrl) {
        return
    }

    console.log(catalogUrl)

    kipScrapeTools.load(catalogUrl, function ($) {
        $('.productContainer .productImage>a').map(function () {
            return $(this).attr('href');
        }).toArray().filter(function (u) {
            return u.indexOf('javascript') !== 0;
        }).map(function (u) {
            return 'http://www.dsw.com' + u;
        }).slice(0, 1).map(scrapeItem)
    })
}
function scrapeItem(itemUrl, done) {
// looks like http://www.dsw.com/shoe/crown+vintage+natasha+bootie?prodId=333140&activeCategory=102444&category=dsw12cat880002&activeCats=cat10006,dsw12cat880002
    var urlParts = itemUrl.split(/[/?&=]/);
    var productId = urlParts[6];
    var categoryId = urlParts[8];

    console.log('scraping', itemUrl);

    kipScrapeTools.load(itemUrl, function ($) {
        log.vv('loaded', itemUrl);
        var sizes = $('select.sizes option').map(function () {
            return {
                text: parseFloat($(this).html()),
                id: $(this).attr('value')
            }
        }).toArray().filter(function (a) {
            return !!a.id;
        })

        var widths = $('select.widths option').map(function () {
            return parseFloat($(this).html())
        }).toArray().filter(function (a) {
            return !!a;
        })

        var colors = $('#colors img').map(function () {
            return {
                id: $(this).attr('id').replace('colors_', ''),
                swatch: $(this).attr('src'),
                name: $(this).attr('alt')
            };
        }).toArray();

        var images = $('#productImageSpinset .tile_container img').map(function () {
            return $(this).attr('src');
        }).toArray();

        var relatedItemURLs = $('#productRecommendationZone .productName a').map(function () {
            return $(this).attr('href');
        }).toArray();

        var tags = $('.breadcrumb a.breadcrumbText').map(function() {
            return $(this).text()
        }).toArray();

        var item = {
            source: 'dsw',
            url: itemUrl,
            productId: productId,
            categoryId: categoryId,
            sizes: sizes, // all sizes in all locations
            sizesInStock: [], // only sizes at this location
            images: images,
            name: $('.title').text().trim(),
            price: $('.priceSelected').text().trim(),
            description: $('#productDesc').text().trim(),
            relatedItemURLs: relatedItemURLs,
            colors: colors,
            colorsInStock: [],
            tags: tags
        }

        log.v(JSON.stringify(item, null, 2))

        findStores(item, function (stores) {
            var newItems = {};
            // unravel this mess into a whole bunch of kip items.
            item.colors.map(function(color) {
                stores.map(function(store) {
                    var kipId = ['dsw_', item.name.toLowerCase().replace(/[^\w^\d]/g, ''), item.productId, color.id, store.id].join('_');
                    if (newItems[kipId]) {
                        if (newItems[kipId].source_generic_item.sizesInStock.indexOf(store.size) < 0) {
                            newItems[kipId].source_generic_item.sizesInStock.push(store.size)
                        }

                        if (newItems[kipId].source_generic_item.colorsInStock.indexOf(store.color) < 0) {
                            newItems[kipId].source_generic_item.colorsInStock.push(store.color)
                        }
                    } else {
                        newItems[kipId] = {
                            id: kipId,
                            name: item.name,
                            world: false,
                            parent: {
                                mongoId: store.landmark.mongoId,
                                name: store.landmark.name,
                                id: store.landmark.id
                            },
                            owner: dswUser,
                            valid: true,
                            status: 'scraped',
                            loc: store.landmark.loc,
                            description: item.description,
                            source_generic_item: _.cloneDeep(item),
                            price: db.Landmark.priceStringToNumber(item.price),
                            priceRange: db.Landmark.priceToPriceRange(item.price),
                            itemTags: {
                                colors: colors.map(function(c) { return c.name }),
                                text: ['shoes'].concat(item.tags),
                                categories: ['Shoes']
                            },
                            linkback: item.url,
                            linkbackname: 'dsw.com',
                            updated_time: new Date()
                        };
                        newItems[kipId].source_generic_item.sizesInStock = [store.size]
                        newItems[kipId].source_generic_item.colorsInStock = [store.color]
                    }

                    log.vv(newItems);
                    debugger;

                    Object.keys(newItems).map(function(k) {
                        upsert(newItems[k], function() {
                            // whoop
                        })
                    })
                })
            })
        })

    })
}

function findStores(item, done) {
    log.v('finding stores for item', item.productId)
    var request = require('request');
    var cheerio = require('cheerio');
    var Promise = require('bluebird');

    var url = 'http://www.dsw.com/dsw_shoes/product/$id/find'.replace('$id', item.productId);
    var headers = {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.130 Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Host': 'www.dsw.com',
        'Origin': 'http://www.dsw.com',
        'Referer': 'http://www.dsw.com/shoe/converse+chuck+taylor+all+star+madison+sneaker+-+womens?prodId=331469&activeCategory=102444&category=dsw12cat880002&activeCats=cat10006,dsw12cat880002',
        'Cookie': 'JSESSIONID=UBaheq8bn75GZEB6RvYldBsp.ATGPS03; __utmt=1; collectionJustSampled=false; navHistory=%7B%22left%22%3A%7B%22path%22%3A%5B%7B%22text%22%3A%22New%20Arrivals%22%7D%5D%2C%22hier%22%3A%5B%7B%22text%22%3A%22New%20Arrivals%22%2C%22clicked%22%3Atrue%7D%5D%2C%22count%22%3A1%7D%2C%22top%22%3A%7B%22path%22%3A%5B%22WOMEN%22%2C%22WOMEN%22%2C%22WOMEN%22%5D%2C%22hier%22%3A%22WOMEN%22%2C%22count%22%3A3%7D%7D; mbox=PC#1440452491506-678827.28_39#1442008423|check#true#1440798883|session#1440798810310-115384#1440800683; __utma=253152284.2073109278.1440452492.1440791106.1440798810.4; __utmb=253152284.4.10.1440798810; __utmc=253152284; __utmz=253152284.1440791106.3.2.utmcsr=dsw.com|utmccn=(referral)|utmcmd=referral|utmcct=/Womens-Shoes-New-Arrivals/_/N-271o; DSWsession=%7B%22auth%22%3Afalse%2C%22expiredPassword%22%3Afalse%2C%22shedding%22%3Afalse%2C%22myUSOverlay%22%3Atrue%2C%22billingPostalCode%22%3A%22%22%7D; DSWstorage=%7B%22pid%22%3A%221965409799%22%2C%22fn%22%3A%22%22%2C%22ldw%22%3A%22A01%22%2C%22lod%22%3A%229999-09-09%22%2C%22pseg%22%3A%22ANON%22%2C%22bagcount%22%3A%220%22%2C%22countryCode%22%3A%22US%22%2C%22segment%22%3A%22FEMALE%22%7D; s_pers=%20s_vnum%3D1441080000487%2526vn%253D5%7C1441080000487%3B%20s_dp_persist%3DWomen%7C1440885213044%3B%20s_nr%3D1440798829169-Repeat%7C1443390829169%3B%20s_invisit%3Dtrue%7C1440800629172%3B%20s_lv%3D1440798829176%7C1535406829176%3B%20s_lv_s%3DLess%2520than%25201%2520day%7C1440800629176%3B%20gpv_pt%3Dpdp%7C1440800629182%3B%20gpv_pn%3DBOPIS%2520STOCK%2520LOCATOR%253A%2520SEARCH%7C1440800629184%3B; s_sess=%20s_cc%3Dtrue%3B%20s_evar7%3D4%253A30PM%3B%20s_evar8%3DFriday%3B%20s_evar9%3DWeekday%3B%20s_evar10%3DRepeat%3B%20s_evar11%3D5%3B%20s_evar12%3DLess%2520than%25201%2520day%3B%20s_sq%3D%3B; s_vi=[CS]v1|2AEDC7C20507A515-4000010D4004B806[CE]',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.8'
    }

    function checkAvailability(color, size, zipcode) {
        log.v('checking availability for', color, size, zipcode);
        // return a promise
        var form = {
            sizes: size,
            widths: 'M',
            zipCode: zipcode,
            'lineItem.product.id': item.productId,
            color: color,
            size: size,
            width: 'M'
        };

        return new Promise(function (resolve, reject) {
            request.post({
                url: url,
                headers: headers,
                form: form
            }, function (e, r, b) {
                var $ = cheerio.load(b);

                var stores = $('#searchResultsTable tr').map(function () {
                    var row = $(this);
                    var store = {};
                    store.id = row.find('input[name="lineItem.storeId"]').val()
                    if (!store.id) {
                        return store
                    }
                    var r = new RegExp(store.id + '$');
                    store.landmark = dswStores.filter(function (s) {
                        return !!s.id.match(r);
                    })[0];
                    return store;
                }).toArray().filter(function(s) {
                    return (s.id !== "");
                })
                log.vv(JSON.stringify(stores, null, 2));
                if (stores.length === 0) {
                    log.v('out of stock for', color, size, zipcode)
                } else {
                    log.v('found', stores.length, 'stores for', color, size, zipcode)
                }
                resolve(stores);
            })
        })
    }

    var zipcodes = ['10002'];

    var promises = [];
    var stores = [];
    item.colors.map(function (color) {
        item.sizes.map(function (size) {
            zipcodes.map(function (zipcode) {
                promises.push(checkAvailability(color.id, size.id, zipcode).then(function (s) {
                    s.map(function (store) {
                        if (!store.id || !store.landmark) return;
                        stores.push({
                            color: color,
                            size: size,
                            zipcode: zipcode,
                            landmark: store.landmark,
                            id: store.id
                        });
                    })
                }))
            })
        })
    })

    Promise.settle(promises).then(function () {
        log.v('found', stores.length, 'stores for product', item.productId);
        done(stores);
    })
}

/**
 * Updates or inserts an item into the db.
 * @param item
 * @param callback
 */
function upsert(item, callback) {
    db.Landmarks.findOne({
        id: item.id
    }, function(e, i) {
        if (e) { console.log(e); return; }
        if (i) {
            _.merge(i, item);
            i.markModified('source_generic_item')
            return i.update(function(e) {
                if (e) { console.error(e); return; }
                console.log('saved item', i.id);
            })
        } else {
            i = new db.Landmark(item);
            i.save(function (e) {
                if (e) {
                    console.error(e);
                    return;
                }
                console.log('saved item', i.id);
            })
        }
    })
}