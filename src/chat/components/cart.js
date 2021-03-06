/*eslint-env es6*/
var _ = require('lodash')
var moment = require('moment')
var co = require('co')
var sleep = require('co-sleep')
var natural = require('natural')
var amazon = require('../amazon-product-api_modified'); // npm amazon-product-api
var async = require('async')

// could use multiple amazon ids to relieve the load on the carts
var aws_clients = {
  [kip.config.amazon[0].awsId]: amazon.createClient(kip.config.amazon[0]),
  [kip.config.amazon[1].awsId]: amazon.createClient(kip.config.amazon[1]),
}

var DEFAULT_CLIENT = kip.config.amazon[0].awsId

var aws_client_id_list = Object.keys(aws_clients)

logging.info('AWS CLIENTS ', aws_client_id_list)
var processData = require('./process')
var fs = require('fs')

module.exports = {}

//
// Add an item to the db
// slack_id: either the team id or the user id if a personal cart
// user_id: the user who added the item
// item: the item from amazon result i guess
//
module.exports.addToCart = function (slack_id, user_id, item, type) {
  logging.info('adding item to cart for %s by user %s', slack_id, user_id)
  logging.debug('item', item);
  // fixing bug to convert string to to int
  if (item.reviews && item.reviews.reviewCount) {
    item.reviews.reviewCount = parseInt(item.reviews.reviewCount);
  }
  // Handle the case where the search api returns items that we can't add to cart
  var total_offers = parseInt(_.get(item, 'Offers[0].TotalOffers[0]') || '0')
  if (total_offers === 0) {
    // This item is not available.  According to the amazon documentation, the search
    // api can and will return items that you cannot buy.  So we have to just
    // ignore these things.
    // http://docs.aws.amazon.com/AWSECommerceService/latest/DG/AvailabilityParameter.html
    return Promise.reject('Item not available');
  }
  return co(function * () {
    logging.debug('type', type);
    // please do not remove changes below. it is required for fb to work.
    if (type == 'personal') {
      cart = yield getCart(slack_id, type);
    } else {
      var team_carts = yield db.Carts.find({slack_id: slack_id, purchased: false, deleted: false}).populate('items -source_json').exec()
      if (team_carts.length === 1) {
        var cart = team_carts[0];
      } else {
        cart = yield getCart(slack_id);
      }
    }
    logging.debug('cart', cart);
    // make sure we can add this item to the cart
    // know it's ok if the item already exists in the cart
    var ok = false;
    cart.aggregate_items.map(i => {
      if (i.ASIN === item.ASIN[0] && i.quantity > 1) {
        ok = true;
      }
    });

    // TODO can't check if an item is okay to add if it's their first item in the cart...
    if (!ok && _.get(cart, 'amazon.CartId[0]')) {
      var client = aws_clients[cart.aws_client || DEFAULT_CLIENT];
      if (typeof client === 'undefined') client = aws_clients[DEFAULT_CLIENT];

      // attempt to add the item to the cart for the first time, check for errors
      var res = yield client.addCart({
        CartId: cart.amazon.CartId[0],
        HMAC: cart.amazon.HMAC[0],
        'Item.0.ASIN': item.ASIN[0],
        'Item.0.Quantity': 1
      });
    // if (_.get(res, 'Request[0].Errors')) {
    //   console.error(JSON.stringify(_.get(res, 'Request[0].Errors'), null, 2))
    //   throw new Error('Cannot add this item to cart', JSON.stringify(_.get(res, 'Request[0].Errors')))
    // }
    }

    var link = yield processData.getItemLink(_.get(item, 'ItemLinks[0].ItemLink[0].URL[0]'), user_id, _.get(item, 'ASIN[0]'))

    var smallImage = _.get(item, 'SmallImage[0].URL[0]')
    var mediumImage = _.get(item, 'MediumImage[0].URL[0]')
    var largeImage = _.get(item, 'LargeImage[0].URL[0]')
    var altImage = item.altImage;
    var image = item.altImage || _.get(item, 'SmallImage[0].URL[0]')
    // if SSL causes problems for a platform in the future
    // if (smallImage.indexOf('images-na.ssl-images-amazon.com') > -1 || mediumImage.indexOf('images-na.ssl-images-amazon.com') > -1) {
    //   image = 'http://kipthis.com/images/kip_head.png'
    // }
    logging.debug('creating item in database')
    var i = yield (new db.Item({
      cart_id: cart._id,
      ASIN: _.get(item, 'ASIN[0]'),
      title: _.get(item, 'ItemAttributes[0].Title'),
      link: link,
      image: image,
      price: item.realPrice,
      rating: _.get(item, 'reviews.rating'),
      review_count: _.get(item, 'reviews.reviewCount'),
      added_by: user_id,
      slack_id: slack_id,
      source_json: JSON.stringify(item)
    })).save()
    logging.debug('adding item %s to cart %s', i._id, cart._id)
    cart.items.push(i._id)
    yield cart.save()
    logging.debug('calling getCart again to rebuild amazon cart')
    try {
      yield getCart(slack_id)
    } catch (e) {
      // didn't work, so remove the item and say sorry
      cart.items = cart.items.filter(item => {
        logging.debug(item)
        logging.debug(i._id)
        return item !== i._id
      })
      cart.save()
      i.remove()
      throw new Error('could not add item to cart')
    }
  })
}

