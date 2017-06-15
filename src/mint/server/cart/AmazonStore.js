const Store = require('./Store')
const _ = require('lodash')
const amazonConstants = require('./amazon_constants')
const {OperationHelper} = require('apac')
const googl = require('goo.gl')
const LRU = require('lru-cache')

var db
const dbReady = require('../../db')
dbReady.then((models) => {
  db = models
})

/**
 * AmazonStore class to build an amazon store for any locale``
 * @type {AmazonStore}
 */
class AmazonStore extends Store {
  constructor(locale) {
    if (!amazonConstants.credentials[locale]) {
      throw new Error('Does not support amazon locale ' + locale)
    }
    super(`Amazon (${locale})`)
    this.locale = locale
    this.domain = amazonConstants.locales[locale].domain
    this.credentials = amazonConstants.credentials[locale][0]
    this.opHelper = new OperationHelper(this.credentials)

    // Cache amazonItems for specific ASIN's to reduce our api usage
    this.asinCache = LRU({
      max: 500, // the number of ASIN's to store
      maxAge: 1000 * 60 * 60 * 24, // refresh items every day
      length: function () {
        return 1
      } // every document just has length 1
    })

    // Cache amazonItems for search queries to reduce our api usage
    this.queryCache = LRU({
      max: 500, // the number of ASIN's to store
      maxAge: 1000 * 60 * 60 * 24, // refresh items every day
      length: function () {
        return 1
      } // every document just has length 1
    })
  }

  /**
   * returns the type of search
   * @param  {Object}  options the search options
   */
  getSearchType(options) {
    if (options.text && options.text.includes(this.domain)) {
      return 'urlSearch'
    } else if (options.text && options.text.match(/^B[\dA-Z]{9}|\d{9}(X|\d)$/)) {
      return 'catalogLookup'
    } else {
      return 'textSearch'
    }
  }

  /**
   * Return an array with one amazonItem that corresponds to the url
   * @param  {Object} options search options, text = url
   * @return {[amazonItem]}         the amazon item response
   */
  async urlSearch(options) {
    const uri = options.text
    if (!uri || !uri.match(new RegExp(this.domain))) {
      throw new Error(`Can only handle uris from "${this.domain}" but got "${uri}"`)
    }

    const asin = uri.match(/B[\dA-Z]{9}|\d{9}(X|\d)/)[0]
    const amazonItem = this.catalogLookup({text: asin})
    return [amazonItem]
  }

  /**
   * Return an array with one item that corresponds to the asin
   * @param  {Object} options search options, text = asin
   * @return {[amazonItem]}         the amazon item response for the asin
   */
  async catalogLookup(options) {
    const asin = options.text || options.asin
    console.log('looking up asin', asin)

    // Make double sure that we are parsing an amazon.com asin
    if (!asin || !asin.match(/^B[\dA-Z]{9}|\d{9}(X|\d)$/)) {
      throw new Error('Can only handle an ASIN but got "' + asin + '"')
    }

    // Check if we have run this lookup recently
    const cachedValue = this.asinCache.get(asin)
    if (cachedValue) {
      var amazonItem = cachedValue
    } else {
      // otherwise go to the web to get the amaoznItem
      var results = await this.opHelper.execute('ItemLookup', {
          Availability: 'Available',
          IdType: 'ASIN',
          ItemId: asin,
          ResponseGroup: 'ItemAttributes,Images,OfferFull,BrowseNodes,SalesRank,Variations,Reviews'
        })
      var amazonItem = _.get(results, 'result.ItemLookupResponse.Items.Item')
      if (!amazonItem) {
        throw new Error('No item found for ASIN ' + asin)
      }

      // cache it for later
      this.asinCache.set(asin, amazonItem)
    }

    return amazonItem
  }

