var express = require('express')
var co = require('co')
var _ = require('lodash')

var router = express.Router();

const dealsDb = require('../deals/deals')

var db;
const dbReady = require('../../db');
dbReady.then((models) => { db = models; }).catch(e => console.error(e))

/**
 * Hack the router for error handling
 */
const methods = ['get', 'post', 'delete']
methods.map(method => {
  var _originalHandler = router[method]
  router[method] = function (path, fn) {
    if (typeof path !== 'string' || typeof fn !== 'function') {
      return _originalHandler.apply(router, arguments)
    }

    _originalHandler.call(router, path, function (req, res, next) {
      var ret = fn(req, res, next)
      if (ret instanceof Promise) {
        ret.catch(e => {
          next(e)
        })
      }
    })
  }
})

// Load routes
require('./other-api')(router)
require('./carts-api')(router)
require('./users-api')(router)

//temporary for camel testing
//TODO: delete
var deals = require('../deals_sample.json');
router.get('/test/deals', (req, res)=>{
  res.json(deals);
})

var item = require('../amazon_sample_item.json');
router.get('/test/item', (req, res)=>{
  res.json(item);
})

// Koh Dummy test eail
// curl -i -X POST http://127.0.0.1:3000/api/cart/36d4750ea2b3/test/komangwluce@gmail.com
router.post('/cart/:cart_id/test/:email_id', (req, res) => co(function * () {
  const email_id = req.params.email_id;
  const cart_id = req.params.cart_id;

  // Send an email to the user with the cart link
  var email = yield db.Emails.create({
    recipients: email_id,
    subject: 'Share Kip Cart Test',
    cart: cart_id
  })

  var allDeals = yield dealsDb.getDeals(4, 0)
      deals = [allDeals.slice(0, 2), allDeals.slice(2, 4)];

  // use the new_cart email template
  email.template('share_cart_2', {
    id: cart_id,
    name: email_id.split('@')[0],
    deals: deals
  })

  // remember to actually send it
  yield email.send();
}))


module.exports = router;
