const _ = require('lodash');
const {OperationHelper} = require('apac');

const LRU = require('lru-cache')
const asinCache = LRU({
  max: 500, // the number of ASIN's to store
  maxAge: 1000 * 60 * 60 * 24, // refresh items every day
  length: function () { return 1 } // every document just has length 1
})

var scraper = require('./scraper_amazon');
var emoji = require('../utilities/emoji_utils');

// amazon creds -> move to constants later
const amazonCreds = [{
  'awsId': 'AKIAIQWK3QCI5BOJTT5Q',
  'awsSecret': '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',
  'assocId': 'motorwaytoros-20',
  'maxRequestsPerSecond': 1
}, {
  'awsId': 'AKIAJLM6YRRSPF4UQHOA',
  'awsSecret': '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',
  'assocId': 'motorwaytoros-20',
  'maxRequestsPerSecond': 1
}];

const associateTag = 'motorwaytoros-20';

const opHelper = new OperationHelper(amazonCreds[0]);

const checkError = function (res) {
  if (_.get(res, 'Request.Errors.Error')) {
    var e = _.get(res, 'Request.Errors.Error.0') || _.get(res, 'Request.Errors.Error')
    throw new Error('Amazon Error [' + e.Code + ']: ' + e.Message)
  }
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
exports.getAmazonItem = function * (item_identifier) {
  var asin = exports.getAsin(item_identifier);
  var res = yield exports.lookupAmazonItem(asin);
  return res;
};

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// FUNCTIONS BELOW USE APAC TO INTERACT WITH AMAZON PRODUCT API
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

/**
 * search item by keyword(s)
 * http://docs.aws.amazon.com/AWSECommerceService/latest/DG/ItemSearch.html
 * lookup item by asin
 * @param {string} query search terms
 * @returns {[type]} amazon items
 */
exports.searchAmazon = function * (query, index) {
  query = emoji(query);
  console.log('searching:', query)
  var amazonParams = {
    Availability: 'Available',
    Keywords: query,
    Condition: 'New',
    SearchIndex: 'All', //the values for this vary by locale
    ResponseGroup: 'ItemAttributes,Images,OfferFull,BrowseNodes,SalesRank,Variations,Reviews',
    ItemPage: index || 1
  };
  var results = yield opHelper.execute('ItemSearch', amazonParams);
  if (!results || !results.result.ItemSearchResponse.Items.Item) {
    if (!results) throw new Error('Error on search for query', query);
    else logging.error("Searching " + query + ' yielded no results');

    // remove the last word, and try the search again
    var newQuery = query.split(/[^\w]/).slice(0, -1).join(' ')
    if (newQuery) {
      var results = yield exports.searchAmazon(newQuery)
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
      var dbItem = yield scraper.res2Item({Request: {IsValid: 'True'}, Item: item})
      // logging.info(dbItem);
      if (dbItem) {
        dbItem.original_link = item.ItemLinks.ItemLink[0].URL
        yield dbItem.save();
      }
      validatedItems.push(dbItem);
      console.log('added item to db');
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
exports.lookupAmazonItem = function * (asin) {
  if (!asin) {
    throw new Error('No asin supplied')
  }

  // Check if we have run this lookup recently
  const cachedValue = asinCache.get(asin)
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
    var results = yield opHelper.execute('ItemLookup', amazonParams)
  } catch (err) {
    console.error(err)
    throw new Error('Error on ASIN lookup');
  }

  // Add some logic to find the available item variations
  var item = results.result.ItemLookupResponse.Items.Item
  if (item.ParentASIN && item.ParentASIN !== item.ASIN) {
    // This item has a parent item, which means it probably has variations
    var parent = yield module.exports.lookupAmazonItem(item.ParentASIN)
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
  asinCache.set(asin, response)

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
exports.createAmazonCart = function * (item) {
  if (item instanceof Array) {
    throw new Error('Only create cart for single item at a time');
  }

  if (_.get(item, 'OfferListingId')) {
    throw new Error('Need ASIN, not using OfferListingId for time being');
  }
  var amazonParams = {
    'AssociateTag': associateTag,
    'Item.1.ASIN': item.asin,
    'Item.1.Quantity': (item.quantity === undefined) ? 1 : item.quantity
  };
  try {
    var cart = yield opHelper.execute('CartCreate', amazonParams);
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

  var amazonParams = {
    'AssociateTag': associateTag,
  }

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
    'AssociateTag': associateTag,
    'CartId': cart.amazon_cartid,
    'HMAC': cart.amazon_hmac,
    'ResponseGroup': 'Cart',
  };

  cart = yield opHelper.execute('CartGet', amazonParams);
  checkError(cart.result.CartGetResponse.Cart)
  return cart.result.CartGetResponse.Cart;
};

/**
 * http://docs.aws.amazon.com/AWSECommerceService/latest/DG/CartAdd.html
 * this is a really slow function, like 2000 ms :C
 * @param {[type]} item          [description]
 * @param {[type]} cart_id       [description]
 * @yield {[type]} [description]
 */
exports.addAmazonItemToCart = function * (item, cart) {
  if (item instanceof Array) {
    throw new Error('Only add one Item to a cart at a time');
  }

  // check if we need to create anew cart
  if (!cart.amazon_hmac || !cart.amazon_cartid) {
    let amazonCart = exports.createAmazonCart(item)
    cart.amazon_cartid = amazonCart.CartId
    cart.amazon_hmac = amazonCart.HMAC
    yield cart.save()
  }

  var quantity = item.quantity

  // if the item is already in the cart, then we want to increase the quantity
  var amazonCart = yield exports.getAmazonCart(cart)
  var itemAlreadyAdded = checkAmazonItemInCart(item, amazonCart)
  if (itemAlreadyAdded) {
    quantity += parseInt(itemAlreadyAdded.Quantity)
    var amazonParams = {
      'AssociateTag': associateTag,
      'CartId': cart.amazon_cartid,
      'HMAC': cart.amazon_hmac,
      'Item.1.CartItemId': itemAlreadyAdded.CartItemId,
      'Item.1.Quantity': quantity
    };
    var cartModify = yield opHelper.execute('CartModify', amazonParams);
    checkError(cartModify.result.CartModifyResponse.Cart)
    return cartModify.result.CartModifyResponse.Cart;
  } else {
    var amazonParams = {
      'AssociateTag': associateTag,
      'CartId': cart.amazon_cartid,
      'HMAC': cart.amazon_hmac,
      'Item.1.ASIN': item.asin,
      'Item.1.Quantity': quantity
    };
    var cartAdd = yield opHelper.execute('CartAdd', amazonParams);
    checkError(cartAdd.result.CartAddResponse.Cart)
    return cartAdd.result.CartAddResponse.Cart;
  }
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
 * @param {[type]} item          [description]
 * @yield {[type]} [description]
 */
exports.clearAmazonCart = function * (cart) {
  var amazonParams = {
    'AssociateTag': associateTag,
    'CartId': cart.amazon_cartid,
    'HMAC': cart.amazon_hmac
  };

  cart = yield opHelper.execute('CartClear', amazonParams);
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
  var res = yield opHelper.execute('CartCreate', cartAddAmazonParams);
  var amazonErrors = getErrorsFromAmazonCartCreate(res.result.CartCreateResponse.Cart)
  returnValue = res.result.CartCreateResponse.Cart
  cart.amazon_cartid = returnValue.CartId
  cart.amazon_hmac = returnValue.HMAC
  return returnValue
}

// commented out but i think this is all unnecessary now?  idk
//   // amazon cart already existed for this cart, so proceed to sync items
//   var amazonCart = yield exports.getAmazonCart(cart)

//   // Generate two requests and run them through amazon:
//   //  - a CartAdd request for the the items missing
//   //  - a CartModify request to edit the qunatities of existing items (or remove them)
//   var amazonItems = amazonCart.CartItems.CartItem instanceof Array ? amazonCart.CartItems.CartItem : [amazonCart.CartItems.CartItem]

//   var cartAddAmazonParams = {
//     'AssociateTag': associateTag,
//     'CartId': cart.amazon_cartid,
//     'HMAC': cart.amazon_hmac
//   };
//   var missingItems = cart.items.filter(i => {
//     return amazonItems.filter(ai => ai.ASIN === i.asin).length === 0
//   }).map((item, index) => {
//     var key = 'Item.' + (index + 1) + '.'
//     cartAddAmazonParams[key + 'ASIN'] = item.asin
//     cartAddAmazonParams[key + 'Quantity'] = item.quantity
//     return item
//   })

//   var cartModifyAmazonParams = {
//     'AssociateTag': associateTag,
//     'CartId': cart.amazon_cartid,
//     'HMAC': cart.amazon_hmac
//   };
//   var lastModifyIndex = 0
//   var modifyItems = cart.items.filter((i, index) => {
//     return amazonItems.map(ai => {
//       if (ai.ASIN === i.asin && parseInt(ai.Quantity) !== i.quantity) {
//         var key = 'Item.' + (index + 1) + '.'
//         lastModifyIndex = index + 1
//         cartModifyAmazonParams[key + 'CartItemId'] = ai.CartItemId
//         cartModifyAmazonParams[key + 'Quantity'] = i.quantity || 0
//         return i
//       }
//     }).filter(Boolean).length > 0
//   })

//   var itemsToDelete = amazonItems.filter(ai => {
//     if (cart.items.filter(i => i.asin === ai.ASIN).length === 0) {
//       cartModifyAmazonParams['Item.' + (lastModifyIndex + 1) + '.CartItemId'] = ai.CartItemId
//       cartModifyAmazonParams['Item.' + (lastModifyIndex + 1) + '.Quantity'] = 0
//       return ai
//     }
//   })

//   // Return an amazon cart value, either the one we got earlier or the response
//   // from one of the modification requests below
//   var returnValue = amazonCart
//   if (missingItems.length > 0) {
//     var res = yield opHelper.execute('CartAdd', cartAddAmazonParams);
//     checkError(res.result.CartAddResponse.Cart)
//     returnValue = res.result.CartAddResponse.Cart
//   }
//   if (modifyItems.length > 0 || itemsToDelete.length > 0) {
//     res = yield opHelper.execute('CartModify', cartModifyAmazonParams);
//     checkError(res.result.CartModifyResponse.Cart)
//     returnValue = res.result.CartModifyResponse.Cart
//   }

//   if (!returnValue.PurchaseURL) {
//     returnValue.PurchaseURL = amazonCart.PurchaseURL
//   }

//   return returnValue
// }
