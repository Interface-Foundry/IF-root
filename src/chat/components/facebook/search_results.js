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

  var image;

  

  var results = amazon.map((r, i) => {
    try {
    image = r.picstitch_url ? r.picstitch_url : (_.get(r, 'LargeImage[0].URL[0]') ? _.get(r, 'LargeImage[0].URL[0]') : (_.get(r, 'MediumImage[0].URL[0]') ? _.get(r, 'MediumImage[0].URL[0]') : 'http://kipthis.com/images/header_partners.png' )) 
  } catch(err) {
    image = 'http://kipthis.com/images/header_partners.png'
  } 

    return {
      title: emojis[i+1] + ' ' + truncate(_.get(r, 'ItemAttributes[0].Title[0]')),
      image_url: image,
      title_link: r.shortened_url,
      fallback: 'Search Results'
    }
  });

  return results;
}

module.exports = results;