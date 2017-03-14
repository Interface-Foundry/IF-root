var express = require('express');
var router = express.Router();
var co = require('co');

var utils = require('../utilities/utils.js');

/**
 * if they goto api/cart maybe redirect or something, possibly could use this elsewhere
 * @param {cart_id} ) cart_id to redirect to or whatever
 * redirects to cart/:cart_id
 */
router.get('/cart/:cart_id', (req, res) => co(function * () {
  res.redirect(`/cart/${req.params.cart_id}`);
}));

/**
 * adds item to cart based on url or possibly other ways
 * @param {cart_id} cart_id to add item to
 * @param {item_url} item url from amazon
 * @returns redirects to cart with item added
 */
router.get('/cart/:cart_id/addcart/:item_url', (req, res) => co(function * () {
  var original_url = req.params.item_url;
  var cartId = req.params.cart_id;

  // just get the amazon lookup results and title from that currently
  var itemTitle = yield utils.getItemByUrl(original_url);

  yield db.Items.create({
    cart: cartId,
    original_link: original_url,
    item_name: itemTitle
  });

  res.send(200);
}));

module.exports = router;
