var _ = require('lodash');

var buttons = function(num, modeIsOnboard) {
  return modeIsOnboard ? [{
      "name":  'onboard_shopping.addcart',
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
function * results(message, modeIsOnboard = false) {

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
      actions: buttons(i+1, modeIsOnboard)
    }
  });
  // debugger;
  let actions = [];
  if (!modeIsOnboard) {
    actions.push({
      name: 'more',
      text: "See More Results",
      style: "default",
      type: "button",
      value: "more"
    });

    actions.push({
      name: "home_btn",
      text: "🐧",
      style: "default",
      type: "button",
      value: "home"
    });
  }
  results.push({
    fallback: 'Search Results',
    callback_id: 'search_results',
    actions: actions
  })
  return results;
}

module.exports = results;