  /**
  * Text Search
  * @param  {Object} options {text: "search string", page: 1}
  * @return {[type]}         Promise for Array
  */
  async textSearch(options) {
    const amazonParams = {
      Availability: 'Available',
      Keywords: options.text,
      Condition: 'New',
      SearchIndex: options.category || 'All', //the valid categories vary by locale
      ResponseGroup: 'ItemAttributes,Images,OfferFull,BrowseNodes,SalesRank,Variations,Reviews',
      ItemPage: options.page || 1
    };
    var results = await this.opHelper.execute('ItemSearch', amazonParams);

    // Make sure the search query went ok
    if (!results) {
      throw new Error('Error, no result body returned for search for query', query);
    }

    // Make sure the search returned items
    var items = _.get(results, 'result.ItemSearchResponse.Items.Item', [])

    if (!items || items.length === 0) {
      // search wasn't buggy, but there were no results, so relax the search query
      console.error("Searching " + query + ' yielded no results');

      // remove the last word, and try the search again
      var newQuery = options.text.split(/[^\w]/).slice(0, -1).join(' ')
      if (newQuery) {
        options.text = newQuery
        var results = await this.textSearch(options)
        return results
      } else {
        return [];
      }
    } else {
      //save new items to the db
      return items
    }
  }

  /**
  * Post-process search items, in this case turning amazonItems into db.Item instances.
  * @param  {[type]}  items [description]
  * @return {Promise}       [description]
  */
  async processSearchItems(amazonItems) {
    var me = this;
    const items = await Promise.all(amazonItems.map(me.res2item.bind(this)))
    return items
  }

