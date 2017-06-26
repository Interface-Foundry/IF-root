const Store = require('./Store')
const _ = require('lodash')
const amazonConstants = require('./amazon_constants')
const {OperationHelper} = require('apac')
const googl = require('goo.gl')
const LRU = require('lru-cache')

// get the waterline mint database
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

      // and like save a record in the db every time we scrape an item
      db.RawConnection.collection('amazon_catalog_lookups').insertOne(escapeKeys(amazonItem))
    }

    return amazonItem
  }

  /**
  * Text Search
  * @param  {Object} options {text: "search string", page: 1}
  * @return {[type]}         Promise for Array
  */
  async textSearch(options) {
    console.log('search options', options)
    const amazonParams = {
      Availability: 'Available',
      Keywords: options.text,
      Condition: 'New',
      SearchIndex: options.category || 'All', //the valid categories vary by locale
      ResponseGroup: 'ItemAttributes,Images,OfferFull,BrowseNodes,SalesRank,Variations,Reviews',
      ItemPage: options.page + 1
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
      console.error("Searching " + options.text + ' yielded no results');

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
      // save some metrics and raw data for later analysis
      db.RawConnection.collection('amazon_text_searches').insertOne(escapeKeys({
        options: options,
        results: items
      }))
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
          store: 'Amazon',
          name: i.ItemAttributes.Title,
          asin: i.ASIN,
          parent_asin: i.ParentASIN,
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

    // asynchronously load item options so theyre available
    this.getOptions(item)

    // um let's just get the item fresh to make sure it's okay
    item = await db.Items
      .findOne({id: item.id})

    return item
  }

  async getOptions(item) {
    if (!item.parent_asin || item.parent_asin === item.asin) {
      return item;
    }

    // create new item options
    // this part is really really hard
    var parent = await this.catalogLookup({
      asin: item.parent_asin
    })

    var options = _.get(parent, 'Variations.Item', [])

    if (!(options instanceof Array)) {
     options = [options]
    }
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

    // um let's just get the item fresh to make sure it's okay
    item = await db.Items
      .findOne({id: item.id})
      .populate('options')
  }


  /**
   * sync cart to amazon api, gets subtotal and checkout link for cart with items
   *
   * @param      {object}   cart    the cart we are syncing
   * @return     {Promise}  { description_of_the_return_value }
   */
  async sync(cart) {
    // if there are no amazon items in the cart then you can't sync it
    if (cart.items.length === 0 || !cart.items[0].asin) {
      throw new Error('can only sync carts that have amazon items, and items must be populated')
    }

    // to sync with amazon, we create a totally new cart
    const cartAddAmazonParams = createAmazonCartWithItems(cart.items);
    cartAddAmazonParams.AssociateTag = this.credentials.assocId
    const results = await this.opHelper.execute('CartCreate', cartAddAmazonParams);

    const amazonErrors = getErrorsFromAmazonCartCreate(results.result.CartCreateResponse.Cart)
    const amazonCart = results.result.CartCreateResponse.Cart
    return amazonCart
  }

  /**
   * updateCart document in database with new cart properties specific to store
   *
   * @param      {<type>}   oldCartId  The old cartesian identifier
   * @param      {<type>}   newCart    The new cartesian
   * @return     {Promise}  { description_of_the_return_value }
   */
  async updateCart(oldCartId, newCart) {
    const cart = await db.Carts.findOne({id: oldCartId})
    cart.subtotal = newCart.SubTotal.Amount / 100.00
    cart.amazon_cartid = newCart.CartId
    cart.amazon_hmac = newCart.HMAC
    cart.amazon_purchase_url = newCart.PurchaseURL
    cart.affiliate_checkout_url = await googl.shorten(`http://motorwaytoroswell.space/product/${encodeURIComponent(newCart.PurchaseURL)}/id/mint/pid/shoppingcart`)
    cart.dirty = false
    await cart.save()
  }

  async checkout (cart, req, res) {
    if (!cart.dirty) {
      // yay cart is locked so we're pretty sure it hasn't meen messed with
      return res.redirect(cart.affiliate_checkout_url)
    } else {
      // make sure the amazon cart is in sync with the cart in our database
      var amazonCart = await this.sync(cart)
      // redirect to the cart url
      return res.redirect(cart.affiliate_checkout_url)
    }
  }
}


