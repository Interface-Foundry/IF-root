var co = require('co')
var db
const dbReady = require('../../db')
dbReady.then((models) => { db = models })

/**
 * Scrapes an item from amazon
 * @param  {URL} uri a node.js URL object, see https://nodejs.org/docs/latest/api/url.html
 * @return {Promise<Item>} returns an item with the populated options
 */
module.exports = function amazon_scraper (uri) {
  return co(function * () {
    yield dbReady // always make sure the db is ready before attempting to use it

    // Make double sure that we are parsing an amazon.com url
    if (!uri || uri.host !== 'www.amazon.com') {
      throw new Error('Can only handle uris from "www.amazon.com" but got"' + uri.host + '"')
    }

    var item = yield db.Items.create({
      original_link: uri.href
    })

    return item
  })
}