//
// Removes all items in the cart
//
module.exports.emptyCart = function (cart_id) {
  return co(function * () {
    var cart = yield db.Carts.findOne({'slack_id': cart_id}).exec()
    if (!cart || cart == null) return null
    async.eachSeries(cart.items, function iterator (id, callback) {
      db.Item.findById(id).then(function (err, item) {
        if (item) {
          item.deleted = true
          item.save(function (err, saved) {
            callback()
          })
        } else {
          callback()
        }
      })
    }, function done (err) {
      if (err) logging.error(err)
    })
    logging.debug('slack_id:%s, cart_id:%s', cart.slack_id, cart_id);
    cart.items = []
    yield cart.save()
    // rebuild the cart
    return getCart(cart.slack_id)
  })
}

// Add an item already in cart to the db by increasing quantity
// slack_id: either the team id or the user id if a personal cart
// user_id: the user who added the item
// item: the item from getCart aggregate item
//
module.exports.addExtraToCart = function (cart, slack_id, user_id, item) {
  logging.debug('firing addextratocart')
  logging.debug('adding item to cart for %s by user %s', slack_id, user_id)
  logging.debug('ITEM ZZZZ ', item)
  logging.debug('CART ZZZZ ', cart)

  // fixing bug to convert string to to int
  // if (item.reviews && item.reviews.reviewCount){
  //   item.reviews.reviewCount = parseInt(item.reviews.reviewCount)
  // }

  // // Handle the case where the search api returns items that we can't add to cart
  // var total_offers = parseInt(_.get(item, 'Offers[0].TotalOffers[0]') || '0')
  // if (total_offers === 0) {
  //   // This item is not available.  According to the amazon documentation, the search
  //   // api can and will return items that you cannot buy.  So we have to just
  //   // ignore these things.
  //   // http://docs.aws.amazon.com/AWSECommerceService/latest/DG/AvailabilityParameter.html
  //   return Promise.reject('Item not available')
  // }

  return co(function * () {
    // var cart = yield getCart(slack_id)

    logging.debug('creating item in database')

    var i = yield (new db.Item({
      cart_id: cart._id,
      ASIN: item.ASIN,
      title: item.title,
      link: item.link, // so obviously converted to json from xml
      image: item.image,
      price: item.price,
      rating: item.rating,
      review_count: item.review_count,
      added_by: user_id,
      slack_id: slack_id,
    // source_json: JSON.stringify(item)
    })).save()

    logging.debug('adding item %s to cart %s', i._id, cart._id)
    cart.items.push(i._id)
    yield cart.save()

    logging.debug('calling getCart again to rebuild amazon cart')
    return getCart(slack_id)
  })
}

//

// Remove item from the db
// slack_id: either the team id or the user id if a personal cart
// user_id: the user who is trying to remove the item from the cart
// number: the item to remove in cart array, as listed in View Carts
//
module.exports.removeFromCart = function (slack_id, user_id, number, type) {
  logging.debug(`removing item #${number} from cart`)

  return co(function * () {
    var cart = yield getCart(slack_id)
    // please do not remove changes below. it is required for fb to work.

    if (type == 'team') {
      var team = yield db.slackbots.findOne({team_id: slack_id})
      var userIsAdmin = team.meta.office_assistants.includes(user_id)
    }

    // need to watch out for items that have multiple quantities
    // check to make sure this item exists
    var ASIN_to_remove = _.get(cart, `aggregate_items[${number - 1}].ASIN`)

    if (!ASIN_to_remove) {
      return cart
    }

    // first just try to remove one item that this user added

    var matching_items = cart.items.filter(function (i) {
      return i.ASIN === ASIN_to_remove && (i.added_by === user_id || userIsAdmin)
    });
    if (matching_items.length < 1) return cart;
    return module.exports.removeFromCartByItem(matching_items.pop());
  })
}

