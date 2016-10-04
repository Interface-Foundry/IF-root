var _ = require('lodash');


function truncate(string) {
   if (string.length > 100)
      return string.substring(0,100)+'...';
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
  //console.log(amazon);

  var results = amazon.map((r, i) => {


      // console.log('emojis[i+1]/ / / /  ',emojis[i+1])
      // console.log('emojis[i+2]/ / / /  ',emojis[i+1] + truncate(_.get(r, 'ItemAttributes[0].Title[0]')))
       // make the description text
      var attrs = _.get(r, 'ItemAttributes[0]');
      var description = [
        _.get(attrs, 'Size[0]') ? ' ○ Size: ' + _.get(attrs, 'Size[0]') : '',
        _.get(attrs, 'Artist[0]') ? ' ○ Artist: ' + _.get(attrs, 'Artist[0]') : '',
        _.get(attrs, 'Brand[0]') ? ' ○ ' + _.get(attrs, 'Brand[0]') : false,
        _.get(attrs, 'Manufacturer[0]') ? ' ○ ' + _.get(attrs, 'Manufacturer[0]') :  (_.get(attrs, 'Publisher[0]') ? ' ○ ' + _.get(attrs, 'Publisher[0]') : ''),
        _.get(attrs, 'Feature[0]') ? ' ○ ' + attrs.Feature.join(', ') : ''
      ].filter(Boolean).join('\n');

      if (_.get(r, 'reviews.rating') && _.get(r, 'reviews.reviewCount')) {
        var review_line = '';
        for (var i = 0; i <= r.reviews.rating|0; i++ ) {
          review_line = review_line + '⭐️';
        }
        review_line += ` ${r.reviews.rating} stars - ${r.reviews.reviewCount} reviews`
        var final_description = (description.length > 200) ? (description.substring(0, 150) + '...') : description;
      }
      var image = r.picstitch_url ? r.picstitch_url : ((_.get(r, 'SmallImage[0].URL[0]') ? _.get(r, 'SmallImage[0].URL[0]') :  (_.get(r, 'MediumImage[0].URL[0]') ? _.get(r, 'MediumImage[0].URL[0]') :  'http://kipthis.com/images/header_partners.png')))


      // console.log('\nimage: ', image,'\n');

      return {
        title: truncate(_.get(r, 'ItemAttributes[0].Title[0]')),
        image_url: image,
        title_link: r.shortened_url,
        fallback: 'Search Results',
        description: final_description
      }
  });

  return results;
}

module.exports = results;

 // var amazon = JSON.parse(message.amazon);
 //    var r = amazon[message.focus - 1];
 //    // console.log('\n\n\nr: ', r,'\n\n\n');
 //    // todo get the right image
 //    var img = _.get(r, 'LargeImage[0].URL[0]') || _.get(r, 'ImageSets[0].ImageSet[0].LargeImage[0].URL[0]')

 //    // make the description text
 //    var attrs = _.get(r, 'ItemAttributes[0]');
 //    var description = [
 //      _.get(attrs, 'Size[0]') ? ' ○ Size: ' + _.get(attrs, 'Size[0]') : '',
 //      _.get(attrs, 'Artist[0]') ? ' ○ Artist: ' + _.get(attrs, 'Artist[0]') : '',
 //      _.get(attrs, 'Brand[0]') ? ' ○ ' + _.get(attrs, 'Brand[0]') : false,
 //      _.get(attrs, 'Manufacturer[0]') ? ' ○ ' + _.get(attrs, 'Manufacturer[0]') :  (_.get(attrs, 'Publisher[0]') ? ' ○ ' + _.get(attrs, 'Publisher[0]') : ''),
 //      _.get(attrs, 'Feature[0]') ? ' ○ ' + attrs.Feature.join(', ') : ''
 //    ].filter(Boolean).join('\n');

 //    if (_.get(r, 'reviews.rating') && _.get(r, 'reviews.reviewCount')) {
 //      var review_line = '';
 //      for (var i = 0; i <= r.reviews.rating|0; i++ ) {
 //        review_line = review_line + '⭐️';
 //      }

 //      review_line += ` ${r.reviews.rating} stars - ${r.reviews.reviewCount} reviews`
 //      var final_description = (description.length > 200) ? (description.substring(0, 150) + '...') : description;