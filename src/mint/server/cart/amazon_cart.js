const _ = require('lodash');
const googl = require('goo.gl');
const {OperationHelper} = require('apac');

const LRU = require('lru-cache')
const asinCache = LRU({
  max: 500, // the number of ASIN's to store
  maxAge: 1000 * 60 * 60 * 24, // refresh items every day
  length: function () { return 1 } // every document just has length 1
})

var amazonScraper = require('./scraper_amazon');
var amazonConstants = require('./amazon_constants');
var emoji = require('../utilities/emoji_utils');

var db
const dbReady = require('../../db')
dbReady.then((models) => { db = models })

/**
 * List of aws product api operation helpers from the APAC npm library
 * @type {Object}
 */
const opHelpers = {}
Object.keys(amazonConstants.credentials).map(locale => {
  // We'll just use the first one in the list for now TODO switch between the two api keys
  opHelpers[locale] = new OperationHelper(amazonConstants.credentials[locale][0])
})

/**
 * Default ophelper which is used to look up ASINS etc
 * @type {[type]}
 */
const opHelper = opHelpers.US

/**
 * Gets associate tag for a locale
 * @type {[type]}
 */
function localeTag(locale) {
  return amazonConstants.credentials[locale][0].assocId
}

/**
 * Checks the response from an amazon request for an error, and throws a nicer
 * error if there was a request error
 */
const checkError = function (res) {
  if (_.get(res, 'Request.Errors.Error')) {
    var e = _.get(res, 'Request.Errors.Error.0') || _.get(res, 'Request.Errors.Error')
    throw new Error('Amazon Error [' + e.Code + ']: ' + e.Message)
  }
}

exports.itemPreview = function * (query, locale, page, category) {
  var item
  if (query.includes('amazon.com')) {
    // probably a url
    item = yield amazonScraper.scrapeUrl(query, locale)
  } else if (query.match(/^B[\dA-Z]{9}|\d{9}(X|\d)$/)) {
    // probably an asin
    item = yield amazonScraper.scrapeAsin(query, locale)
  } else {
    // search query
    // throw new Error('only urls and asins supported right now sorry check back soon 감사합니다')
    item = yield exports.searchAmazon(query, locale, page, category);
  }
  return item
}

/**
 * the idea of this is that you can add functionality later
 * @param  {string} item_identifier is url/asin/etc that is given
 * @return {string} asin to lookup
 */
exports.getAsin = function (item_identifier) {
  if (!item_identifier.includes('amazon.com')) {
    throw new Error('Only taking items with amazon.com')
  }

  var itemRegex = /\/\b\w{10}\b/

  var asin = item_identifier.match(itemRegex)[0].replace('/', '')
  return asin;
};

/**
 * for a cart, given amazon functionality you need to use modify for cart
 * @param  {[type]} item [description]
 * @param  {[type]} cart [description]
 * @return {[type]}      [description]
 */
function checkAmazonItemInCart (item, cart) {
  // item can be array or single object
  if (!(cart.CartItems.CartItem instanceof Array)) {
    // coerce object into array so we dont have complicated logic
    var cartItems = [cart.CartItems.CartItem];
  } else {
    cartItems = cart.CartItems.CartItem;
  }
  var cartItem = cartItems.find(i => i.ASIN === item.asin);
  if (cartItem) {
    return cartItem;
  }
  return false;
}

/**
 * from whatever item type is given, get corresponding item from amazon
 * @param {string} original_url entered into box or whatever
 * @y just return item title for now
 */
exports.getAmazonItem = function * (item_identifier, locale) {
  var asin = exports.getAsin(item_identifier);
  var res = yield exports.lookupAmazonItem(asin, locale);
  return res;
};

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// FUNCTIONS BELOW USE APAC TO INTERACT WITH AMAZON PRODUCT API
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

/**
 * search item by keyword(s)
 * http://docs.aws.amazon.com/AWSECommerceService/latest/DG/ItemSearch.html
 * @param {string} query search terms
 * @param {string} locale amazone website locale, can leave blank, defaults to US
 * @param {number} page serach result page, starts at 1
 * @param {string} category search index to use, I guess like "Gourmet Grocery" or whatever. can leave blank
 * @returns {[db.Items]} amazon items
 */
