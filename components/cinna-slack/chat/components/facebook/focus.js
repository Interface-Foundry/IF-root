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

module.exports = function*(message) {
    var amazon = JSON.parse(message.amazon);
    var r = amazon[message.focus - 1];

    // todo get the right image
    var img = _.get(r, 'LargeImage[0].URL[0]') || _.get(r, 'ImageSets[0].ImageSet[0].LargeImage[0].URL[0]')

    // make the description text
    var attrs = _.get(r, 'ItemAttributes[0]');
    var description = [
      _.get(attrs, 'Size[0]') ? ' ○ Size: ' + _.get(attrs, 'Size[0]') : false,
      _.get(attrs, 'Artist[0]') ? ' ○ Artist: ' + _.get(attrs, 'Artist[0]') : false,
      _.get(attrs, 'Brand[0]') ? ' ○ ' + _.get(attrs, 'Brand[0]') : false,
      _.get(attrs, 'Manufacturer[0]') ? ' ○ ' + _.get(attrs, 'Manufacturer[0]') : false,
      _.get(attrs, 'Feature[0]') ? ' ○ ' + attrs.Feature.join(', ') : false
    ].filter(Boolean).join('\n');

    if (_.get(r, 'reviews.rating') && _.get(r, 'reviews.reviewCount')) {
      var review_line = '';
      for (var i = 0; i <= r.reviews.rating|0; i++ ) {
        review_line = review_line + '⭐️';
      }

      review_line += ` ${r.reviews.rating} stars - ${r.reviews.reviewCount} reviews`
      description = description + '\n' + review_line;
      if (description.length > 300) {
        description = description.substring(0, 300);
      } 
    }

    return {
      title: emojis[message.focus] + ' ' + truncate(_.get(r, 'ItemAttributes[0].Title[0]')),
      price: r.realPrice,
      image_url: _.get(r, 'LargeImage[0].URL[0]') || _.get(r, 'ImageSets[0].ImageSet[0].LargeImage[0].URL[0]'),
      title_link: r.shortened_url,
      description: description,
      fallback: 'More Information',
      selected: message.focus
    }
  }