  /**
   * Converts a response from the amazon api to an item in our database. Does not add this item to cart.
   * @param  {json}    res response from amazon api, a totally what the fuck pile of jsonified xml data
   * @return {Promise<item>}     returns promise for a db.Item.
   */
  async res2item(res) {
    await dbReady

    // Shorthand for the amazon Item object
    const i = res

    // Custom scraping TODO
    const price = getItemPrice(i)
    const rating = 0
    const nRatings = 0

    // Grab the images
    const imageSet = _.get(i, 'ImageSets.ImageSet[0]') || _.get(i, 'ImageSets.ImageSet') || {}
    const thumbnailMinSize = 50
    const imageKeys = [
      'SwatchImage',
      'SmallImage',
      'ThumbnailImage',
      'TinyImage',
      'MediumImage',
      'LargeImage',
      'HiResImage'
    ]
    var thumbnail = imageKeys.reduce((chosenImage, thisImage) => {

      // Do we have a small image available?
      if (i.SmallImage && i.SmallImage.URL)
        return i.SmallImage.URL

        // If we have already found an image that is good enough, return it
      if (chosenImage)
        return chosenImage

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

    const mainImage = imageKeys
      .reverse()
      .reduce((chosenImage, thisImage) => {

        // Do we have a large normal image available?
        if (i.LargeImage && i.LargeImage.URL)
          return i.LargeImage.URL

          // Do we have a medium image available?
        if (i.MediumImage && i.MediumImage.URL)
          return i.MediumImage.URL

          // If we have already found an image that is good enough, return it
        if (chosenImage)
          return chosenImage

          // See if this item has this image type
        var img = imageSet[thisImage]
        if (img) {
          return img.URL
        }
      }, null)

    // if no image was good enough to be a thumbnail, use the main image as the thumbnail
    if (!thumbnail) {

      // Do we have a medium image available?
      if (i.MediumImage && i.MediumImage.URL)
        return i.MediumImage.URL

      thumbnail = mainImage
    }

    // make sure db is ready
    await dbReady

    // create a new item
    try {
      var item = await db.Items.create({
          store: 'amazon',
          name: i.ItemAttributes.Title,
          asin: i.ASIN,
          description: getDescription(i),
          price: price,
          original_link: i.ItemLinks.ItemLink[0].URL,
          thumbnail_url: thumbnail,
          main_image_url: mainImage,
          iframe_review_url: (i.CustomerReviews.HasReviews === 'true')
            ? i.CustomerReviews.IFrameURL
            : null
        })
    } catch (err) {
      console.error(err)
      return null;
    }

    // check to see if we get back the prime property
    const prime = !!_.get(i, 'Offers.Offer.OfferListing.IsEligibleForPrime', false)
    // create a new delivery details thing w/ the right value
    var details = await db.DeliveryDetails.create({prime: prime})
    // associate it and 'item'
    details.item = item.id
    await details.save();
    item.details = details.id;
    await item.save();

    // create new item options
    // this part is really really hard
    if (res.ParentASIN && res.ParentASIN !== res.ASIN) {
      var parent = await this.catalogLookup({
        asin: res.ParentASIN
      })

      var options = _.get(parent, 'Variations.Item', [])

      // Make the current item's selected options easy to use
      var selectedItem = options.filter(o => o.ASIN === item.asin)[0]
      var selectedOptions = {}
      var variationAttributes = selectedItem.VariationAttributes.VariationAttribute instanceof Array
        ? selectedItem.VariationAttributes.VariationAttribute
        : [selectedItem.VariationAttributes.VariationAttribute]
      variationAttributes.map(attr => {
        selectedOptions[attr.Name] = attr.Value
      })

      // make a list of all the options for all the option types
      var allOptions = {} // hash where keys are dimension names, and values are options we've created already
      options = options.map(o => {
          var variationAttributes = o.VariationAttributes.VariationAttribute instanceof Array
            ? o.VariationAttributes.VariationAttribute
            : [o.VariationAttributes.VariationAttribute]
          return variationAttributes.map(attr => {
            // make sure we can handle this option type
            if (!allOptions[attr.Name]) {
              allOptions[attr.Name] = []
            }

            // check if we've already created this option
            if (allOptions[attr.Name].includes(attr.Value)) {
              return
            } else {
              allOptions[attr.Name].push(attr.Value)
            }

            // create an option in the db
            return db
              .ItemOptions
              .create({
                type: attr.Name,
                name: attr.Value,
                description: o.ItemAttributes.Title,
                url: '',
                asin: o.ASIN,
                parent_asin: o.ParentASIN,
                price_difference: null, // not defined for amazon
                thumbnail_url: _.get(o, 'SmallImage.URL'),
                main_image_url: _.get(o, 'LargeImage.URL'),
                available: true,
                selected: attr.Value === selectedOptions[attr.Name]
              })
          })
        })

      options = await Promise.all(_.flatten(options).filter(Boolean))
      options.map(o => {
        item.options.add(o.id)
      })
      await item.save()
    }

    // um let's just get the item fresh to make sure it's okay
    item = await db.Items
      .findOne({id: item.id})
      .populate('options')

    return item
  }
}

/**
 * format cents to nice price.  amazon returns amount in cents
 *
 * @param      {number}  amount  The amount
 * @return     {number}  amount formated to tenths or whatever usd is
 */
function formatAmazonPrice(amount) {
  return parseInt(amount) / 100
}

function getItemPrice(item, priceType) {
  // place holder for time being since unsure what price to use
  const availablePrices = {}
  availablePrices.basicItemPrice = formatAmazonPrice(_.get(item, 'Offers.Offer.OfferListing.Price.Amount', 0))
  if (priceType === undefined) {
    return availablePrices.basicItemPrice
  } else {
    // might be useful to return other possible prices in the future
    availablePrices.lowestPrice = formatAmazonPrice(_.get(item, 'OfferSummary.LowestNewPrice.Amount', 0))
    availablePrices.listPrice = formatAmazonPrice(_.get(item, 'ItemAttributes.ListPrice.Amount', 0))
    return availablePrices[priceType]
  }
}

const bookProductGroups = ['Book', 'eBooks']

/**
 * gets the description for an item depending on if its a book or what
 *
 * @param      {<type>}  item The item
 */
function getDescription (item) {
  if (bookProductGroups.includes(item.ItemAttributes.ProductGroup)) {
    var editorialReview = _.get(item, 'EditorialReviews.EditorialReview')
    if (editorialReview instanceof Array) {
      editorialReview = editorialReview[0]
    }

    if (editorialReview && editorialReview.Content) return editorialReview.Content
  }
  return item.ItemAttributes.Feature
}

module.exports = AmazonStore
