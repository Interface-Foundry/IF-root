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

//temporary for camel testing
//TODO: delete
var deals = require('../deals_sample.json');
router.get('/test/deals', (req, res)=>{
  res.json(deals);
})
// DELETE THIS LATER 

module.exports = router;
