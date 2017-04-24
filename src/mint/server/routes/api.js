var express = require('express')
var co = require('co')
var _ = require('lodash')

var router = express.Router();

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

// Koh Dummy test eail
// curl -i -X GET http://127.0.0.1:3000/api/cart/36d4750ea2b3/test/komangwluce@gmail.com
const dealsDb = require('../deals/deals')
router.get('/cart/:cart_id/test/:email_id', (req, res) => co(function * () {
  const email_id = req.params.email_id;
  const cart_id = req.params.cart_id;

  var email = yield db.Emails.create({
    recipients: email_id,
    subject: 'Share Kip Cart Test',
    cart: cart_id
  })

  var allDeals = yield dealsDb.getDeals(4, 0)
      deals = [allDeals.slice(0, 2), allDeals.slice(2, 4)];

  email.template('share_cart_demo', {
    cart: {
      id: cart_id,
      name: email_id + "\'s Kip Group Cart"
    },
    deals: deals
  })

  yield email.send();

  res.send(email.message_html)
}))


module.exports = router;
