const co = require('co')
var validUrl = require('valid-url');
var multer = require('multer');
var upload = multer();
var express = require('express');
var router = express.Router();

var db
const dbReady = require('../../db')
dbReady.then((models) => { db = models; })

var amazonScraper = require('../cart/scraper_amazon');
var amazon = require('../cart/amazon_cart');
var utils = require('../utilities/incoming_utils');

/**
 * @api {post} /api/sendgrid/incoming
 * @apiDescription parses incoming user emails sent to kip.ai, and takes actions in response
 */
router.post('/incoming', upload.array(), (req, res) => co(function * () {
  console.log('posted to webhook');
  yield dbReady;
  // console.log('req.body', req.body)
  var email = req.body.from.split(' ');
  email = email[email.length-1];
  if (email[0] === '<') email = email.slice(1, email.length-1);
  var user = yield db.UserAccounts.findOrCreate({email: email});

  //If there's no text, send an error email and a 202 so sendgrid doesn't freak out
  if (!req.body.text || !req.body.html) {
    logging.info('no email body');
    yield utils.sendErrorEmail(email);
    res.sendStatus(202);
  }

  //parse out text and uris
  var bodyText = req.body.text;
  var bodyHtml = req.body.html;
  bodyText = utils.truncateConversationHistory(bodyText);
  bodyHtml = utils.truncateConversationHistory(bodyHtml);
  console.log('BODY HTML', bodyHtml)

  var all_uris = utils.getUrls(bodyHtml);
  // logging.info('all_uris', all_uris);

  var text = utils.getTerms(bodyText, all_uris);
  if (all_uris) var uris = all_uris.filter(u => /^https:\/\/www.amazon.com\//.test(u)); //validate uris as amazon links
  else var uris = null;
  // console.log('URIS', uris)

  //business logic starts here
  if (!uris && all_uris) {
    //send error email
    console.log('gonna send an error email');
    yield utils.sendErrorEmail(email);
  }

  var searchResults = [];
  if (text && text.length) {
    yield text.map(function * (p) {
      if (p.length) {
        console.log('searching amazon for:', p)
        try {
          var itemResults = yield amazon.searchAmazon(p);

          // console.log('got a result from amazon search', itemResults)
          if (itemResults) searchResults.push(itemResults);
        }
        catch (err) {
          logging.error(err);
        }
      }
    })
  }

  //get cart id
  var html = req.body.html;
  var cart_id = /name="cartId" value="(.*)"/.exec(html);
  if (cart_id) cart_id = cart_id[1];
  else {
    logging.error('email failed to pass in a cart id');
    res.sendStatus(202);
    return;
  }
  console.log('cart_id', cart_id)

  console.log('gonna query for the cart')
  var cart = yield db.Carts.findOne({id: cart_id}).populate('items');

  if (!cart) {
    logging.error('could not find cart');
    res.sendStatus(202);
    return;
  }

  if (uris && uris.length) { //if the user copypasted an amazon uri directly
    console.log('uris', uris)
    var url_items = yield uris.map(function * (uri) {
      // var item = yield amazonScraper.scrapeUrl(uri);

      var item = yield amazon.getAmazonItem(uri);
      logging.info(item);
      return item;
      // yield item.save();
      // if (item.Variations) console.log('there are options')
      // return yield amazon.addAmazonItemToCart(item, cart);
    });
    // console.log('amazon things', uris)
    yield url_items.map(function * (it) {
      yield amazon.addAmazonItemToCart(it, cart);
      console.log('finished calling that function you were scared to use')
      // cart.items.add(it.id);
      // it.cart = cart.id;
      // it.added_by = user.id
      // yield it.save();
    })
    yield cart.save();
  }
  else console.log('no amazon uris')

  if (uris || searchResults) {
    if (!uris) uris = [];
    if (!searchResults) searchResults = [];
    // logging.info('searchResults', searchResults);

    yield utils.sendConfirmationEmail(email, uris, searchResults, cart.id);
  }


  res.sendStatus(200);
}));

module.exports = router;
