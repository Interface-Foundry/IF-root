require('colors');
require('vvv');
var kipScrapeTools = require('../kipScrapeTools');
var db = require('db');
var _ = require('lodash');
var job = require('job');
var scrapeShoe = job('scrape-dsw');

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
  // got this from
  /*
  loading the dsw women's shoes page TODO men's shoes
  var x = $('#leftNavZone a[data-omniture-info]')
  s = x.map(function() { return $(this).attr('href')}).toArray()
  */
    var urls = ['/Womens-Shoes-New-Arrivals/_/N-271o?activeCategory=102442',
  '/Womens-Shoes-Top-Rated/_/N-27cq?activeCategory=102442',
  '/Womens-Shoes-Marie-Claire-Shoes-First/_/N-lzwy?activeCategory=102442',
  '/Womens-Shoes-The-Trend-Spot/_/N-27cx?activeCategory=102442',
  '/Womens-Shoes-Luxury/_/N-27d1?activeCategory=102442',
  '/Womens-Shoes-Boots-Under-50/_/N-lzwg?activeCategory=102442',
  '/Womens-Shoes-Boots-Under-100/_/N-lzwx?activeCategory=102442',
  '/Womens-Shoes-Boots/_/N-273d?activeCategory=102442',
  '/Womens-Shoes-Sandals/_/N-272u?activeCategory=102442',
  '/Womens-Shoes-Pumps-and-Heels/_/N-2735?activeCategory=102442',
  '/Womens-Shoes-Evening-and-Wedding/_/N-27dn?activeCategory=102442',
  '/Womens-Shoes-Flats/_/N-273c?activeCategory=102442',
  '/Womens-Shoes-Clogs-and-Mules/_/N-lzvn?activeCategory=102442',
  '/Womens-Shoes-Loafers-and-Slip-Ons/_/N-27dm?activeCategory=102442',
  '/Womens-Shoes-Oxfords-and-Lace-Ups/_/N-27dl?activeCategory=102442',
  '/Womens-Shoes-Comfort/_/N-273n?activeCategory=102442',
  '/Womens-Shoes-Wide-Width/_/N-27dw?activeCategory=102442',
  '/Womens-Shoes-Sneakers/_/N-273o?activeCategory=102442',
  '/Womens-Shoes-Athletic/_/N-273p?activeCategory=102442',
  '/Womens-Shoes-Work-and-Safety/_/N-273t?activeCategory=102442',
  '/Womens-Shoes-Slippers/_/N-273u?activeCategory=102442',
  '/Womens-Shoes-Handbags/_/N-lzs1?activeCategory=102442',
  '/Womens-Shoes-Accessories/_/N-lzs2?activeCategory=102442',
  '/Womens-Shoes-Womens-Clearance/_/N-272m?activeCategory=102442'];

    urls.map(getItemURLs);
}

function getItemURLs(catalogUrl, done) {

    if (!catalogUrl) {
        return
    }

    console.log(catalogUrl)

    kipScrapeTools.slowLoad('http://www.dsw.com' + catalogUrl, function ($) {
        $('.productContainer .productImage>a').map(function () {
            return $(this).attr('href');
        }).toArray().filter(function (u) {
            return u.indexOf('javascript') !== 0;
        }).map(function (u) {
            return {url: 'http://www.dsw.com' + u};
        }).map(scrapeShoe)
    })
}
