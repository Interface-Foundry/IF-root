var co = require('co')
var assert = require('assert')
var amazonScraper = require('../server/cart/scraper_amazon')

describe('url scrapers', () => {
  it('should throw an error for a url that is not www.amazon.com', () => co(function * () {
    var err
    try {
      var item = yield amazonScraper.scrapeUrl('https://en.wikipedia.org/wiki/Extract,_transform,_load')
    } catch (e) {
      err = e
    }
    assert(err)
  }))

  it('should scrape an item from www.amazon.com', () => co(function * () {
    var item = yield amazonScraper.scrapeUrl('https://www.amazon.com/Onitsuka-Tiger-Mexico-Classic-Running/dp/B00L8IXMN0/ref=sr_1_11?s=apparel&ie=UTF8&qid=1490047374&sr=1-11&nodeID=679312011&psd=1&keywords=asics%2Bshoes&th=1&psc=1')
    assert(item, 'item was not returned from scraper')
    assert.equal(item.name, 'Onitsuka Tiger Mexico 66 Slip-On Classic Running Shoe, Navy/Off White, 11 M US')
    assert.equal(item.thumbnail_url, 'https://images-na.ssl-images-amazon.com/images/I/419MM4Fg1bL._SL110_.jpg')
  }))

  it('should scrape an item from an ASIN', () => co(function * () {
    var item = yield amazonScraper.scrapeAsin('B00L8IXMN0')
    assert(item, 'item was not returned from scraper')
    assert.equal(item.name, 'Onitsuka Tiger Mexico 66 Slip-On Classic Running Shoe, Navy/Off White, 11 M US')
    assert.equal(item.thumbnail_url, 'https://images-na.ssl-images-amazon.com/images/I/419MM4Fg1bL._SL110_.jpg')
  }))

})