// Removes all of an item from the db
// slack_id: either the team id or the user id if a personal cart
// number: the item to remove in cart array, as listed in View Carts
//
module.exports.removeAllOfItem = function (slack_id, number) {
  logging.debug(`removing all of item #${number} from cart`)

  return co(function * () {
    var cart = yield getCart(slack_id)
    logging.debug('got cart')
    // need to watch out for items that have multiple quantities
    // check to make sure this item exists

    var unique_items = _.uniqBy(cart.aggregate_items, 'ASIN')
    var ASIN_to_remove = _.get(unique_items, `${number - 1}.ASIN`)
    var item_to_remove = _.get(unique_items, `${number - 1}.title`)

    logging.debug('item to remove is %s', item_to_remove)

    if (!ASIN_to_remove) {
      kip.err('no asin found')
      return cart
    }
    var matching_items = cart.items.filter(function(i) {
      return i.ASIN === ASIN_to_remove
    })

    while (matching_items.length > 1) {
      yield module.exports.removeFromCartByItem(matching_items.pop())
    }
    return module.exports.removeFromCartByItem(matching_items.pop())
  })
}

//
// Removes one item from the cart at a time
//
module.exports.removeFromCartByItem = function (item) {
  return co(function * () {
    if (!(item instanceof db.Item)) {
      logging.error('can only remove mongoose models of type db.Item')
      throw new Error('Cannot remove item - must be a db.Item model')
    }
    var cart = yield db.Carts.findById(item.cart_id).exec()
    item.deleted = true
    cart.items = cart.items.filter(function (i) {
      return i.toString() !== item._id.toString()
    })
    yield [cart.save(), item.save()]

    // rebuild the cart
    return getCart(cart.slack_id)
  })
}

