/*eslint-env es6*/

// this script does all the work for chainging an affiliate ID:
// * migrate cart.aws_client for each cart
// * migrate cart.link for each cart
// * migrate each item link 
// * make a new cart on amazon using the new affiliate id that has the same items as the current cart

var db = require('db')
var kip = require('kip')
var _ = require('lodash')
var moment = require('moment')
var co = require('co')
var sleep = require('co-sleep')
var natural = require('natural')
var amazon = require('../amazon-product-api_modified') //npm amazon-product-api
var processData = require('./process')

var oldTag = "quic0b-20"
var newTag = "eileenog-20"
var newId = "AKIAJ7JWQNS2HH5UYNVQ"
var newSecret = "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"
var newClient = amazon.createClient({
  awsId: newId,
  awsSecret: newSecret,
  awsTag: newTag
})

function * migrate_cart(cart) {
  console.log('migrating cart for slack team', cart.slack_id)
  var cart_items = cart.aggregate_items.reduce(function(cart_items, item, index) {
    cart_items['Item.' + index + '.ASIN'] = item.ASIN
    cart_items['Item.' + index + '.Quantity'] = item.quantity
    return cart_items
  }, {})
  var amazonCart = yield newClient.createCart(cart_items)
  cart.amazon = amazonCart;
  try {
    cart.link = yield processData.getCartLink(_.get(cart, 'amazon.PurchaseURL[0]'), cart._id)
  } catch (e) {
    console.error('ERROR', cart._id, 'no url', _.get(cart, 'amazon.PurchaseURL[0]'))
    return
  }

  for (var i = 0; i < cart.items.length; i++) {
    try {
      var source = JSON.parse(cart.items[i].source_json)
    } catch (e) {
      console.log('error parsing json', cart.items[i].source_j)
      continue;
    }

    cart.items[i].link = yield processData.getItemLink(source.DetailPageURL[0]);
    yield cart.items[i].save();
  }

  
  return cart.save()
}

co(function * () {
  var carts = yield db.Carts.find({
    purchased: { $ne: true },
    deleted: { $ne: true }
  }).populate('items').exec();

  for (var i = 0; i < carts.length; i++) {
    yield migrate_cart(carts[i]);
    sleep(300);
  }
}).then(() => {
  console.log('done')
}).catch(e => {
  console.log('error')
  kip.err(e)
})