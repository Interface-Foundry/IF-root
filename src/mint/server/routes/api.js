var express = require('express')
var co = require('co')
var _ = require('lodash')
var fs = require('fs')
var path = require('path');
var router = express.Router();

var db;
const dbReady = require('../../db');
dbReady.then((models) => { db = models; }).catch(e => console.error(e))

/**
 * Hack the router for error handling
 */
const methods = ['get', 'post', 'put', 'delete']
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

// Koh Dummy test email
// curl -i -X GET http://127.0.0.1:3000/api/cart/4ba2030df526/test/komangwluce@gmail.com
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
      name: email_id + "\'s Kip Cart"
    },
    deals: deals
  })

  yield email.send();

  res.send(email.message_html)
}))

// Testing route for getting medium posts
// curl -i -X GET http://127.0.0.1:3000/api/blog/posts
router.get('/blog/posts', (req, res) => co(function * () {
  function makeRequest() {
    var res = request('https://medium.com/_/api/users/66b05b2821b1/profile/stream?limit=30&source=overview&page=5')
    return res.then(body => {
        return _formatPostObjects(body.split('])}while(1);</x>')[1]);
      }).catch(err => {
        console.log('bad', err);
      });
  }

  logging.info('about to get posts');
  var posts = yield makeRequest();

  res.send(posts)
}))

/**
 * Returns a version of text for the site
 * Used for A/B testing now, could be used for language later
 * @returns a json file with all of the strings for the home page
 */
router.get('/home/json', (req, res) => co(function* () {
  // need to check if we've already given them a version, and give the same version
  const siteVersion = req.UserSession.siteVersion ? req.UserSession.siteVersion : _.sample(['A', 'B', 'C']);
  req.UserSession.siteVersion = siteVersion;
  yield req.UserSession.save();
  // TODO: if anyone has a more efficient way to do this...
  const json = JSON.parse(fs.readFileSync(path.join(__dirname, 'site.json'), 'utf8'))[siteVersion];
  json.siteVersion = siteVersion;
  res.json(json);
}));

function _formatPostObjects(body) {
  let json = JSON.parse(body);

  return _.reduce(json.payload.references.Post, (acc, post, key) => {
    acc.push({
      id: key,
      title: post.title,
      firstPublishedAt: post.firstPublishedAt,
      imageSrc: post.previewContent.bodyModel.paragraphs[0].metadata ? `https://cdn-images-1.medium.com/${post.previewContent.bodyModel.paragraphs[0].metadata.id}` : null,
      postSrc: `https://medium.com/@kipsearch/${post.uniqueSlug}`
    })
    return acc;
  }, [])
}


/**
 * Scrapes camelcamelcamel
 * @returns full site HTML
 * @param the mongoId (as a string) of the last camel item we've shown the user
 */
 var request = require('request-promise');
var scrape = function * (previousId) {
  function makeRequest(url) {
    var res = process.env.NO_LUMINATI ? request(url) : proxy.luminatiRequest(url);
    return res.then(body => {
        // console.log('success', body);
        console.log('success');
        return body;
      }).catch(err => {
        console.log('bad', err);
      });
  }

  logging.info('about to scrape');
  var stuff = yield makeRequest(url);
  return stuff;
};


module.exports = router;
