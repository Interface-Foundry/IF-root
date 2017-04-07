const co = require('co')
const request = require('request-promise')
var validUrl = require('valid-url');
var multer = require('multer');
var upload = multer();
var express = require('express');
var router = express.Router();

var db
const dbReady = require('../../db')
dbReady.then((models) => { db = models; })

const deals = require('../deals/deals');
var amazonScraper = require('../cart/scraper_amazon');

/**
 * TODO, etc
 */
router.post('/', upload.array(), (req, res) => co(function * () {
  yield dbReady;
  console.log('req.body', req.body)
  var email = req.body.from.split(' ');
  email = email[email.length-1];
  if (email[0] === '<') email = email.slice(1, email.length-1);
  var user = db.UserAccounts.findOrCreate({email: email});

  var text = req.body.text.split(/\s/);

  var uris = (text ? text.filter(w => validUrl.isUri(w)) : null);
  uris = (uris ? uris.filter(u => /^https:\/\/www.amazon.com\//.test(u)) : null);   //validate uris as amazon links
  if (!uris) res.sendStatus(200);

  var html = req.body.html;
  var cart_id = /name="cartId" value="(.*)"/.exec(html)[1];
  console.log('cart_id', cart_id)

  // find all the carts where their user id appears in the leader or member field
  console.log('gonna query for the cart')
  var cart = yield db.Carts.findOne({id: cart_id});

  //TODO add uri to user's cart
  if (uris.length) {
    var url_items = yield uris.map(function * (uri) {
      return yield amazonScraper.scrapeUrl(uri);
    });
    // console.log('amazon things', uris)
    yield url_items.map(function * (it) {
      cart.items.add(it.id);
      it.cart = cart.id;
      it.added_by = user.id
      yield it.save();
    })
    yield cart.save();

    var confirmation = yield db.Emails.create({
      recipients: email,
      sender: 'hello@kip.ai',
      subject: 'Items have been added to your cart!',
      message_html: '<html><body>Confirmation, woohoo!</body></html>'
    });
    yield confirmation.send();
  }
  else console.log('no amazon uris')
  // var cart = yield db.Carts.findOne({id: cart_id}).populate('items')
  res.sendStatus(200);
}));

module.exports = router;
