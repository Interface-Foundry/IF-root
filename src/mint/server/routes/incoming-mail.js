console.log('incoming mail router')

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
var amazon = require('../cart/amazon_cart.js');

/**
 * Sends an email informing the user that a url they typed
 * was not a valid amazon url we could user
 * @param {string} email - email of the user who is receiving the error-email
 */
var sendErrorEmail = function * (email) {
  var error = yield db.Emails.create({
    recipients: email,
    hender: 'hello@kip.ai',
    subject: 'Oops',
    message_html: '<html><p>Unfortunately I couldn\'t understand the link you sent me -- make sure that you paste a full URL that links to an item on Amazon.com</p></html>'
  })

  yield error.send();
}

/**
 * Responds to the user with an email confirming that whatever
 * items have been added to their cart
 * @param {string} email - the email of the user we're responding to
 * @param {array} uris - array of the urls of the amazon items we're confirming
 */
var sendConfirmationEmail = function * (email, uris) {
  //create confirmation email
  var confirmation = yield db.Emails.create({
    recipients: email,
    sender: 'hello@kip.ai',
    subject: 'Items have been added to your cart!',
    template_name: 'item_add_confirmation'
    // message_html: '<html><body>Confirmation, woohoo!</body></html>'
  });

  var items = [];
  //find recently added items
  yield uris.map(function * (uri) {
    var item = yield db.Items.findOne({original_link: uri});
    items.push(item);
  })

  //add template and send confirmation email
  yield confirmation.template('item_add_confirmation', {
    baseUrl: 'https://72f2343b.ngrok.io',
    id: '7a43d85c928f',
    items: items
  })

  yield confirmation.send();
}

/**
 * TODO
 * @param
 * @returns
 */
var processText = function () {
  //TODO
  return "hapax legomenon"
}

/**
 * pulls valid amazon urls from the email body
 * @param {string} text - the text of the email body
 * @returns an array of the valid amazon urls in the email body
 */
var processAmazonURIs = function (text) {
  var words = text.split(/\s/);
  var all_uris = text.filter(w => validUrl.isUri(w));
  if (!all_uris) return null; // if there aren't any urls at all return null
  //validate uris as amazon links
  else return all_uris.filter(u => /^https:\/\/www.amazon.com\//.test(u));
}

/**
 * TODO, etc
 */
router.post('/', upload.array(), (req, res) => co(function * () {
  console.log('posted to webhook');
  yield dbReady;
  // console.log('req.body', req.body)
  var email = req.body.from.split(' ');
  email = email[email.length-1];
  if (email[0] === '<') email = email.slice(1, email.length-1);
  var user = yield db.UserAccounts.findOrCreate({email: email});

  //parse out text and uris
  var body = req.body.text;

  //If there's no text, send an error email and a 202 so sendgrid doesn't freak out
  if (!body) {
    logging.info('no email body');
    yield sendErrorEmail(email);
    res.sendStatus(202);
  }

  //TODO be smooth -- #warmachine
  var text = processText(body);
  var uris = processAmazonURIs(body;)

  //business logic starts here -- TODO
  if (!(uris.length) && all_uris) {
    //send error email
    console.log('gonna send an error email');
    yield sendErrorEmail(email);
  }
  if ((!uris || !uris.length) && !text) {
    console.log('no urls');
    //TODO search amazon
    res.sendStatus(200);
    return;
  }
  if (text) {
    try {
      console.log('gonna search:', text[0])
      var searchResults = yield amazon.searchAmazon(text[0]);

      console.log('got this:', JSON.stringify(searchResults))
      // res.sendStatus(200);
    }
    catch (err) {
      logging.error(err);
      // res.sendStatus(200);
    }
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

  // console.log('CART', cart)

  if (!cart) {
    logging.error('could not find cart');
    res.sendStatus(202);
    return;
  }

  if (uris.length) {
    console.log('uris', uris)
    var url_items = yield uris.map(function * (uri) {
      return yield amazonScraper.scrapeUrl(uri);
      var item = yield amazon.getAmazonItem(uri);
      console.log('ITEM', item)
      if (item.Variations) console.log('there are options')
      // return yield amazon.addAmazonItemToCart(item, cart);
    });
    console.log('amazon things', uris)
    yield url_items.map(function * (it) {
      cart.items.add(it.id);
      it.cart = cart.id;
      it.added_by = user.id
      yield it.save();
    })
    yield cart.save();

    yield sendConfirmationEmail(email, uris);
  }
  else console.log('no amazon uris')
  // var cart = yield db.Carts.findOne({id: cart_id}).populate('items')
  res.sendStatus(200);
}));

module.exports = router;
