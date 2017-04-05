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
module.exports = function amazon_scraper (uri) {
  return co(function * () {
    yield dbReady // always make sure the db is ready before attempting to use it

    // Make double sure that we are parsing an amazon.com url
    if (!uri || uri.host !== 'www.amazon.com') {
      throw new Error('Can only handle uris from "www.amazon.com" but got"' + uri.host + '"')
    }

    // Scrape the item
    var res = yield amazon_cart.getAmazonItem(uri.href)

    // make sure the response is okay
    if (_.get(res, 'Request.IsValid') !== 'True' || !res.Item) {
      throw new Error('Invalid response for url search ' + uri.href)
    }

    // Shorthand for the amazon Item object
    const i = res.Item

    // Custom scraping TODO
    const price = parseInt(_.get(i, 'OfferSummary.LowestNewPrice.Amount')) / 100
    console.log('price', price, typeof price)
    const rating = 0
    const nRatings = 0

    // Grab the images
    const thumbnailMinSize = 50
    const imageKeys = ['SwatchImage', 'SmallImage', 'ThumbnailImage', 'TinyImage', 'MediumImage', 'LargeImage', 'HiResImage']
    const thumbnail = imageKeys.reduce((chosenImage, thisImage) => {
      // If we have already found an image that is good enough, return it
      if (chosenImage) return chosenImage

      // See if this item has this image type
      var img = _.get(i, 'ImageSets.ImageSet[0].' + thisImage)
      if (!img) {
        return
      }

      // See if this image type is big enough for us
      if (parseInt(img.Height._) >= thumbnailMinSize) {
        return img.URL
      }
    })

    const mainImage = imageKeys.reverse().reduce((chosenImage, thisImage) => {
      // If we have already found an image that is good enough, return it
      if (chosenImage) return chosenImage

      // See if this item has this image type
      var img = _.get(i, 'ImageSets.ImageSet[0].' + thisImage)
      if (img) {
        return img.URL
      }
    })

    // if no image was good enough to be a thumbnail, use the main image as the thumbnail
    if (!thumbnail) {
      thumbnail = mainImage
    }

    var item = yield db.Items.create({
      original_link: uri.href,
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
