var quickflow = module.exports = require('quickflow')()

function setup(data, done) {
    require('colors');
    require('vvv');
    var db = require('db');
    db.Landmarks.find({
        world: true,
        'source_generic_store.source': 'dsw'
    }).select('id name').exec(function(e, l) {
        if (e) { console.error(e); return}
        global.stores = l.map(function(s) {
            return {
                mongoId: s._id.toString(),
                id: s.id,
                name: s.name
            };
        });
        done();
    })
}

function getCatalogURLs(data, done) {
var urls = ['http://www.dsw.com/Womens-Shoes-New-Arrivals/_/N-271o?activeCategory=102442'];

urls.map(done);
}

function getItemURLs(data, done) {
var kipScrapeTools = require('../kipScrapeTools');

if (!data) {
  return
}

console.log(data)

kipScrapeTools.load(data, function($) {
  $('.productContainer .productImage>a').map(function() {
    return $(this).attr('href');
  }).toArray().filter(function(u) {
    return u.indexOf('javascript') !== 0;
  }).map(function(u) {
    return 'http://www.dsw.com' + u;
  }).slice(0,1).map(done)
})
}

function log(data, done) {
// you don't even have to call done() if you don't want to
// all logging is up to you, so you don't have to rely on
// a complicated framework convention to make things work.
console.log(data)
}

function scrapeItem(data, done) {
var kipScrapeTools = require('../kipScrapeTools')

// looks like http://www.dsw.com/shoe/crown+vintage+natasha+bootie?prodId=333140&activeCategory=102444&category=dsw12cat880002&activeCats=cat10006,dsw12cat880002
var urlParts = data.split(/[/?&=]/);
var productId = urlParts[6];
var categoryId = urlParts[8];

console.log(data);

kipScrapeTools.load(data, function($) {
  var sizes = $('select.sizes option').map(function() {
    return {
      text: parseFloat($(this).html()),
      id: $(this).attr('value')
    }
  }).toArray().filter(function(a) {
    return !!a.id;
  })
  
  var widths = $('select.widths option').map(function() {
    return parseFloat($(this).html())
  }).toArray().filter(function(a) {
    return !!a;
  })

    var colors = $('#colors img').map(function() {
        return {id: $(this).attr('id'), swatch: $(this).attr('src'), name: $(this).attr('alt')};
    }).toArray();
  
  var images = $('#productImageSpinset .tile_container img').map(function() {
    return $(this).attr('src');
  }).toArray();
  
  var relatedItemURLs = $('#productRecommendationZone .productName a').map(function() {
    return $(this).attr('href');
  }).toArray();
  
  done({
    url: data,
    productId: productId,
    categoryId: categoryId,
    sizes: sizes,
    images: images,
    name: $('.title').text().trim(),
    price: $('.priceSelected').text().trim(),
    description: $('#productDesc').text().trim(),
    relatedItemURLs: relatedItemURLs,
    colors: colors
  })
  
})
}

function findStores(data, done) {
var request = require('request');
var cheerio = require('cheerio');
var Promise = require('bluebird');

var url = 'http://www.dsw.com/dsw_shoes/product/$id/find'.replace('$id', data.productId);
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
  // return a promise
  var form = {
      sizes: size,
      widths: 'M',
      zipCode: zipcode,
      'lineItem.product.id': data.productId,
      color: color,
      size: size,
      width: 'M'
  };

    return new Promise(function(resolve, reject) {
        request.post({
            url: url,
            headers: headers,
            form: form
        }, function(e, r, b) {
            var $ = cheerio.load(b);

            var stores = $('#searchResultsTable tr').map(function() {
                var row = $(this);
                var store = {};
                store.id = row.find('input[name="lineItem.storeId"]').val()
                if (!store.id) { return store }
                var r = new RegExp(store.id + '$');
                store.landmark = global.stores.filter(function(s) {
                    return !!s.id.match(r);
                })[0];
                return store;
            }).toArray();
            resolve(stores);
        })
    })
}

    var zipcodes = ['10002'];

var promises = [];
var items = [];
data.colors.map(function(color) {
  data.sizes.map(function(size) {
    zipcodes.map(function(zipcode) {
      promises.push(checkAvailability(color, size.id, zipcode).then(function(stores) {
        stores.map(function(store) {
            if (!store.id || !store.landmark) return;
            items.push({
                color: color,
                size: size,
                zipcode: zipcode,
                store: store
            });
        })
      }))
    })
  })
})

    Promise.settle(promises).then(function() {
        console.log(JSON.stringify(data, null, 2));
        // turn this steaming pile of shit into real items.
        // the unique identify for each item is a composite key: productId + colorId + storeId\
        var itemHashmap = {};
        items.map(function(i) {
            var key =
        })
        done(data);
    })
}

quickflow.connect(setup, getCatalogURLs)
quickflow.connect(getCatalogURLs, getItemURLs)
quickflow.connect(getItemURLs, log)
quickflow.connect(getItemURLs, scrapeItem)
quickflow.connect(scrapeItem, log)
quickflow.connect(scrapeItem, findStores)
if (!module.parent) quickflow.run()