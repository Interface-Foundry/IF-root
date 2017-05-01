var db
const dbReady = require('../../db')
dbReady.then((models) => { db = models; })

// var emoji = require('../utilities/emoji_utils');

/**
 * Sends an email informing the user that a url they typed
 * was not a valid amazon url we could user
 * @param {string} email - email of the user who is receiving the error-email
 */
var sendErrorEmail = function * (email, cartId, searchTerms) {
  logging.info('search terms', searchTerms)
  var error = yield db.Emails.create({
    recipients: email,
    sender: 'hello@kip.ai',
    subject: 'Oops',
    message_html: `<html><input type="hidden" id="" name="cartId" value="${cartId}">` +
      '<p>Unfortunately I wasn\'t able to find what you were looking for.' +
      (searchTerms && searchTerms.length ? 'Your search for ' + searchTerms.join(', ') + ' yielded no results': '') + //cannot read length of undefined
      '</p></html>'
  })
  yield error.send();
}

/**
 * Responds to the user with an email confirming that whatever
 * items have been added to their cart
 * @param {string} email - the email of the user we're responding to
 * @param {array} uris - array of the urls of the amazon items we're confirming
 * @param {array} searchResults - array of the items resulting from the user's search
 */
var sendConfirmationEmail = function * (email, subject, uris, searchResults, searchTerms, cart) {
  //create confirmation email
  console.log('sendConfirmationEmail called')
  var confirmation = yield db.Emails.create({
    recipients: email,
    sender: 'hello@kip.ai',
    subject: subject,
    template_name: 'item_add_confirmation'
  });

  var items = [];
  //find recently added items
  yield uris.map(function * (uri) {
    var item = yield db.Items.findOne({original_link: uri});
    items.push(item);
  })

  searchTerms = searchTerms.map(term => term.toUpperCase());

  var user = yield db.UserAccounts.findOne({email_address: email});

  //add template and send confirmation email
  yield confirmation.template('item_add_confirmation', {
    // baseUrl: 'http://mint-dev.kipthis.com',
    baseUrl: 'https://44c3b93d.ngrok.io',
    id: cart,
    items: items,
    searchResults: searchResults,
    searchTerms: searchTerms,
    userId: user.id
  })
  console.log('about to send the email')
  yield confirmation.send();
}

/**
 * Locates interrupted urls within the text
 * @param {string} text - body of the email from which we want to excise a potentially non-continuous url
 * @param {string} url - url that we have identified and want to excise
 * @param {int} start - the character index we want to test as a possible match for the url
 * @returns {array} - array of length two with starting and ending coordinates for the url match, if there is one, and null otherwise
 */
var testMatch = function (text, url, start) {
  var end = -1;
  var offset = 0; //number of extraneous (newline) characters we're editing out
  var contiguousWrong = 0;
  for (var j = 0; j < url.length; j++) {
   //  if (j > 5) console.log(text[start+j+offset], url[j], 'offset:', offset)
    if (start+j+offset >= text.length) {
       //this is not a match; we've run out of text
     return null;
    }
    if (text[start+j+offset] === url[j]) { //this is a match
      contiguousWrong = 0;
      if (j === url.length-1) {
        return [start, start+j+offset+1];
      }
    }
    else {//this might not be a match but we'll need to see
       if (contiguousWrong > 5) {
         return null;
       }
       else {
         j--;
         contiguousWrong++;
         offset++;
       }
   }
 }
 return null;
}

/**
 * tests each index in the text for a fuzzy match to the url
 * @param {string} text - the text being searched for the url
 * @param {string} url - the url that will be identified and removed
 * @returns {array} - start and end index for the string to be excised, or null if it can't be found
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
 * excises a series of fuzzy urls from a text
 * N.B. if a user pastes the same url several times, that url will be picked out of the html
 * multiple times, and end up in the urls array here multiple times. So we only need to excise
 * each url once.
 * @param {string} text - the text from which we want to excise urls
 * @param {array} urls - an array of urls to be excised
 * @returns {string} - the text, with the urls excised
 */
var exciseUrls = function (text, urls) {
  urls.map(function (url) {
    var indices = exciseUrl(text, url);
    // console.log('INDICES', indices)
    if (indices && text[indices[1]]) text = text.slice(0, indices[0]) + text.slice(indices[1]);
    // console.log('NEW TEXT', text);
  })
  return text;
}

/**
 * Separates the text of an email the user has sent us into search terms / phrases by paragraph
 * @param {string} text - the text of the body of an email, as Sendgrid reveals it to us
 * @param {array} urls - urls we have already identified as present in the email
 * @returns {array} - array of search terms / phrases the user has emailed us
 */
var getTerms = function (text, urls) {
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

  pars = pars.map(function (par) {
    par = par.replace(/[\[\]!@\#$%\^&\*\.<>\?{}]/g, '');
    return par;
  })

  console.log('paragraphs:', pars)
  return pars;
}

/**
 * truncates quoted text from prior emails in the conversation in order to isolate the user's response
 * @param {string} text - the email text to be truncated
 * @returns {string} - the email text, truncated
 */
var truncateConversationHistory = function (text) {
  var truncated = text.split(/On (Mon|Monday|Tue|Tuesday|Wed|Wednesday|Thu|Thursday|Fri|Friday|Sat|Saturday|Sun|Sunday)?,? (Jan|January|Feb|February|Mar|March|Apr|April|Jun|June|Jul|July|Aug|August|Sep|September|Oct|October|Nov|November|Dec|December)/);
  logging.info('new text', truncated[0]);
  return truncated[0];
};

/**
 * pulls valid amazon urls from the email body
 * @param {string} text - the text of the email body
 * @returns {array} - an array of the valid amazon urls in the email body
 */
var getUrls = function (html) {
  // **hopeful gmail version**

  console.log('html', html)
  var uris = html.match(/href="(.+?)"/gi);
  logging.info('uris', uris);
  if (!uris) return null;

  uris = uris.map(u => u.slice(6, u.length-1)); //trim off href junk
  console.log('should return these', uris)
  uris = uris.filter(u => /^https:\/\/www.amazon.com\//.test(u)); //validate uris as amazon links
  console.log('should be amazon', uris)

  if (!uris) {
    var uris = html.match(/(https?:.+)["\s]/gi);
    logging.info('janky uris', uris);
  }

  return uris;
}

module.exports = {
  sendErrorEmail: sendErrorEmail,
  sendConfirmationEmail: sendConfirmationEmail,
  getTerms: getTerms,
  getUrls: getUrls,
  truncateConversationHistory: truncateConversationHistory
}
