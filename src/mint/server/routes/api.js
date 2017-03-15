var express = require('express');
var co = require('co');
var _ = require('lodash');

var utils = require('../utilities/utils.js');

var router = express.Router();

/**
 * GET /api/session
 */
router.get('/session', (req, res) => {
  res.send(req.UserSession)
})

/**
 * if they goto api/cart maybe redirect or something, possibly could use this elsewhere
 * @param {cart_id} ) cart_id to redirect to or whatever
 * redirects to cart/:cart_id
 */
router.get('/cart/:cart_id', (req, res) => co(function * () {
  console.log('GETTING CART', req.params.cart_id);
  var cart = yield db.Carts.findOne({cart_id: req.params.cart_id});

  if (cart) {
    res.send(cart);
  } else {
    console.log('cart doesnt exist');
    res.send(400);
  }
}));

/**
 * gets items in cart
 * @param {[type]} )             {  var cart [description]
 * @yield {[type]} [description]
 */
router.get('/cart/:cart_id/items', (req, res) => co(function * () {
  var cart = yield db.Carts.findOne({cart_id: req.params.cart_id});
  if (cart) {
    res.send(cart.items);
  } else {
    console.log('cart doesnt exist');
    res.send(400);
  }
}));

/**
 * adds item to cart based on url or possibly other ways
 * @param {cart_id} cart_id to add item to
 * @param {item_url} item url from amazon
 * @returns 200
 */
router.post('/cart/:cart_id/items', (req, res) => co(function * () {
  var original_url = req.body.url;
  var cartId = req.params.cart_id;

  // just get the amazon lookup results and title from that currently
  var itemTitle = yield utils.getItemByUrl(original_url);

  var itemObj = {
    cart: cartId,
    original_link: original_url,
    item_name: itemTitle
  };

  var item = yield db.Items.findOne(itemObj);

  if (item) {
    item.quantity++;
  } else {
    yield db.Items.create(itemObj);
  }

  res.send(200);
}));

/**
 * delete or subtract item from cart
 * @param {string} item identifier
 * @param {cart_id} cart_id to remove item from
 * @param {quantity} [number to subtract]
 * @yield {[type]} [description]
 */
router.delete('/cart/:cart_id/items', (req, res) => co(function * () {
  var item = req.body.itemId;
  var cartId = req.params.cart_id;
  var quantity = _.get(req, 'body.quantity') ? req.body.quantity : -1;

  // just get the amazon lookup results and title from that currently
  yield db.Items.findOneAndUpdate({item: item, cart_id: cartId}, {$inc: {'quantity': quantity}});
  res.send(200);
}));

module.exports = router;
