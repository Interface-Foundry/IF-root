/*eslint-env es6*/
var db = require('db')
var _ = require('lodash')
var moment = require('moment')
var co = require('co')
var sleep = require('co-sleep')
var natural = require('natural')
var amazon = require('../amazon-product-api_modified'); //npm amazon-product-api
// var client = amazon.createClient({
//   awsId: "AKIAILD2WZTCJPBMK66A",
//   awsSecret: "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",
//   awsTag: "bubboorev-20"
// });
var client = amazon.createClient({
  awsId: "AKIAIKMXJTAV2ORZMWMQ",
  awsSecret: "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",
  awsTag: "quic0b-20"
});

var getCartLink = require('./process').getCartLink;
var fs = require('fs')
var kip = require('kip');

module.exports = {};

//
// Add an item to the db
// slack_id: either the team id or the user id if a personal cart
// user_id: the user who added the item
// item: the item from amazon result i guess
//
module.exports.addToCart = function(slack_id, user_id, item) {
  console.log('adding item to cart for ' + slack_id + ' by user ' + user_id);
  console.log('ITEM ZZZZ ',item)

  //fixing bug to convert string to to int
  if (item.reviews && item.reviews.reviewCount){
    item.reviews.reviewCount = parseInt(item.reviews.reviewCount);
  }

  // Handle the case where the search api returns items that we can't add to cart
  var total_offers = parseInt(_.get(item, 'Offers[0].TotalOffers[0]') || '0');
  if (total_offers === 0) {
    // This item is not available.  According to the amazon documentation, the search
    // api can and will return items that you cannot buy.  So we have to just
    // ignore these things.
    // http://docs.aws.amazon.com/AWSECommerceService/latest/DG/AvailabilityParameter.html
    return Promise.reject('Item not available');
  }

  return co(function*() {
    var cart = yield getCart(slack_id);
    console.log(cart);

    console.log('creating item in database')
    var i = yield (new db.Item({
      cart_id: cart._id,
      ASIN: _.get(item, 'ASIN[0]'),
      title: _.get(item, 'ItemAttributes[0].Title'),
      link: _.get(item, 'ItemLinks[0].ItemLink[0].URL[0]'), // so obviously converted to json from xml
      image: item.altImage || _.get(item, 'SmallImage[0].URL[0]'),
      price: item.realPrice,
      rating: _.get(item, 'reviews.rating'),
      review_count: _.get(item, 'reviews.reviewCount'),
      added_by: user_id,
      slack_id: slack_id,
      source_json: JSON.stringify(item)
    })).save();

    console.log('adding item ' + i._id + ' to cart ' + cart._id);
    cart.items.push(i._id);
    yield cart.save();

    console.log('calling getCart again to rebuild amazon cart')
    return getCart(slack_id);
  })
}


// Add an item already in cart to the db by increasing quantity
// slack_id: either the team id or the user id if a personal cart
// user_id: the user who added the item
// item: the item from getCart aggregate item
//
module.exports.addExtraToCart = function(cart, slack_id, user_id, item) {
  console.log('adding item to cart for ' + slack_id + ' by user ' + user_id);
  console.log('ITEM ZZZZ ',item)
  console.log('CART ZZZZ ',cart)


  //fixing bug to convert string to to int
  // if (item.reviews && item.reviews.reviewCount){
  //   item.reviews.reviewCount = parseInt(item.reviews.reviewCount);
  // }

  // // Handle the case where the search api returns items that we can't add to cart
  // var total_offers = parseInt(_.get(item, 'Offers[0].TotalOffers[0]') || '0');
  // if (total_offers === 0) {
  //   // This item is not available.  According to the amazon documentation, the search
  //   // api can and will return items that you cannot buy.  So we have to just
  //   // ignore these things.
  //   // http://docs.aws.amazon.com/AWSECommerceService/latest/DG/AvailabilityParameter.html
  //   return Promise.reject('Item not available');
  // }

  return co(function*() {
    // var cart = yield getCart(slack_id);
    // console.log(cart);

    console.log('creating item in database')

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
    })).save();

    console.log('adding item ' + i._id + ' to cart ' + cart._id);
    cart.items.push(i._id);
    yield cart.save();

    console.log('calling getCart again to rebuild amazon cart')
    return getCart(slack_id);
  })
}

