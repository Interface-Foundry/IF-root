var _ = require('lodash');

var actionObj = [
    {
      "name": "AddCart",
      "text": ":thumbsup: Add to Cart",
      "style": "primary",
      "type": "button",
      "value": "yes",
      "confirm": {
        "title": "Are you sure?",
        "text": "This will approve the request.",
        "ok_text": "Yes",
        "dismiss_text": "No"
      }
    }
];


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

module.exports = function*(message) {
    var amazon = JSON.parse(message.amazon);
    var r = amazon[message.focus - 1];

    // todo get the right image
    var img = _.get(r, 'LargeImage[0].URL[0]') || _.get(r, 'ImageSets[0].ImageSet[0].LargeImage[0].URL[0]')


    // make the description text
    var attrs = _.get(r, 'ItemAttributes[0]');
    kip.debug(`FEATURES: ${JSON.stringify(attrs.Feature, null, 2)}`);
    var description = [
      '*' + r.realPrice + '*',
      _.get(attrs, 'Size[0]') ? ' ○ Size: ' + _.get(attrs, 'Size[0]') : false,
      _.get(attrs, 'Artist[0]') ? ' ○ Artist: ' + _.get(attrs, 'Artist[0]') : false,
      _.get(attrs, 'Brand[0]') ? ' ○ ' + _.get(attrs, 'Brand[0]') : false,
      _.get(attrs, 'Manufacturer[0]') ? ' ○ ' + _.get(attrs, 'Manufacturer[0]') : false,
      _.get(attrs, 'Feature[0]') ? ' ○ ' + attrs.Feature.join('\n ○ ') : false
    ].filter(Boolean).join('\n');

    if (_.get(r, 'reviews.rating') && _.get(r, 'reviews.reviewCount')) {
      var review_line = '';
      for (var i = 0; i <= r.reviews.rating|0; i++ ) {
        review_line = review_line + '⭐️';
      }

      review_line += ` ${r.reviews.rating} stars - ${r.reviews.reviewCount} reviews`
      description = description + '\n' + review_line;
    }

  return [{
    text: emojis[message.focus] + ' ' + `<${r.shortened_url}|*${truncate(_.get(r, 'ItemAttributes[0].Title[0]'))}*>`,
    color: '#45a5f4',
    mrkdwn_in: ['text'],
    image_url: img,
    fallback: 'More Information'
  }, {
    color: '#45a5f4',
    text: description,
    mrkdwn_in: ['text', 'pretext'],
    callback_id: 'none',
    fallback: 'focus',
    actions: [{
      "name": "addcart",
      "text": "Add to Cart",
      "style": "primary",
      "type": "button",
      "value": message.focus - 1
    }, {
      "name": "cheaper",
      "text": "Find Cheaper",
      "style": "default",
      "type": "button",
      "value": message.focus - 1
    }, {
      "name": "similar",
      "text": "Find Similar",
      "style": "default",
      "type": "button",
      "value": message.focus - 1
    }, {
      "name": "home_btn",
      "text": "🐧",
      "style": "default",
      "type": "button",
      "value": "home"
    }]
  }]
}