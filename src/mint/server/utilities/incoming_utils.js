var db
const dbReady = require('../../db')
dbReady.then((models) => { db = models; })

var emoji = require('../utilities/emoji_utils');

/**
 * Sends an email informing the user that a url they typed
 * was not a valid amazon url we could user
 * @param {string} email - email of the user who is receiving the error-email
 */
var sendErrorEmail = function * (email) {
  var error = yield db.Emails.create({
    recipients: email,
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
var sendConfirmationEmail = function * (email, uris, searchResults) {
  //create confirmation email
  console.log('sendConfirmationEmail called')
  var confirmation = yield db.Emails.create({
    recipients: email,
    sender: 'hello@kip.ai',
    subject: 'Items have been added to your cart!',
    template_name: 'item_add_confirmation'
  });

  var items = [];
  //find recently added items
  yield uris.map(function * (uri) {
    var item = yield db.Items.findOne({original_link: uri});
    items.push(item);
  })

  //add template and send confirmation email
  yield confirmation.template('item_add_confirmation', {
    baseUrl: 'https://52ad1dce.ngrok.io',
    id: '7a43d85c928f',
    items: items,
    searchResults: searchResults
  })
  console.log('about to send the email')
  yield confirmation.send();
}

/**
 * TODO
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
    console.log('INDICES', indices)
    // console.log('URL:', url)
    // console.log('TEXT:', text)
    // console.log('INDICES:', indices)
    if (indices && text[indices[1]]) text = text.slice(0, indices[0]) + text.slice(indices[1]);
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

var truncateConversationHistory = function (text) {
  console.log('TEXT', text)
  var truncated = text.split(/On (Mon|Monday|Tue|Tuesday|Wed|Wednesday|Thu|Thursday|Fri|Friday|Sat|Saturday|Sun|Sunday)?,? (Jan|January|Feb|February|Mar|March|Apr|April|Jun|June|Jul|July|Aug|August|Sep|September|Oct|October|Nov|November|Dec|December)/);
  //ugh maybe just validate by time?????
  logging.info('new text', truncated[0]);
  return truncated[0];
}

/**
 * pulls valid amazon urls from the email body
 * @param {string} text - the text of the email body
 * @returns an array of the valid amazon urls in the email body
 */
var getUrls = function (html) {
  // html = html.split('mailto:')[0]; // truncates conversation history ON GMAIL
  console.log('html', html)
  var uris = html.match(/href="(.+?)"/gi);
  logging.info('uris', uris);
  if (!uris) return null;

  uris = uris.map(u => u.slice(6, u.length-1)); //trim off href junk
  console.log('should return these', uris)
  // uris = uris.filter(u => /^https:\/\/www.amazon.com\//.test(u)); //validate uris as amazon links
  // console.log('should be amazon', uris)
  return uris;
}

module.exports = {
  sendErrorEmail: sendErrorEmail,
  sendConfirmationEmail: sendConfirmationEmail,
  getTerms: getTerms,
  getUrls: getUrls,
  truncateConversationHistory: truncateConversationHistory
}
