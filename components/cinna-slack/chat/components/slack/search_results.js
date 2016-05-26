var _ = require('lodash');

var buttons = function(num) {
  return [
    {
      "name": "addcart",
      "text": "⭐ add to cart",
      "style": "primary",
      "type": "button",
      "value": num
      // "confirm": {
      //   "title": "Are you sure?",
      //   "text": "This will approve the request.",
      //   "ok_text": "Yes",
      //   "dismiss_text": "No"
      // }
    },
    {
      "name": "cheaper",
      "text": "💎 cheaper",
      "style": "default",
      "type": "button",
      "value": num
    },
    {
      "name": "similar",
      "text": "⚡ similar",
      "style": "default",
      "type": "button",
      "value": num
    },
    {
      "name": "modify",
      "text": "🌀 modify",
      "style": "default",
      "type": "button",
      "value": num
    },
    {
      "name": "moreinfo",
      "text": "💬 info",
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
  1: ':one:',
  2: ':two:',
  3: ':three:'
};

//
// Generate the slack reponse for the search results
//
function* results(message) {
  var amazon = JSON.parse(message.amazon || {});
  console.log(amazon);

  var results = amazon.map((r, i) => {
    return {
      title: emojis[i] + ' ' + truncate(_.get(r, 'ItemAttributes[0].Title[0]')),
      color: '#45a5f4',
      image_url: r.picstitch_url,
      title_link: r.shortened_url,
    }
  });

  return results;
}

module.exports = results;
