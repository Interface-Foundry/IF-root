// when an amazon item requires a specified variation,
// generates the view to show it
const _ = require('lodash'),
  slackUtils = require('./utils.js'),
  amazonSearch = require('../amazon_search'),
  request = require('request');
const handlers = [];

module.exports = function*(message) {
  let action, data = null;
  if (!message.data) {
    action = 'reply'
  } else {
    data = _.split(message.data.value, '.');
    action = data[0];
    data.splice(0, 1);
  }
  kip.debug('\n\n\n🤖 action : ', action, 'data: ', data, ' 🤖\n\n\n');
  return yield handlers[action](message, data);
}

function truncate(string) {
  if (string.length > 80)
    return string.substring(0, 80) + '...';
  else
    return string;
}

function createButton(name, key, itemId) {
  return {
    name: `variation.select.${itemId}.${key}.${name}`,
    value: `select.${itemId}.${key}.${name}`,
    text: '○ ' + _.startCase(name), //or ◉
    type: 'button',
  }
}

handlers['reply'] = function * (message) {
  let amazon = JSON.parse(message.amazon);
  let itemInfo = (yield amazonSearch.lookup({
    ASIN: amazon.asin
  }, message.origin))[0];
  let img = _.get(itemInfo, 'LargeImage[0].URL[0]') || _.get(itemInfo, 'ImageSets[0].ImageSet[0].LargeImage[0].URL[0]')
  let item = yield (new db.Item({
    ASIN: amazon.asin,
    title: _.get(itemInfo, 'ItemAttributes[0].Title[0]'),
    link: itemInfo.shortened_url,
    image: img,
    price: itemInfo.realPrice,
    rating: _.get(itemInfo, 'reviews.rating'),
    review_count: _.get(itemInfo, 'reviews.reviewCount'),
    source_json: JSON.stringify(itemInfo),
    asins: JSON.stringify(amazon.asins),
    config: JSON.stringify({})
  })).save();

  let attachments = [{
    text: 'Here\'s what I found' // COPY!!!
  }, {
    text: `<${itemInfo.shortened_url}|*${truncate(_.get(itemInfo, 'ItemAttributes[0].Title[0]'))}*>`,
    image_url: img,
    mrkdwn_in: ['text']
  }];

  _.forOwn(amazon.variations, (val, key) => {
    let buttons = val.map(name => createButton(name, key, item._id));
    let chunkedButtons = _.chunk(buttons, 4);
    attachments.push({
      text: _.startCase(key).replace(' Name', '') + ':',
      actions: chunkedButtons[0],
      callback_id: 'none',
      color: '#45a5f4'
    });
    chunkedButtons.forEach((ele, i) => {
      if (i != 0) {
        attachments.push({
          text: '',
          actions: ele,
          callback_id: 'none',
          color: '#45a5f4'
        });
      }
    })
  })

  attachments.push({
    text: '',
    callback_id: 'ehhhhhh',
    actions: [{
      name: `variation.addcart.${item._id}`,
      value: `addcart.${item._id}`,
      text: 'Add to Cart',
      style: 'primary',
      type: 'button',
    }, {
      'name': 'settings.back',
      'text': 'Home',
      'style': 'default',
      'type': 'button'
    }]
  })
  return attachments;
}

handlers['addcart'] = function*(message, data) {
  let origAttachments = message.source.original_message.attachments;
  let item = yield db.items.findOne({
    '_id': data[0]
  }).exec();
  try {
    let asins = JSON.parse(item.asins),
      config = JSON.parse(item.config);
    let numOptions = _.size(asins[0]) - 1;
    if (_.size(config) != numOptions) {
      if (!origAttachments[origAttachments.length - 1].text) {
        origAttachments.push({
          text: 'Hmm, it looks like you haven\'t selected all of the required options',
          callback_id: 'none',
          color: '#FF0000'
        });
      }
      request({
        method: 'POST',
        uri: message.source.response_url,
        body: JSON.stringify({
          attachments: origAttachments
        })
      })
    } else {
      let matches = asins.filter(item => {
        let flag = true;
        _.forOwn(config, (val, key) => {
          flag = flag && item[key] === val;
        })
        return flag;
      })
      if (matches.length > 0) { // there really should only be one match but whatevs
        // add it to the cart!
        yield slackUtils.addViaAsin(matches[0].id, message);
        message.text = 'view cart'
        return message
      } else {
        // I don't think you can buy this combination
        // we should probably be updating available combinations based on what people select
        if (origAttachments[origAttachments.length - 1].text) {
          origAttachments[origAttachments.length - 1].text = 'Hmm, that version doesn\'t seem to be available. Try a different one?';
        } else {
          origAttachments.push({
            text: 'Hmm, that version doesn\'t seem to be available. Try a different one?',
            callback_id: 'none',
            color: '#FF0000'
          });
        }
        request({
          method: 'POST',
          uri: message.source.response_url,
          body: JSON.stringify({
            attachments: origAttachments
          })
        });
      }
    }
  } catch (err) {
    kip.debug('JSON err probably, trying with the main ASIN');
    kip.debug(`item is ${JSON.stringify(item, null, 2)}`);
    yield slackUtils.addViaAsin(item.ASIN, message);
    message.text = 'view cart';
    return message;
  }
};

handlers['select'] = function*(message, data) {
  let itemId = data[0],
    key = data[1],
    name = data[2];
  let origMessage = message.source.original_message;
  let attachments = origMessage.attachments.map(attachment => {
    if (attachment.actions) {
      let actions = attachment.actions.map(button => {
        if (button.value === `select.${itemId}.${key}.${name}`) {
          button.text = button.text.replace('○', '◉');
        } else if (button.value.includes(key)) {
          button.text = button.text.replace('◉', '○');
        }
        return button;
      })
      attachment.actions = actions;
    }
    return attachment;
  });
  // update the view with new option selected
  request({
    method: 'POST',
    uri: message.source.response_url,
    body: JSON.stringify({
      text: '',
      attachments: attachments
    })
  })

  // update the database
  let item = yield db.items.findOne({
    '_id': itemId
  }).exec();
  let itemConfig = JSON.parse(item.config);
  itemConfig[key] = name;
  yield db.items.update({
    _id: itemId
  }, {
    $set: {
      config: JSON.stringify(itemConfig)
    }
  }).exec();
}