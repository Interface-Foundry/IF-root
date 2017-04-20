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
var amazon = require('../cart/amazon_cart');
var emoji = require('../utilities/emoji_utils')

/**
 * Sends an email informing the user that a url they typed
 * was not a valid amazon url we could user
 * @param {string} email - email of the user who is receiving the error-email
 */
var sendErrorEmail = function * (email) {
  var error = yield db.Emails.create({
    recipients: 'hannah.katznelson@kipthis.com',//email,
    sender: 'hello@kip.ai',
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
    recipients: 'hannah.katznelson@kipthis.com',//email,
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

 var testMatch = function (text, url, start) {
   var end = -1;
   var offset = 0; //number of extraneous (newline) characters we're editing out
   var contiguousWrong = 0;
   for (var j = 0; j < url.length; j++) {
     if (j > 5) console.log(text[start+j+offset], url[j], 'offset:', offset)
     if (start+j+offset >= text.length) {
        //this is not a match; we've run out of text
      // console.log('out of text')
      return null;
     }
     if (text[start+j+offset] === url[j]) { //this is a match
      //  console.log('check') //this continues to be a match
       contiguousWrong = 0;
       if (j === url.length-1) {
         //we're done!
        //  console.log('were done')
         return [start, start+j+offset+1];
       }
     }
     else {//this might not be a match but we'll need to see
        if (contiguousWrong > 5) {
    //    console.log('well not that')
          return null;
        }
        else {
          // console.log('gonna keep looking')
          j--;
          contiguousWrong++;
          offset++;
        }
    }
  }
  // console.log('something went wrong')
  return null;
}

/**
 * TODO
 * @param {string} text - the text being searched for the url
 * @param {string} url - the url that will be identified and removed
 * @returns {array} - start and end index for the string to be excised
 */
 var exciseUrl = function (text, url) {
   for (var i = 0; i < text.length; i++) {
    //  var start = -1;
    // console.log('testing', url, 'at', i)
    if (url.slice(0, 2) === text.slice(i, i+2)) {
      var result = testMatch(text, url, i);
      if (result) return result;
    }
   }
   return null;
 }


/**
 * TODO
 * N.B. if a user pastes the same url several times, that url will be picked out of the html
 * multiple times, and end up in the urls array here multiple times. So we only need to excise
 * each url once.
 * @param
 * @returns {string} - the text, with the urls excised
 */
var exciseUrls = function (text, urls) {
  urls.map(function (url) {
    var indices = exciseUrl(text, url);
    // console.log('URL:', url)
    // console.log('TEXT:', text)
    console.log('INDICES:', indices)
    text = text.slice(0, indices[0]) + text.slice(indices[1]);
    // console.log('NEW TEXT', text);
  })
  return text;
}

/**
 * TODO
 * @param
 * @returns
 */
var getTerms = function (text, urls) {
  // logging.info('TEXT:', text);
  if (urls) {
    urls = urls.map(url => url.replace(/&amp;/g, '&'));

    text = exciseUrls(text, urls);
    logging.info('TEXT, replaced:', text);
  }

  //filter out conversation history
  var allPars = text.split(/\r?\n|\r/g);
  pars = allPars.filter(function (p) {
    return p[0] !== '>';
  })
  //if there was a conversation history, get rid of the date / time line and
  //the two blank lines around it
  if (pars.length !== allPars.length) pars = pars.slice(0, pars.length-3);
  logging.info('pars', pars)

  pars = pars.map(function (par) {
    par = par.replace(/[\[\]!@\#$%\^&\*\.<>\?{}]/g, '');
    par = emoji(par);
    return par;
  })

  console.log('paragraphs:', pars)

  return pars;
}

/**
 * pulls valid amazon urls from the email body
 * @param {string} text - the text of the email body
 * @returns an array of the valid amazon urls in the email body
 */
var getUrls = function (html) {
  html = html.split('mailto:')[0]; // truncates conversation history
  console.log('html', html)
  var uris = html.match(/href="(.+?)"/gi);
  logging.info('uris', uris);
  if (!uris) return null;

  uris = uris.map(u => u.slice(6, u.length-1)); //trim off href junk
  console.log('should return theese', uris)
  uris = uris.filter(u => /^https:\/\/www.amazon.com\//.test(u)); //validate uris as amazon links
  console.log('should be amazon', uris)
  return uris;
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

  //If there's no text, send an error email and a 202 so sendgrid doesn't freak out
  if (!req.body.text || ! req.body.html) {
    logging.info('no email body');
    yield sendErrorEmail(email);
    res.sendStatus(202);
  }

  //parse out text and uris
  var bodyText = req.body.text;
  var bodyHtml = req.body.html;
  var uris = getUrls(bodyHtml);
  console.log('URIS', uris)
  var text = getTerms(bodyText, uris);

  //don't freak out sendgrid please
  res.sendStatus(200);
  return;

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
