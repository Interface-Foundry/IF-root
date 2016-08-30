var _ = require('lodash');

var buttons = function(num) {
  return [
    {
      "name": "addcart",
      "text": "Add to Cart",
      "style": "primary",
      "type": "button",
      "value": num
    },
    {
      "name": "cheaper",
      "text": "Find Cheaper",
      "style": "default",
      "type": "button",
      "value": num
    },
    {
      "name": "moreinfo",
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
  1: ':one:',
  2: ':two:',
  3: ':three:'
};

//
// Generate the slack reponse for the search results
//
function* results(message) {
  var amazon = JSON.parse(message.amazon)

  var results = amazon.map((r, i) => {
    return {
      title: emojis[i+1] + ' ' + truncate(_.get(r, 'ItemAttributes[0].Title[0]')),
      color: '#45a5f4',
      image_url: r.picstitch_url,
      title_link: r.shortened_url,
      fallback: 'Search Results',
      callback_id: message._id.toString() + '.' + i,
      actions: buttons(i+1)
    }
  });

  results.push({
    fallback: 'Search Results',
    actions: [{
      name: "more",
      text: "See More Results",
      style: "default",
      type: "button",
      value: "more"
    }, {
      name: "home",
      text: "🐧",
      style: "default",
      type: "button",
      value: "home"
    }]
  })

  return results;
}

module.exports = results;