/**
 * parse errors if any from creating an amazon cart
 *
 * @param {object} res the res from amazon after creating a cart
 * @return {array} The errors from amazon into an array if the cart is still fine
 *                 albeit changed objects/quantities, into an explicit object explaining
 *                 what happened if not (TODO)
 */
function getErrorsFromAmazonCartCreate (res) {
  if (!res.Request.Errors) {
    console.log('no errors from creating cart, phew')
    return null
  }

  if (res.Request.Errors.Error) {
    var errorsArray = res.Request.Errors.Error
    if (!(errorsArray instanceof Array)) {
      errorsArray = [errorsArray]
    }
  }

  return errorsArray.map(obj => {
    console.log('dealing with error:', obj)
    if (obj === 'AWS.ECommerceService.InvalidQuantity') {
      try {
        var itemID = obj.Message.match(/\b\w{10}\b/)
        return {
          'error': 'InvalidQuantity (either reduced or removed)',
          'item': (itemID) ? itemID[0] : 'couldnt get what amazon item it was'
        }
      } catch (err) {
        throw new Error('error getting item', res.Error.Message)
      }
    }
  })
}


/**
 * condense items from multiple users/same user with same asin to conform amazon
 * format.
 *
 * @param      {array}  items   array of items from cart
 * @return     {array}  same as above but if asin was already there just reduced into same object
 */
function condenseItems(items) {
  var seenAsins = []
  return items.reduce((prev, curr) => {
    if (seenAsins.includes(curr.asin)) {
      prev.find(x => x.asin === curr.asin).quantity += curr.quantity
    } else {
      seenAsins.push(curr.asin)
      prev.push({
        asin: curr.asin,
        quantity: curr.quantity
      })
    }
  return prev
  }, [])
}


/**
 * create an amazon cart instead of worrying about updating cart and removing etc
 *
 * @param {array} items - array of items that would include:
 *                        ASIN - asin from amazon (TODO: allow for OfferListingId)
 *                        Quantity - quantity
 */
function createAmazonCartWithItems (items) {
  const useAsin = true
  if (!items instanceof Array) {
    items = [items]
  }

  // ability to use offerlistingid or asin later, just using asin rn

  var amazonParams = {}

  var condendesedItems = condenseItems(items)
  var k = 1
  for (i of condendesedItems) {
    amazonParams[`Item.${k}.ASIN`] = i.asin
    amazonParams[`Item.${k}.Quantity`] = i.quantity
    k++
  }
  return amazonParams
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
 * strip tags from a review
 *
 * @param      {<type>}  review  The review
 */
function stripTags(review) {
  const tagRegex = /(<([^>]+)>)/ig
  return review.replace(tagRegex, '')
}

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

    if (editorialReview && editorialReview.Content) {
      return stripTags(editorialReview.Content)
    }
  }
  return item.ItemAttributes.Feature
}

/**
 * Function that removes leading dollar signs from property names, replaces with '_'
 * @param  {[type]} obj [description]
 * @return {[type]}        [description]
 */
function escapeKeys(obj) {
  if (typeof obj === 'string') {
    return obj;
  }

  Object.keys(obj).forEach(function (key) {
    if (key.match(/[\$\.]/)) {
      const newKey = key.replace(/[\$\.]/g, '_')
      obj[newKey] = escapeKeys(obj[key]);
      delete obj[key];
    } else {
      obj[key] = escapeKeys(obj[key]);
    }
  });
  return obj;
}

module.exports = AmazonStore