//
// Syncs cart with amazon and returns a nicely formatted object
// Right now there is no saved amazon cart, so if they delete something from
// amazon,
// Returns a promise for yieldy things
//
var getCart = module.exports.getCart = function (slack_id, force_rebuild) {
  var timer = kip.timer('get cart')
  return co(function * () {
    //
    // Get the Kip mongodb cart first (amazon cart next)
    //
    var cart
    kip.log('getting team cart for ' + slack_id)
    var team_carts = yield db.Carts.find({slack_id: slack_id, purchased: false, deleted: false}).populate('items', '-source_json').exec()
    timer('fetched team_cart from db if exists')

    if (!team_carts || team_carts.length === 0) {
      // create a new cart
      kip.log('no carts found, creating new cart for ' + slack_id)
      cart = new db.Cart({
        slack_id: slack_id,
        items: [],
        aws_client: aws_client_id_list[(Math.random() * aws_client_id_list.length) | 0]
      })
    } else {
      // yay already have a cart
      cart = team_carts[0]
    }

    var client = aws_clients[cart.aws_client || DEFAULT_CLIENT]
    if (typeof client === 'undefined') client = aws_clients[DEFAULT_CLIENT]

    //
    // get the amazon cart for this Kip cart
    //

    // can't have an empty amazon cart
    if (cart.items.length === 0) {
      return cart
    }

    // ugh items/quanitites XML/json nastiness
    var cart_items = cart.aggregate_items.reduce(function (cart_items, item, index) {
      cart_items['Item.' + index + '.ASIN'] = item.ASIN
      cart_items['Item.' + index + '.Quantity'] = item.quantity
      return cart_items
    }, {})

    // Check in with the amazon cart to see if they click-throughed to purchase,
    // which removes the items from the Kip-generated cart and puts them in
    // a real cart in their browser, where they are logged in or something.

    // create a new cart if they don't have one
    if (!cart.amazon) {
      kip.debug('creating new cart in amazon')
      var amazonCart = yield client.createCart(cart_items)
      cart.amazon = amazonCart
      cart.link = yield processData.getCartLink(_.get(cart, 'amazon.PurchaseURL[0]'), cart._id)
      yield cart.save()

      return cart
    }

    // otherwize rebuild their current cart
    // make sure the cart has not been checked out (purchased) yet
    timer('getting cart from amazon')
    var amazonCart = yield client.getCart({
      'CartId': _.get(cart, 'amazon.CartId.0'),
      'HMAC': _.get(cart, 'amazon.HMAC[0]')
    })
    timer('got cart from amazon')

    // kip.debug(amazonCart))

    // If the amazon cart is empty but

    // if the cart is not there, then i guess it has been purchased
    // Although maybe the cart has expired? TODO
    // mark cart as purchased and create a new one
    if (!amazonCart.Request[0].IsValid[0] || amazonCart.Request[0].Errors) {
      kip.log('cart has already been purchased')
      cart.purchased = true
      cart.purchased_date = new Date()
      yield cart.save()
      yield cart.items.map(function (i) {
        i.purchased = true
        i.purchased_date = cart.purchased_date
        return i.save()
      });

      kip.debug('creating a new cart for ' + slack_id)
      cart = new db.Cart({
        slack_id: slack_id,
        items: []
      })
      kip.debug('creating new cart in amazon')
      var amazonCart = yield client.createCart(cart_items)

      // ERROR TEMP FIX: can't save item to cart, example item: "VELCANS® Fashion Transparent and Flat Ladies Rain Boots" to cart
      if (amazonCart.Request[0].Errors && amazonCart.Request[0].Errors[0] && amazonCart.Request[0].Errors[0].Error && amazonCart.Request[0].Errors[0].Error[0].Message && amazonCart.Request[0].Errors[0].Error[0].Message[0].indexOf('not eligible to be added to the cart') > -1) {
        kip.err('ERR: Amazon item is not eligible to be added to the cart')
        // cart.amazon = amazonCart

        kip.debug('# cart ', cart);

        // cart.link =
        // cart.link = yield getCartLink(_.get(cart, 'amazon.PurchaseURL[0]'), cart._id)
        // yield cart.save()
        return cart
      }
      // no error adding item to cart
      else {
        cart.amazon = amazonCart
        cart.link = yield processData.getCartLink(_.get(cart, 'amazon.PurchaseURL[0]'), cart._id)
        yield cart.save()
        return cart
      }
    }

    //
    // "SubTotal": [
    //   {
    //     "Amount": [
    //       "15435"
    //     ],
    //     "CurrencyCode": [
    //       "USD"
    //     ],
    //     "FormattedPrice": [
    //       "$154.35"
    //     ]
    //   }
    // ],

    // check items and quantities to see if they match
    var cart_items_hash = cart.aggregate_items.reduce((hash, i) => {
      hash[i.ASIN] = i.quantity
      return hash
    }, {})
    var amazon_items = _.get(amazonCart, 'CartItems[0].CartItem') || []

    /*
    { Request: [ { IsValid: [Object], CartGetRequest: [Object] } ],
  HMAC: [ '6Axr5aN7FLqoEVtNWknoyzf1JdI=' ],
  CartId: [ '182-6172169-7031558' ],
  URLEncodedHMAC: [ '6Axr5aN7FLqoEVtNWknoyzf1JdI%3D' ] }
  */

    var needs_rebuild = amazon_items.length !== cart.aggregate_items.length
    amazon_items = amazon_items.map(i => {
      logging.debug(cart_items_hash[i.ASIN[0]], parseInt(i.Quantity[0]))
      if (cart_items_hash[i.ASIN[0]] !== parseInt(i.Quantity[0])) {
        needs_rebuild = true
      }
    })
    if (!needs_rebuild) {
      kip.debug('cart not changed')
    } else {
      kip.debug(_.get(amazonCart, 'SubTotal[0].FormattedPrice[0]'), cart.total)
      // rebuild amazon cart off of the contents we have in the db
      kip.debug('clearing cart for rebuild ' + cart.amazon.CartId)
      timer('clearing cart for rebuild')
      yield client.clearCart({
        'CartId': cart.amazon.CartId[0],
        'HMAC': cart.amazon.HMAC[0]
      })
      timer('cleared')



      timer('rebuilding cart ' + cart.amazon.CartId)
      logging.debug('rebuilding cart')
      var items_to_add = _.merge({}, cart_items, {
        CartId: cart.amazon.CartId[0],
        HMAC: cart.amazon.HMAC[0]
      })
      // kip.debug(items_to_add)
      var res = yield client.addCart(items_to_add)
      var errors = _.get(res, 'Request[0].Errors')
      kip.debug('errors', errors)
      if (errors) {
        // checks to see if error is from too many of specific item in cart,
        // sends a message if it is
        let matching_items,
          invalidQuantityAsin;
        errors.forEach(ele => {
          let code = ele.Error[0].Code[0]; // might have to check every on at some point instead of the first
          let message = ele.Error[0].Message[0];
          if (code.includes('InvalidQuantity')) {
            invalidQuantityAsin = message.match(/:\s(\w+)/)[1];
            matching_items = cart.items.filter(function (i) {
              return i.ASIN === invalidQuantityAsin;
            });
          }
        });
        if (matching_items) {
          cart = yield module.exports.removeFromCartByItem(matching_items.pop());
          cart.error = '^ Sorry, Amazon won\'t let me add another to your cart';
          cart.errorASIN = invalidQuantityAsin;
        }
      }
      timer('rebuilt');
    }

    // pretty print a nice cart
    kip.debug('final cart summary:', {
      link: cart.link,
      team: cart.slack_id,
      total: cart.total,
      items: cart.aggregate_items.map(i => {
        return { ASIN: i.ASIN, title: i.title, quantity: i.quantity}})
    })
    return cart
  })
}