//

// Remove item from the db
// slack_id: either the team id or the user id if a personal cart
// user_id: the user who is trying to remove the item from the cart
// number: the item to remove in cart array, as listed in View Carts
//
module.exports.removeFromCart = function(slack_id, user_id, number) {
  console.log(`removing item #${number} from cart`)

  return co(function*() {
    var cart = yield getCart(slack_id);
    var team = yield db.slackbots.findOne({team_id: slack_id});
    var userIsAdmin = team.meta.office_assistants.indexOf(user_id) >= 0;

    // need to watch out for items that have multiple quantities
    // check to make sure this item exists
    var ASIN_to_remove = _.get(cart, `aggregate_items[${number - 1}].ASIN`);

    if (!ASIN_to_remove) {
      return cart;
    }


    // first just try to remove one item that this user added
    var matching_items = cart.items.filter(function(i) {
      return i.ASIN === ASIN_to_remove && i.added_by === user_id;
    })

    if (matching_items.length >= 1) {
        return module.exports.removeFromCartByItem(matching_items.pop());
    }

    // if no items matching the user_id were found, an admin can still remove any item
    matching_items = cart.items.filter(function(i) {
      return i.ASIN === ASIN_to_remove;
    })

    return module.exports.removeFromCartByItem(matching_items.pop());
  })
}

// Removes all of an item from the db
// slack_id: either the team id or the user id if a personal cart
// number: the item to remove in cart array, as listed in View Carts
//
module.exports.removeAllOfItem = function(slack_id, number) {
  console.log(`removing item #${number} from cart`)

  return co(function*() {
    var cart = yield getCart(slack_id);
    console.log('got cart');

    // need to watch out for items that have multiple quantities
    // check to make sure this item exists
    var ASIN_to_remove = _.get(cart, `aggregate_items[${number - 1}].ASIN`);
    console.log('asin to remove is', ASIN_to_remove);

    if (!ASIN_to_remove) {
      kip.err('no asin found');
      return cart;
    }

    yield cart.items.filter(i => {
      return i.ASIN === ASIN_to_remove
    }).map(i => {
      i.deleted = true;
      return i.save();
    });

    cart.items = cart.items.filter(i => {
      return i.ASIN !== ASIN_to_remove;
    });

    yield cart.save();
    return getCart(slack_id);
  })
}


//
// Removes one item from the cart at a time
//
module.exports.removeFromCartByItem = function(item) {
  return co(function*() {
    if (!(item instanceof db.Item)) {
      console.error("can only remove mongoose models of type db.Item")
      throw new Error('Cannot remove item - must be a db.Item model')
    }
    var cart = yield db.Carts.findById(item.cart_id).exec();
    item.deleted = true;
    cart.items = cart.items.filter(function(i) {
      return i.toString() !== item._id.toString();
    })
    yield [cart.save(), item.save()]

    // rebuild the cart
    return getCart(cart.slack_id);
  })
}

