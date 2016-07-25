var _ = require('lodash');

function truncate(string) {
   if (string.length > 80)
      return string.substring(0,80)+'...';
   else
      return string;
};

var emojis = require('../emojis')('html');

module.exports = function(message) {
    try {
      var amazon = JSON.parse(message.amazon);
    } catch (e) {
      console.error('could not parse amazon object:', message.amazon);
      return;
    }
    var r = amazon[message.focus - 1];

    // todo get the right image
    var img = _.get(r, 'LargeImage[0].URL[0]') || _.get(r, 'ImageSets[0].ImageSet[0].LargeImage[0].URL[0]')


    // make the description text
    var attrs = _.get(r, 'ItemAttributes[0]');
    var description = [
      '*' + r.realPrice + '*',
      _.get(attrs, 'Size[0]') ? ' * Size: ' + _.get(attrs, 'Size[0]') : false,
      _.get(attrs, 'Artist[0]') ? ' * Artist: ' + _.get(attrs, 'Artist[0]') : false,
      _.get(attrs, 'Brand[0]') ? ' * Brand: ' + _.get(attrs, 'Brand[0]') : false,
      _.get(attrs, 'Manufacturer[0]') ? ' * Manufacturer: ' + _.get(attrs, 'Manufacturer[0]') : false,
      _.get(attrs, 'Feature[0]') ? ' * ' + attrs.Feature.join(', ') : false
    ].filter(Boolean).join('\n');

    if (_.get(r, 'reviews.rating') && _.get(r, 'reviews.reviewCount')) {
      var review_line = '';
      for (var i = 0; i <= r.reviews.rating|0; i++ ) {
        review_line = review_line + '⭐️';
      }

      review_line += ` ${r.reviews.rating} stars - ${r.reviews.reviewCount} reviews`
      description = description + '\n' + review_line;
    }

    return `<h4><a href="${r.shortened_url}">${emojis(message.focus)} ${truncate(_.get(r, 'ItemAttributes[0].Title[0]'))}</a></h4><img src="${img}"> ${description}`;
}
