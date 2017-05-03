const co = require('co');
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
 * @api {post} /sendgrid/incoming
 * @apiDescription parses incoming user emails sent to kip.ai, and takes actions in response
 */
router.post('/incoming', upload.array(), (req, res) => co(function * () {
  console.log('posted to webhook');
  yield dbReady;
  logging.info('FROM', req.body.from);
  logging.info('TO', req.body.to);
  var to = req.body.to.split(' ')[1]
  to = to.slice(1, to.length-1)
  var email = req.body.from.split(' ');
  email = email[email.length-1];
  if (email[0] === '<') email = email.slice(1, email.length-1);
  var user = yield db.UserAccounts.findOrCreate({email_address: email});

  //get cart id
  var html = req.body.html;
  var cart_id = /name="cartId" value="(.*)"/.exec(html);
  if (cart_id) cart_id = cart_id[1];
  console.log('cart_id', cart_id)
  console.log('gonna query for the cart')
  var cart = yield db.Carts.findOne({id: cart_id}).populate('items');
  if (!cart) { //if the cart id isn't supplied, try to find one
    console.log('oh, no, no cart id')
    const memberCarts = yield db.carts_members__user_accounts_id.find({
      user_accounts_id: user.id
    })
    const memberCartsIds = memberCarts.map( c => c.carts_members )

    var cart = yield db.Carts.findOne({
      or: [
        { leader: user.id },
        { id: memberCartsIds }
      ]
    }).populate('items').populate('leader').populate('members')
  }

  if (!cart) {
    logging.error('could not find cart');
    res.sendStatus(202);
    return;
  }
  logging.info('about to create email record');
  logging.info('cart.id', cart.id)
  //save email in the db
  var incoming = yield db.Emails.create({
    message_html: req.body.html,
    cart: cart.id,
    subject: req.body.subject,
    direction: 'received',
    recipients: to,
    sender: email
  });
  logging.info('created email record');

  //If there's no text, send an error email and a 202 so sendgrid doesn't freak out
  if (!req.body.text || ! req.body.html) {
    logging.info('no email body');
    yield utils.sendErrorEmail(email, cart_id, searchResults);
    res.sendStatus(202);
  }

  //parse out text and uris
  var bodyText = req.body.text;
  var bodyHtml = req.body.html;
  bodyText = utils.truncateConversationHistory(bodyText);
  bodyHtml = utils.truncateConversationHistory(bodyHtml);
  var all_uris = utils.getUrls(bodyHtml);
  // logging.info('all_uris', all_uris);

  var text = utils.getTerms(bodyText, all_uris);
  if (all_uris) var uris = all_uris.filter(u => /^https:\/\/www.amazon.com\//.test(u)); //validate uris as amazon links
  else var uris = [];
  // console.log('URIS', uris)

  //business logic starts here

  text = text.filter(p => p);
  logging.info('filtered text', text)

  var searchResults = [];
  var searchTerms = [];
  if (text && text.length) {
    yield text.map(function * (p) {
      if (p.length) {
        console.log('searching amazon for:', p)
        try {
          var itemResults = yield amazon.searchAmazon(p);

          if (itemResults) {
            searchResults.push(itemResults);
            searchTerms.push(p);
          }
        }
        catch (err) {
          logging.error(err);
        }
      }
    })
  }

  //if a search failed to turn anything up
  if ((text.length && !searchResults.length) || (!uris.length && all_uris)) {
    yield utils.sendErrorEmail(email, cart.id, text);
  }

  //get cart id
  var html = req.body.html;
  var cart_id = /name="cartId" value="(.*)"/.exec(html);
  if (cart_id) cart_id = cart_id[1];
  console.log('cart_id', JSON.stringify(cart_id))
  console.log('gonna query for the cart')
  var cart = yield db.Carts.findOne({id: cart_id}).populate('items');
  if (!cart) { //if the cart id isn't supplied, try to find one
    console.log('oh, no, no cart id')
    const memberCarts = yield db.carts_members__user_accounts_id.find({
      user_accounts_id: user.id
    })
    const memberCartsIds = memberCarts.map( c => c.carts_members )

    var cart = yield db.Carts.findOne({
      or: [
        { leader: user.id },
        { id: memberCartsIds }
      ]
    }).populate('items').populate('leader').populate('members')
  }

  if (!cart) {
    logging.error('could not find cart');
    res.sendStatus(202);
    return;
  }

  if (uris.length) { //if the user copypasted an amazon uri directly
    console.log('uris', uris)
    var url_items = yield uris.map(function * (uri) {
      return yield amazonScraper.scrapeUrl(uri);
      var item = yield amazon.getAmazonItem(uri);
      if (item.Variations) console.log('there are options')
    });
    yield url_items.map(function * (it) {
      cart.items.add(it.id);
      it.cart = cart.id;
      it.added_by = user.id
      yield it.save();
    })
    yield cart.save();
  }
  else console.log('no amazon uris')

  if (uris.length || searchResults.length) {
    yield utils.sendConfirmationEmail(email, req.body.subject, uris, searchResults, searchTerms, cart);
  }

  res.sendStatus(200);
}));

module.exports = router;
