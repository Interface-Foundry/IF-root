var url = require('url')
var co = require('co')

/**
 * All the scrapers for the stores that Kip supports
 * @type {Object}
 */
const scrapers = {
  amazon: require('./scraper_amazon')
}

/**
 * Scrapes an item from a url for any of our supported retailers
 * @param  {string} uri ex https://www.amazon.com/Onitsuka-Tiger-Mexico-Classic-Running/dp/B00L8IXLWW/ref=sr_1_11?s=apparel&ie=UTF8&qid=1490047374&sr=1-11&nodeID=679312011&psd=1&keywords=asics+shoes
 * @return {Promise<Item>}     resolves with an item or rejects with a reason
 */
module.exports = function scrape (uri) {
  return co(function * () {
    // Determine what store this is for
    var store
    uri = url.parse(uri, true)

    switch (uri.host) {
      case 'www.amazon.com':
        store = 'amazon'
        break
    }

    // If we can't handle it, then throw an error
    if (!scrapers[store]) {
      throw new Error('Cannot handle items from site ' + uri.host)
    }

    // Scrape the item
    var item = yield scrapers[store](uri)
    return item
  })
}
