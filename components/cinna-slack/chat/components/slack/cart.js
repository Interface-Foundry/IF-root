var processData = require('../process');

module.exports = function*(message, slackbot, show_added_item) {
  var cart = message.data;
  // admins have special rights
  var isAdmin = slackbot.meta.office_assistants.indexOf(message.source.user) >= 0;
  var isP2P = slackbot.meta.office_assistants.length === 0;

  // get the latest added item if we need to highlight it
  if (show_added_item) {
    var added_item = cart.items[cart.items.length - 1];
    var added_asin = added_item.ASIN;
  }

  var cartObj = [];

  //add mode sticker
  cartObj.push({
    text: '',
    color: '#45a5f4',
    image_url: 'http://kipthis.com/kip_modes/mode_teamcart_view.png'
  })

  for (var i = 0; i < cart.aggregate_items.length; i++) {
    var item = cart.aggregate_items[i];
    var userString = item.added_by.map(function(u) {
      return '<@' + u + '>';
    }).join(', ');

    if (isAdmin || isP2P) {
      var link = yield processData.getItemLink(item.link, message.source.user, item._id.toString());
      console.log(link);
    }

    var actionObj = [
      {
        "name": "RemoveItem",
        "text": "➖",
        "style": "danger",
        "type": "button",
        "value": "no",
        "confirm": {
          "title": "Are you sure?",
          "text": "This will approve the request.",
          "ok_text": "Yes",
          "dismiss_text": "No"
        }
      },
      {
        "name": "AddItem",
        "text": "➕",
        "style": "primary",
        "type": "button",
        "value": "yes"
      }
    ];

    // add title, which is a link for admins/p2p and text otherwise
    var emojiType = 'slack';
    if (isAdmin || isP2P) {
      var text = [
        `${processData.emoji[i + 1][emojiType]} <${link}|${item.title}>`,
        `*${item.price}* each`,
        `Quantity: ${item.quantity}`,
        `_Added by: ${userString}_`
      ].join('\n');
    } else {
      var text = [
        `${processData.emoji[i + 1][emojiType]} *${item.title}*`,
        `Quantity: ${item.quantity}`,
        `_Added by: ${userString}_`
      ].join('\n');
    }

    cartObj.push({
      text: text,
      mrkdwn_in: ['text', 'pretext'],
      color: item.ASIN === added_asin ? '#7bd3b6' : '#45a5f4',
      thumb_url: item.image
    // actions: actionObj
    })
  }

  // Only show the purchase link in the summary for office admins.
  if (isAdmin || isP2P) {
    var summaryText = `_Summary: Team Cart_
 Total: *${cart.total}*`;
    summaryText += `
 <${cart.link}|» Purchase Items >`;
    cartObj.push({
      text: summaryText,
      mrkdwn_in: ['text', 'pretext'],
      color: '#49d63a'
    })
  } else {
    //var officeAdmins = slackbot.meta.office_assistants.join(' ')

    if (slackbot.meta.office_assistants && slackbot.meta.office_assistants[0]) {
      var officeAdmins = '<@' + slackbot.meta.office_assistants[0] + '>';
    } else {
      var officeAdmins = '';
    }

    cartObj.push({
      text: '_Office admins ' + officeAdmins + ' can checkout the Team Cart_',
      mrkdwn_in: ['text', 'pretext'],
      color: '#49d63a'
    })
  }
  console.log(cartObj)
  return cartObj;
}
