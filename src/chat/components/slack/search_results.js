var _ = require('lodash');
var cardTemplate = require('./card_templates');
var slackUtils = require('./utils.js')


var buttons = function(num, shortMode, mode) {
  return shortMode ? [{
      "name":  `${mode}.addcart`,
      "text": "Add to Cart",
      "style": "primary",
      "type": "button",
      "value": 'addcart.' + num
    }] : [
    {
      "name": 'addcart',
      "text": "Add to Cart",
      "style": "primary",
      "type": "button",
      "value": num
    },
    {
      "name": 'cheaper',
      "text": "Find Cheaper",
      "style": "default",
      "type": "button",
      "value": num 
    },
    {
      "name": 'moreinfo',
      "text": "More Info",
      "style": "default",
      "type": "button",
      "value": num
    }
  ];
}

function truncate(string) {
   if (string.length > 80)
      return string.substring(0,80)+'...';
   else
      return string;
};

var emojis = {
  1: '*1.*',
  2: '*2.*',
  3: '*3.*'
};

//
// Generate the slack reponse for the search results
//
function * results(message, shortMode = false, modeName) {
  var amazon = JSON.parse(message.amazon);

  var results = amazon.map((r, i) => {
    return {
      color: '#45a5f4',
      text: emojis[i+1] + ' ' + `<${r.shortened_url}|*${truncate(_.get(r, 'ItemAttributes[0].Title[0]'))}*>`,
      image_url: r.picstitch_url,
      title_link: r.shortened_url,
      mrkdwn_in: ['text', 'pretext', 'title'],
      fallback: 'Search Results',
      callback_id: message._id.toString() + '.' + i,
      actions: buttons(i+1, shortMode, modeName)
    }
  });
  // debugger;
  let actions = [];

  var original = cardTemplate.shopping_home_default(message._id);
  var expandable = yield slackUtils.generateMenuButtons(message)

  if (!shortMode) {
    actions = actions.concat(original);
  }

  results.push({
    fallback: 'Search Results',
    callback_id: 'search_results',
    actions: actions
  })
  yield slackUtils.cacheMenu(message, original, expandable)

  return results;
}

module.exports = results;
