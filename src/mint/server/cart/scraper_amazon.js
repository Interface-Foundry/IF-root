const co = require('co')
const _  = require('lodash')
var db
const dbReady = require('../../db')
dbReady.then((models) => { db = models })
const amazon_cart = require('./amazon_cart')

/**
 * Scrapes an item from amazon
 * @param  {URL} uri a node.js URL object, see https://nodejs.org/docs/latest/api/url.html
 * @return {Promise<Item>} returns an item with the populated options
 */
module.exports.scrapeUrl = function amazon_scraper (uri) {
  return co(function * () {
    // Make double sure that we are parsing an amazon.com url
    if (!uri || !uri.match(/www.amazon.com/)) {
      throw new Error('Can only handle uris from "www.amazon.com" but got "' + uri + '"')
    }

    // Scrape the item
    var res = yield amazon_cart.getAmazonItem(uri)
    var item = yield res2Item(res)
    item.original_link = uri
    yield item.save()
    return item
  })
}

/**
 * Scrapes an item from an amazon.com ASIN
 * @param  {string} asin amazon.com asin, should match /^B[\dA-Z]{9}|\d{9}(X|\d)$/
 * @return {Promise<item>}      returns an item with the populated options
 */
module.exports.scrapeAsin = function asin_scraper (asin) {
  return co(function * () {
    // Make double sure that we are parsing an amazon.com asin
    if (!asin || !asin.match(/^B[\dA-Z]{9}|\d{9}(X|\d)$/)) {
      throw new Error('Can only handle asins from amazon.com but got "' + asin + '"')
    }

    // Scrape the item
    var res = yield amazon_cart.lookupAmazonItem(asin)
    var item = yield res2Item(res)
    return item
  })
}

/**
 * Converts a response from the amazon api to an item in our database. Does not add this item to cart.
 * @param  {json}    res response from amazon api, a totally what the fuck pile of jsonified xml data
 * @return {Promise<item>}     returns promise for a db.Item.
 */
function res2Item(res) {
  return co(function * () {
    // make sure the response is okay
    if (_.get(res, 'Request.IsValid') !== 'True' || !res.Item) {
      throw new Error('Invalid response for url search ' + uri.href)
    }

    // Shorthand for the amazon Item object
    const i = res.Item

    // Custom scraping TODO
    const price = parseInt(_.get(i, 'OfferSummary.LowestNewPrice.Amount')) / 100
    const rating = 0
    const nRatings = 0

    // Grab the images
    const imageSet = _.get(i, 'ImageSets.ImageSet[0]') || _.get(i, 'ImageSets.ImageSet') || {}
    const thumbnailMinSize = 50
    const imageKeys = ['SwatchImage', 'SmallImage', 'ThumbnailImage', 'TinyImage', 'MediumImage', 'LargeImage', 'HiResImage']
    var thumbnail = imageKeys.reduce((chosenImage, thisImage) => {
      // If we have already found an image that is good enough, return it
      if (chosenImage) return chosenImage

      // See if this item has this image type
      var img = imageSet[thisImage]
      if (!img) {
        return
      }

      // See if this image type is big enough for us
      if (parseInt(img.Height._) >= thumbnailMinSize && parseInt(img.Width._) >= thumbnailMinSize) {
        return img.URL
      }
    }, null)

    const mainImage = imageKeys.reverse().reduce((chosenImage, thisImage) => {
      // If we have already found an image that is good enough, return it
      if (chosenImage) return chosenImage

      // See if this item has this image type
      var img = imageSet[thisImage]
      if (img) {
        return img.URL
      }
    }, null)

    // if no image was good enough to be a thumbnail, use the main image as the thumbnail
    if (!thumbnail) {
      thumbnail = mainImage
    }

    // make sure db is ready
    yield dbReady

    // create a new item
    var item = yield db.Items.create({
      store: 'amazon',
      name: i.ItemAttributes.Title,
      description: i.ItemAttributes.Feature,
      price: price,
      thumbnail_url: thumbnail,
      main_image_url: mainImage
    })

    return item

  })
}