//
// for the report, we'll need a base corpus of words searched in the last week
//
var term_freq = new natural.TfIdf()
db.Messages.find({
  bucket: 'search',
  action: 'initial',
  incoming: 'true',
  ts: {$gt: moment().subtract(7, 'day')}
}).exec(function (e, messages) {
  if (e) {
    logging.error('Could not get search terms for report generation statistics')
  }
  var all_terms_doc = messages.map((m) => {
    return m.tokens[0]
  }).join(' ')
  term_freq.addDocument(all_terms_doc)
})

//
// Get the summary of all the things ppl ordered on slack in the past X days
//
var report = module.exports.report = function (slack_id, days) {
  // default days to one week, eek!
  if (typeof days !== 'number' || days < 1) {
    days = 7
  }

  // fill in these fields
  var report = {
    begin_date: '',
    end_date: '',
    generated_date: '',
    total: '',
    items: [],
    top_category: '',
    most_searched: '',
    unique_search: ''
  }

  return co(function * () {
    report.begin_date = moment().subtract(days, 'day')
    report.end_date = moment()
    report.generated_date = moment()

    var carts = yield db.Carts.find({
      slack_id: slack_id,
      deleted: false,
      $or: [
        {purchased_date: {$exists: false}}, // all open carts
        {purchased_date: {$gt: report.begin_date}}
      ]
    }).populate('items').exec()

    // I guess we'll aggregate all the items by creating a new cart object
    var aggregate_cart = new db.Cart()
    aggregate_cart.items = carts.reduce(function (items, cart) {
      return items.concat(cart.items)
    }, [])

    report.total = aggregate_cart.total
    report.items = aggregate_cart.aggregate_items

    //
    // get top category
    //
    var category_counts = _.countBy(report.items, (i) => {
      return _.get(JSON.parse(i.source_json), 'ItemAttributes[0]Binding[0]')
    })

    var top_count = 0
    Object.keys(category_counts).map(function (cat) {
      if (category_counts[cat] > top_count) {
        top_count = category_counts[cat]
        report.top_category = cat
      }
    })

    //
    // Get most searched term
    //
    var messages = yield db.Messages.find({
      bucket: 'search',
      action: 'initial',
      incoming: 'true',
      'source.org': slack_id,
      ts: {$gt: report.begin_date}
    }).select('tokens').exec()

    logging.debug(messages)
    var search_terms = messages
      .map((m) => {
        return m.tokens[0]})
      .filter((t) => {
        return !t.match(/(collect|report|wait|stop|no|yes)/)
      })
    logging.debug(search_terms)
    word_counts = {}
    for (var i = 0; i < search_terms.length; i++) {
      word_counts['_' + search_terms[i]] = (word_counts['_' + search_terms[i]] || 0) + 1
    }
    top_count = 0
    logging.debug(word_counts)
    Object.keys(word_counts).map(function (word) {
      if (word_counts[word] > top_count) {
        top_count = word_counts[word]
        report.most_searched = word.substr(1)
      }
    })

    //
    // Get most unique search term
    //
    var lowest_score = 10
    Object.keys(word_counts).map(function (word) {
      word = word.substr(1)
      term_freq.tfidfs(word, function (i, measure) {
        logging.debug(word, i, measure, word_counts['_' + word], measure / word_counts['_' + word])
        measure = measure / word_counts['_' + word]
        if (measure < lowest_score) {
          lowest_score = measure
          report.unique_search = word
        }
      })
    })

    return report
  })
}

//
// Testing
//
if (!module.parent) {
  co(function * () {
    var cart = yield getCart('T0R6J00JW')
    logging.debug('cart', cart)
    var cart = yield module.exports.removeAllOfItem('T0R6J00JW', 5)
    logging.debug('cart', cart)
  }).catch(e => {
    kip.err(e)
  })
}