exports.searchAmazon = function * (query, locale, page, category) {
  query = emoji(query);

  var amazonParams = {
    Availability: 'Available',
    Keywords: query,
    Condition: 'New',
    SearchIndex: category || 'All', //the values for this vary by locale
    ResponseGroup: 'ItemAttributes,Images,OfferFull,BrowseNodes,SalesRank,Variations,Reviews',
    ItemPage: page || 1
  };

  logging.info('amazonParams:', amazonParams)

  var results = yield opHelpers[locale].execute('ItemSearch', amazonParams);
  if (!results || !results.result.ItemSearchResponse.Items.Item) {
    if (!results) throw new Error('Error on search for query', query);
    else logging.error("Searching " + query + ' yielded no results');

    // remove the last word, and try the search again
    var newQuery = query.split(/[^\w]/).slice(0, -1).join(' ')
    if (newQuery) {
      var results = yield exports.searchAmazon(newQuery, locale, page, category)
      return results
    } else {
      return [];
    }
  }
  else {
    //save new items to the db
    var items = results.result.ItemSearchResponse.Items.Item
    var validatedItems = [];
    yield items.map(function * (item) { //map of undefined
      var dbItem = yield amazonScraper.res2Item({Request: {IsValid: 'True'}, Item: item})
      // logging.info(dbItem);
      if (dbItem) {
        dbItem.original_link = item.ItemLinks.ItemLink[0].URL
        yield dbItem.save();
      }
      validatedItems.push(dbItem);
    });
    validatedItems = validatedItems.filter(function (x) {
      if (x) return x;
    }); //res2Item will return null if there are validation errors and the item is not added to the db
    return validatedItems;
  }
};


/**
 * lookup item by asin
 * http://docs.aws.amazon.com/AWSECommerceService/latest/DG/ItemLookup.html
 * lookup item by asin
 * @param {string} asin of item
 * @returns {[type]} [description]
 */
exports.lookupAmazonItem = function * (asin, locale) {
  if (!asin) {
    throw new Error('No asin supplied')
  }
  if (!locale) {
    throw new Error('No locale supplied')
  }

  // Check if we have run this lookup recently
  const cachedValue = asinCache.get(asin + locale)
  if (cachedValue) {
    return cachedValue
  }

  var amazonParams = {
    Availability: 'Available',
    IdType: 'ASIN',
    ItemId: asin,
    ResponseGroup: 'ItemAttributes,Images,OfferFull,BrowseNodes,SalesRank,Variations,Reviews'
  };
  try {
    var results = yield opHelpers[locale].execute('ItemLookup', amazonParams)
  } catch (err) {
    console.error(err)
    throw new Error('Error on ASIN lookup');
  }

  // Add some logic to find the available item variations
  var item = results.result.ItemLookupResponse.Items.Item
  if (item.ParentASIN && item.ParentASIN !== item.ASIN) {
    // This item has a parent item, which means it probably has variations
    var parent = yield module.exports.lookupAmazonItem(item.ParentASIN, locale)
    var options = _.get(parent, 'Item.Variations.Item', [])

    // if there's only one variation, it won't be an array, so we'll array-ify it just in case
    if (!(options instanceof Array)) {
      options = [options]
    }
  }

  // Craft a bespoke response for the user
  var response = {
    Request: results.result.ItemLookupResponse.Items.Request,
    Item: item,
    Options: options
  }

  // save value to cache
  asinCache.set(asin + locale, response)

  return response
};

/**
 * should create a cart with some associatetag with either offer listing ID or asin
 * http://docs.aws.amazon.com/AWSECommerceService/latest/DG/CartCreate.html
 * @param {[type]} items         [description]
 * @return {Object} cart object from amazon that has
      - CartId
      - HMAC
      - URLEncodedHMAC
      - PurchaseURL
      - SubTotal
      - CartItems
 */
