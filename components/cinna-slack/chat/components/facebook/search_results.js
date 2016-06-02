var _ = require('lodash');


function truncate(string) {
   if (string.length > 80)
      return string.substring(0,80)+'...';
   else
      return string;
};

var emojis = {
  1: '1. ',
  2: '2. ',
  3: '3. '
};

//
// Generate facebook reponse for the search results
//
function* results(message) {
  var amazon = JSON.parse(message.amazon);
  console.log(amazon);

  var results = amazon.map((r, i) => {
    return {
      title: emojis[i] + ' ' + truncate(_.get(r, 'ItemAttributes[0].Title[0]')),
      image_url: r.picstitch_url,
      title_link: r.shortened_url,
      fallback: 'Search Results'
    }
  });

  return results;
}

module.exports = results;