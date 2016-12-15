var processData = require('../process');

module.exports = function*(message, slackbot, highlight_added_item) {
  var cart = message.data;
  // admins have special rights
  var isAdmin = slackbot.meta.office_assistants.indexOf(message.source.user) >= 0;
  var isP2P = slackbot.meta.p2p;
  var show_everything = isAdmin || isP2P;
  

  // get the latest added item if we need to highlight it
  if (highlight_added_item) {
    var added_item = cart.items[cart.items.length - 1];
    var added_asin = added_item.ASIN;
  }

  // all the messages which compose the cart
  var cartObj = [];

  //add mode sticker
  cartObj.push({
    text: 'Here\'s everything you have in your cart',
    color: '#45a5f4',
    image_url: 'http://kipthis.com/kip_modes/mode_teamcart_view.png'
  })
  for (var i = 0; i < cart.aggregate_items.length; i++) {
    var item = cart.aggregate_items[i];
    var addedByUser = item.added_by.includes(message.source.user);
    if(item.quantity<1){
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

    // only allow links for admins/p2p
    if (show_everything || addedByUser) {
      var link = yield processData.getItemLink(item.link, message.source.user, item._id.toString());
    }

    // make the text for this item's message

    item_message.text = [
      `*${i + 1}.* ` + ((show_everything || addedByUser) ? `<${link}|${item.title}>` : item.title),
      ((show_everything) ? `*Price:* ${item.price} each`: ''),
      `*Added by:* ${userString}`,
      `*Quantity:* ${item.quantity}`,

    ].filter(Boolean).join('\n');

    // add the item actions if needed
    if (show_everything || addedByUser) {
      item_message.callback_id = item._id.toString();
      var buttons = [{
        "name": "additem",
        "text": "+",
        "style": "default",
        "type": "button",
        "value": "add"
      }, {
        "name": "removeitem",
        "text": "—",
        "style": "default",
        "type": "button",
        "value": "remove"
      }];

      if (item.quantity > 1 && show_everything) {
        buttons.push({
          name: "removeall",
          text: 'Remove All',
          style: 'default',
          type: 'button',
          value: 'removeall'
        })
      }
      item_message.actions = buttons;
    } else if (!addedByUser){
      item_message.callback_id = item._id.toString();
      var buttons = [{
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
  if (show_everything) {
    var summaryText = `*Team Cart Summary*
 *Total:* ${cart.total}`;
    summaryText += `
 <${cart.link}|*➤ Click Here to Checkout*>`;
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