exports.createAmazonCart = function * (item, locale) {
  if (item instanceof Array) {
    throw new Error('Only create cart for single item at a time');
  }
  if (!locale) {
    throw new Error('No locale supplied')
  }

  if (_.get(item, 'OfferListingId')) {
    throw new Error('Need ASIN, not using OfferListingId for time being');
  }
  var amazonParams = {
    'AssociateTag': localeTag(locale),
    'Item.1.ASIN': item.asin,
    'Item.1.Quantity': (item.quantity === undefined) ? 1 : item.quantity
  };
  try {
    var cart = yield opHelpers[locale].execute('CartCreate', amazonParams);
  } catch (err) {
    console.error(err)
    throw new Error('Error on creating cart')
  }
  checkError(cart.result.CartCreateResponse.Cart)
  return cart.result.CartCreateResponse.Cart;
};


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
      errorsArrays = [errorsArray]
    }
  }

  return errorsArrays.map(obj => {
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
 * http://docs.aws.amazon.com/AWSECommerceService/latest/DG/CartGet.html
 * @param {[type]} cart          [description]
 * @yield {[type]} [description]
 */
exports.getAmazonCart = function * (cart) {
  var amazonParams = {
    'AssociateTag': localeTag(cart.store_locale),
    'CartId': cart.amazon_cartid,
    'HMAC': cart.amazon_hmac,
    'ResponseGroup': 'Cart',
  };

  cart = yield opHelpers[cart.store_locale].execute('CartGet', amazonParams);
  checkError(cart.result.CartGetResponse.Cart)
  return cart.result.CartGetResponse.Cart;
};

/**
 * creates the item in our cart from asin
 * @param {string} item which might be an asin itself or like {url: someurl}
 * @param {string} locale US, UK, CA
 * @yield {object} created item
 */
exports.addItemAmazon = function * (item, locale) {
  if (item.url) {
    item = yield amazonScraper.scrapeUrl(item.url, locale)
  } else {
    item = yield amazonScraper.scrapeAsin(item, locale)
  }
  return item
};

/**
 * remove an item specifically from amazon cart
 * http://docs.aws.amazon.com/AWSECommerceService/latest/DG/CartModify.html
 * @param {objecvt} item object
 * @param {object} cart object
 * @yield {[type]} [description]
 */
exports.removeAmazonItemFromCart = function * (item, cart) {
  var cart = yield exports.changeQuantityAmazonItemFromCart(item, 0, cart)
  return cart;
};

/**
 * http://docs.aws.amazon.com/AWSECommerceService/latest/DG/CartClear.html
 * @param {[type]} cart          [description]
 * @yield {[type]} [description]
 */
exports.clearAmazonCart = function * (cart) {
  var amazonParams = {
    'AssociateTag': localeTag(cart.store_locale),
    'CartId': cart.amazon_cartid,
    'HMAC': cart.amazon_hmac
  };

  cart = yield opHelpers[cart.store_locale].execute('CartClear', amazonParams);
  return cart;
};


/**
 * Syncs amazon cart with the database cart
 * @param {db.Cart} cart cart from the database
 * @return {Generator} returns an amazon cart that's all synced up and ready to checkout
 */
exports.syncAmazon = function * (cart) {
  if (!cart) {
    throw new Error('must supply a db.Cart')
  } else if (!cart.id) {
    throw new Error('parameter "cart" must be an instance of db.Cart (not a cart response from amazon.com)')
  }

  // if there are no amazon items in the cart then you can't sync it
  if (cart.items.length === 0 || !cart.items[0].asin) {
    throw new Error('can only sync carts that have amazon items, and items must be populated')
  }

  var cartAddAmazonParams = createAmazonCartWithItems(cart.items);
  cartAddAmazonParams.AssociateTag = localeTag(cart.store_locale)
  var res = yield opHelpers[cart.store_locale].execute('CartCreate', cartAddAmazonParams);
  var amazonErrors = getErrorsFromAmazonCartCreate(res.result.CartCreateResponse.Cart)
  returnValue = res.result.CartCreateResponse.Cart
  cart.amazon_cartid = returnValue.CartId
  cart.amazon_hmac = returnValue.HMAC
  return returnValue
}


/**
 * cart checkout for amazon
 *
 * @param      {object}  cart    the cart object
 * @return     {response}  the response
 */
exports.checkout = function * (cart, req, res) {
  var cartItems = cart.items;

  if (cart.affiliate_checkout_url && cart.locked) {
    res.redirect(cart.affiliate_checkout_url)
  }

  // make sure the amazon cart is in sync with the cart in our database
  var amazonCart = yield exports.syncAmazon(cart)

  // save the amazon purchase url
  if (cart.amazon_purchase_url !== amazonCart.PurchaseURL) {
    cart.amazon_purchase_url = amazonCart.PurchaseURL
    cart.affiliate_checkout_url = yield googl.shorten(`http://motorwaytoroswell.space/product/${encodeURIComponent(cart.amazon_purchase_url)}/id/mint/pid/shoppingcart`)
    yield cart.save()
  }
  // redirect to the cart url
  res.redirect(cart.affiliate_checkout_url)
  // redirect to the cart url
}