//
// Syncs cart with amazon and returns a nicely formatted object
// Right now there is no saved amazon cart, so if they delete something from
// amazon,
// Returns a promise for yieldy things
//
var getCart = module.exports.getCart = function(slack_id, force_rebuild) {
  var timer = kip.timer('get cart');
  return co(function*() {
    //
    // Get the Kip mongodb cart first (amazon cart next)
    //
    var cart;
    kip.log('getting team cart for ' + slack_id)
    var team_carts = yield db.Carts.find({slack_id: slack_id, purchased: false, deleted: false}).populate('items', '-source_json').exec();
    timer('fetched team_cart from db if exists');

    if (!team_carts || team_carts.length === 0) {
      // create a new cart
      kip.log('no carts found, creating new cart for ' + slack_id)
      cart = new db.Cart({
        slack_id: slack_id,
        items: []
      })
    } else {
      // yay already have a cart
      cart = team_carts[0];
    }


    //
    // get the amazon cart for this Kip cart
    //

    // can't have an empty amazon cart
    if (cart.items.length === 0) {
      return cart;
    }

    // ugh items/quanitites XML/json nastiness
    var cart_items = cart.aggregate_items.reduce(function(cart_items, item, index) {
      cart_items['Item.' + index + '.ASIN'] = item.ASIN;
      cart_items['Item.' + index + '.Quantity'] = item.quantity;
      return cart_items;
    }, {})

    // Check in with the amazon cart to see if they click-throughed to purchase,
    // which removes the items from the Kip-generated cart and puts them in
    // a real cart in their browser, where they are logged in or something.

    // create a new cart if they don't have one
    if (!cart.amazon) {
      kip.debug('creating new cart in amazon')
      var amazonCart = yield client.createCart(cart_items)
      kip.debug(JSON.stringify(amazonCart, null, 2))
      cart.amazon = amazonCart;
      cart.link = yield getCartLink(_.get(cart, 'amazon.PurchaseURL[0]'), cart._id)
      yield cart.save();

      return cart;
    }


    // otherwize rebuild their current cart
    // make sure the cart has not been checked out (purchased) yet
    timer('getting cart from amazon');
    var amazonCart = yield client.getCart({
      'CartId': _.get(cart, 'amazon.CartId.0'),
      'HMAC': _.get(cart, "amazon.HMAC[0]")
    })
    timer('got cart from amazon');

    // console.log(JSON.stringify(amazonCart, null, 2))
    // kip.debug(amazonCart))

    // If the amazon cart is empty but

    // if the cart is not there, then i guess it has been purchased
    // Although maybe the cart has expired? TODO
    // mark cart as purchased and create a new one
    if (!amazonCart.Request[0].IsValid[0] || amazonCart.Request[0].Errors) {
      kip.log('cart has already been purchased')
      cart.purchased = true;
      cart.purchased_date = new Date();
      yield cart.save();
      yield cart.items.map(function(i) {
        i.purchased = true;
        i.purchased_date = cart.purchased_date;
        return i.save();
      })

      kip.debug('creating a new cart for ' + slack_id)
      cart = new db.Cart({
        slack_id: slack_id,
        items: []
      })
      kip.debug('creating new cart in amazon')
      var amazonCart = yield client.createCart(cart_items)

      // console.log(amazonCart.Request[0].Errors[0].Message[0]);

      //console.log(JSON.stringify(amazonCart.Request[0]));

      //ERROR TEMP FIX: can't save item to cart, example item: "VELCANS® Fashion Transparent and Flat Ladies Rain Boots" to cart
      if(amazonCart.Request[0].Errors && amazonCart.Request[0].Errors[0] && amazonCart.Request[0].Errors[0].Error && amazonCart.Request[0].Errors[0].Error[0].Message && amazonCart.Request[0].Errors[0].Error[0].Message[0].indexOf('not eligible to be added to the cart') > -1){

        kip.err('ERR: Amazon item is not eligible to be added to the cart');
        //cart.amazon = amazonCart;

        kip.debug('# cart ',cart);
        //console.log('# amz ',cart.amazon);

        //cart.link =
        //cart.link = yield getCartLink(_.get(cart, 'amazon.PurchaseURL[0]'), cart._id)
        //yield cart.save()
        return cart;

      }
      //no error adding item to cart
      else {
        kip.debug(JSON.stringify(amazonCart, null, 2))
        cart.amazon = amazonCart;
        cart.link = yield getCartLink(_.get(cart, 'amazon.PurchaseURL[0]'), cart._id)
        yield cart.save()
        return cart;
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
      hash[i.ASIN] = i.quantity;
      return hash;
    }, {});
    var needs_rebuild = false;
    var amazon_items = _.get(amazonCart, 'CartItems[0].CartItem') || [];
    amazon_items = amazon_items.map(i => {
      if (cart_items_hash[i.ASIN[0]] !== parseInt(i.Quantity[0])) {
        needs_rebuild = true;
      }
    })
    if (!needs_rebuild) {
      kip.debug('cart not changed');
    } else {
      kip.debug(_.get(amazonCart, 'SubTotal[0].FormattedPrice[0]'), cart.total);
      // rebuild amazon cart off of the contents we have in the db
      kip.debug('clearing cart for rebuild ' + cart.amazon.CartId);
      timer('clearing cart for rebuild');
      yield client.clearCart({
        'CartId': cart.amazon.CartId[0],
        'HMAC': cart.amazon.HMAC[0]
      })
      timer('cleared');

      yield sleep(8); //prevent amazon throttle

      timer('rebuilding cart ' + cart.amazon.CartId)
      console.log('rebuilding cart');
      yield client.addCart(_.merge({}, cart_items, {
        CartId: cart.amazon.CartId[0],
        HMAC: cart.amazon.HMAC[0],
      }))
      timer('rebuilt, saving')

      cart.save() // don't have to wait for cart to save
    }

    //pretty print a nice cart
    kip.debug('final cart summary:', {
      team: cart.slack_id,
      total: cart.total,
      items: cart.aggregate_items.map(i => {return { ASIN: i.ASIN, title: i.title, quantity: i.quantity}})
    });
    return cart;
  })
}

