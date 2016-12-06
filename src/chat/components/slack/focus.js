var _ = require('lodash');
var cardTemplate = require('./card_templates');
var slackUtils = require('./utils.js')


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
    var review_line = '';
    if (_.get(r, 'reviews.rating') && _.get(r, 'reviews.reviewCount')) {
      for (var i = 0; i <= r.reviews.rating|0; i++ ) {
        review_line = review_line + '⭐️';
      }
      review_line += ` ${r.reviews.rating} stars - ${r.reviews.reviewCount} reviews`
    }
  var brandManu = '';
  var brand = _.get(attrs, 'Brand[0]') ? _.get(attrs, 'Brand[0]') : false;
  var manufacturer = _.get(attrs, 'Manufacturer[0]') ? _.get(attrs, 'Manufacturer[0]') : false;
  if (brand && manufacturer && brand.toLowerCase() === manufacturer.toLowerCase()) {
    brandManu = ' ○ ' + brand;
  } else if (brand && manufacturer) {
    brandManu = ' ○ ' + brand + '\n ○ ' + manufacturer;
  }
    var description = [
      '*' + r.realPrice + '*',
      review_line,
      _.get(attrs, 'Size[0]') ? ' ○ Size: ' + _.get(attrs, 'Size[0]') : false,
      _.get(attrs, 'Artist[0]') ? ' ○ Artist: ' + _.get(attrs, 'Artist[0]') : false,
      brandManu,
      _.get(attrs, 'Feature[0]') ? ' ○ ' + attrs.Feature.join('\n ○ ') : false
    ].filter(Boolean).join('\n');

  var original = [{
      "name": "addcart",
      "text": "Add to Cart",
      "style": "primary",
      "type": "button",
      "value": message.focus
    }, {
      "name": "cheaper",
      "text": "Find Cheaper",
      "style": "default",
      "type": "button",
      "value": message.focus
    }, {
      "name": "similar",
      "text": "Find Similar",
      "style": "default",
      "type": "button",
      "value": message.focus
    }, {
      "name": "focus.home.expand",
      "text": "🐧",
      "style": "default",
      "type": "button",
      "value": message._id
    }]

  var reply = [{
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
    actions: original
  }];
  let menuButtons = yield slackUtils.generateMenuButtons(message);
  yield slackUtils.cacheMenu(message, cardTemplate.focus_home_default(message), menuButtons, {text: description})

  return reply
}