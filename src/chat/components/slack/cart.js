var processData = require('../process');

module.exports = function*(message, slackbot, highlight_added_item) {
  var cart = message.data;
  // admins have special rights
  var isAdmin = slackbot.meta.office_assistants.includes(message.source.user) || slackbot.meta.office_assistants.length === 0;

  // get the latest added item if we need to highlight it
  if (highlight_added_item && cart.items.length>0) {
    var added_item = cart.items[cart.items.length - 1];
    var added_asin = added_item.ASIN;
  }

  // all the messages which compose the cart
  var cartObj = [{
    text: cart.aggregate_items.length > 0 ? 'Here\'s everything you have in your cart': 'It looks like your cart is empty!',
    color: '#45a5f4',
    image_url: 'http://kipthis.com/kip_modes/mode_teamcart_view.png',
    callback_id: 'press me',
    actions: [{
        'name': 'passthrough',
        'text': 'Home',
        'type': 'button',
        'value': 'home'
      }]
  }];
  if (isAdmin) {
    cartObj[0].actions.push({
      'name': 'bundles.home',
      'text': '+ Add Bundles',
      'type': 'button',
      'value': 'home'
    });
    if (cart.aggregate_items.length > 0)
      cartObj[0].actions.push({
        'name': 'emptycartwarn',
        'text': 'Empty Cart',
        'type': 'button',
        'value': 'emptycartwarn'
      });
  }
  for (var i = 0; i < cart.aggregate_items.length; i++) {
    var item = cart.aggregate_items[i];
    var addedByUser = item.added_by.includes(message.source.user);
    if (item.quantity < 1) {
      return;
    }
    // the slack message for just this item in the cart list
    var item_message = {
      mrkdwn_in: ['text', 'pretext'],
      color: item.ASIN === added_asin ? '#7bd3b6' : '#45a5f4',
      thumb_url: item.image
    }

    // multiple people could have added an item to the cart, so construct a string appropriately
    var userString = item.added_by.map(function(u) {
      return '<@' + u + '>';
    }).join(', ');

    // only allow links for admins
    let link;
    if (isAdmin || addedByUser) {
      link = yield processData.getItemLink(item.link, message.source.user, item._id.toString());
    }
    // make the text for this item's message
    item_message.text = [
      ((isAdmin || addedByUser) ? `<${link}|${item.title}>` : item.title),
      ((isAdmin) ? `*Price:* ${item.price} each`: ''),
      `*Added by:* ${userString}`,
      `*Quantity:* ${item.quantity}`,

    ].filter(Boolean).join('\n');

    // add the item actions if needed
    let buttons = [];
    if (isAdmin || addedByUser) {
      item_message.callback_id = item._id.toString();
      buttons = [{
        "name": "additem",
        "text": "+",
        "style": "default",
        "type": "button",
        "value": "add"
      }, {
        "name": item.quantity > 1 ? "removeitem" : 'removewarn',
        "text": "—",
        "style": "default",
        "type": "button",
        "value": "remove"
      }];

      if (item.quantity > 1 && isAdmin) {
        buttons.push({
          name: "removewarn",
          text: 'Remove All',
          style: 'default',
          type: 'button',
          value: 'removeall'
        })
      }
      item_message.actions = buttons;
    } else if (!addedByUser){
      item_message.callback_id = item._id.toString();
      buttons = [{
        "name": "additem",
        "text": "+ Add",
        "style": "default",
        "type": "button",
        "value": "add"
      }];
      item_message.actions = buttons;
    }

    cartObj.push(item_message)
  }

  // Only show the purchase link in the summary for office admins.
  if (isAdmin) {
    var summaryText = `*Total:* ${cart.total}`;
    summaryText += `\n<${cart.link}|*➤ Click Here to Checkout*>`;
    if (cart.aggregate_items.length > 0) {
      cartObj.push({
        text: summaryText,
        mrkdwn_in: ['text', 'pretext'],
        color: '#49d63a'
      })
    }
  } else {
    //var officeAdmins = slackbot.meta.office_assistants.join(' ')
    let officeAdmins;
    if (slackbot.meta.office_assistants && slackbot.meta.office_assistants[0]) {
      officeAdmins = '<@' + slackbot.meta.office_assistants[0] + '>';
    } else {
      officeAdmins = '';
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