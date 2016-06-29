var _ = require('lodash');

function truncate(string) {
   if (string.length > 80)
      return string.substring(0,80)+'...';
   else
      return string;
};

var emojis = require('../emojis')('html');


module.exports = function(message) {
  var cart = message.data;
  var html = [];

  html.push(`<div><img src="http://kipthis.com/kip_modes/mode_teamcart_view.png"></div>`);
  html.push('<ul>');
  cart.aggregate_items.map((item, i) => {
    html.push(`<li><div><a class="item_title" target="_blank" href="${item.link}">${emojis(i+1)} ${item.title}</a></div>`)
    html.push(`<div><img src="${item.image}"></div>`);
    html.push(`<div>Quantity: ${item.quantity}</div></li>`)
  })

  html.push('</ul>');
  html.push(`<div>Total: ${cart.total}</div>`);
  html.push(`<div><a class="item_title" href="${cart.link}" target="_blank">» Purchase Items</a></div>`);

  return html.join('\n');
}