//
// for the report, we'll need a base corpus of words searched in the last week
//
var term_freq = new natural.TfIdf();
db.Messages.find({
  bucket: 'search',
  action: 'initial',
  incoming: 'true',
  ts: {$gt: moment().subtract(7, 'day')}
}).exec(function(e, messages) {
  if (e) {
    console.error('Could not get search terms for report generation statistics');
  }
  var all_terms_doc = messages.map((m) => {
    return m.tokens[0];
  }).join(' ');
  term_freq.addDocument(all_terms_doc);
})

//
// Get the summary of all the things ppl ordered on slack in the past X days
//
var report = module.exports.report = function(slack_id, days) {
  // default days to one week, eek!
  if (typeof days !== 'number' || days < 1) {
    days = 7;
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
  };

  return co(function*() {
    report.begin_date = moment().subtract(days, 'day');
    report.end_date = moment();
    report.generated_date = moment();

    var carts = yield db.Carts.find({
      slack_id: slack_id,
      deleted: false,
      $or: [
        {purchased_date: {$exists: false}}, // all open carts
        {purchased_date: {$gt: report.begin_date}}
      ]
    }).populate('items').exec();



    // I guess we'll aggregate all the items by creating a new cart object
    var aggregate_cart = new db.Cart();
    aggregate_cart.items = carts.reduce(function(items, cart) {
      return items.concat(cart.items);
    }, [])

    report.total = aggregate_cart.total;
    report.items = aggregate_cart.aggregate_items;

    //
    // get top category
    //
    var category_counts = _.countBy(report.items, (i) =>  {
      return _.get(JSON.parse(i.source_json), 'ItemAttributes[0]Binding[0]')
    })

    var top_count = 0;
    Object.keys(category_counts).map(function(cat) {
      if (category_counts[cat] > top_count) {
        top_count = category_counts[cat];
        report.top_category = cat;
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
    }).select('tokens').exec();

    console.log(messages);
    var search_terms = messages
      .map((m) => { return m.tokens[0] })
      .filter((t) => {
        return !t.match(/(collect|report|wait|stop|no|yes)/);
      });
    console.log(search_terms);
    word_counts = {};
    for(var i = 0; i < search_terms.length; i++) {
      word_counts["_" + search_terms[i]] = (word_counts["_" + search_terms[i]] || 0) + 1;
    }
    top_count = 0;
    console.log(word_counts);
    Object.keys(word_counts).map(function(word) {
      if (word_counts[word] > top_count) {
        top_count = word_counts[word];
        report.most_searched = word.substr(1);
      }
    })

    //
    // Get most unique search term
    //
    var lowest_score = 10;
    Object.keys(word_counts).map(function(word) {
      word = word.substr(1);
      term_freq.tfidfs(word, function(i, measure) {
        console.log(word, i, measure, word_counts['_' + word], measure/word_counts['_' + word]);
        measure = measure / word_counts['_' + word];
        if (measure < lowest_score) {
          lowest_score = measure;
          report.unique_search = word;
        }
      })
    });

    return report;
  })
}


//
// Testing
//
if (!module.parent) {
  co(function*() {
    var cart = yield getCart('T0R6J00JW');
    console.log(cart);
    var cart = yield module.exports.removeAllOfItem('T0R6J00JW', 5);
    console.log(cart);
  }).catch(e => {
    kip.err(e);
  })
}
