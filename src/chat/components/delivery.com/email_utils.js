var _ = require('lodash')
var rp = require('request-promise')

var menu_utils = require('./menu_utils')
var Menu = require('./Menu')
var mailer_transport = require('../../../mail/IF_mail.js')

var row_length = 2;
var column_length = 4;
var header = '<img src="http://tidepools.co/kip/oregano/cafe.png">';
var br = '<br/>'

var kip_blue = '#47a2fc'
var ryan_grey = '#F5F5F5'

var utils = {};

utils.quickpickHTML = function * (foodSession, slackbot, slacklink, email) {

  var user = yield db.email_users.findOne({email: email, team_id: foodSession.team_id});
  var merch_url = yield menu_utils.getUrl(foodSession, user.id)
  var resto = yield db.merchants.findOne({id: foodSession.chosen_restaurant.id});

  var sortedMenu = menu_utils.sortMenu(foodSession, user, []);
  var quickpicks = sortedMenu.slice(0, 9);

  //header
  var html = '<html><body>';
  html += header + br
  html += `<h1 style="font-size:2em;">${foodSession.chosen_restaurant.name}</h1>`
  html += `<p>${foodSession.convo_initiater.first_name} ${foodSession.convo_initiater.last_name} from ${slackbot.team_name} is collecting food orders from ${foodSession.chosen_restaurant.name}.&#010;Click here to order from the full menu:</p>`
  html += `<p><a style="font-size:130%;color:${kip_blue}" href="` + merch_url + `">Click to View Full Menu`
  html += ' ' + menu_utils.cuisineEmoji(resto.data.summary.cuisines[0]) + '</a></p>'
  html += `<p>Or simply click a menu item below:</p>`

  //quickpicks
  html += '<table style="width:100%;border-spacing:5.5px;" border="0">'

  for (var i = 0 ; i < column_length; i++) {
    html += '<tr>';
    for (var j = 0; j < row_length; j++) {
      var item_url = yield menu_utils.getUrl(foodSession, user.id, [quickpicks[row_length*i+j].id])
      html += `<td style="width:300px;padding:10px;position:absolute;" bgcolor=${ryan_grey}><a style="color:black;text-decoration:none;display:block;width:100%;height:100%" href="` + `${item_url}` + `">`
      html += this.formatItem(i, j, quickpicks) + '</a>' + '</td>';
    }
    html += '</tr>';
  }

  html += '</table>' + br

  //footer
  html += `<p><a style="line-height:115%;font-size:130%;color:${kip_blue};" href="` + merch_url + `">Click to View Full Menu`
  html += ' ' + menu_utils.cuisineEmoji(resto.data.summary.cuisines[0]) + '</a>' + br + br

  html += `<table border="0" style="padding:10px;width:100%;background-color:${kip_blue};"><tr style="width:100%;"><td style="width:100%;"><table style="border-spacing:0 20px;border-radius:4px;width:100%">`
  html += `<tr style="width:100%"><td style="width:100%;text-align:center;"><img height="16" width="16" src="http://tidepools.co/kip/oregano/Slack_Icon.png">`
  html += `<a style="color:white;text-decoration:none;font-size:140%;text-align:center;" href="${slacklink}">&nbsp;Click to join your team on Slack!</a></td></tr></table>`
  html += `<table style="width:100%;"><tr><td style="width:300px;"><p style="padding:0 20px 0 20px;font-size:85%;color:white;text-align:right;">Kip © 2017</p></td>`
  html += `<td style="width:300px;"><a style="padding:0 20px 0 20px;color:white;text-decoration:none;font-size:85%" href="https://kipthis.com/legal.html">Terms of Use</a></td></tr>`
  html += `</table></td></tr></table>` + br

  html += '</body></html>'

  return html;
}

utils.formatItem = function (i, j, quickpicks) {
  return `<table border="0" style="position:absolute;">`
    + `<tr style="position:absolute;top:30px;"><td>` +
  `<table><tr><td style="font-weight:bold;">${quickpicks[row_length*i+j].name}</td></tr>` +
  `<tr><td>${quickpicks[row_length*i+j].description}</td></tr></table></td></tr>` +
  `<tr><td><table><tr><td style="padding:8px 0 8px 0;font-weight:bold;">$${parseFloat(quickpicks[row_length*i+j].price).toFixed(2)}</td></tr>` +
  `<tr><td><div style="display:inline-block;background-color:white;border-radius:8px;border-color:${kip_blue};border-style:solid;border-width:2px;">` +
  `<p style="margin:0.575em 0 0.575em 0;font-weight:bold;color:${kip_blue}">&nbsp;&nbsp;&nbsp;Add to Cart&nbsp;&nbsp;&nbsp;</p></div></td></tr></table>` +
  `</td></tr></table>`;
}

utils.sendEmailUserConfirmations = function * (foodSession, email) {
  console.log('SENDEMAILUSERCONFIRMATION CALLED')
  var mailOptions = {
    to: `<${email}>`,
    from: `Kip Café <hello@kipthis.com>`,
    subject: `Your order for ${foodSession.chosen_restaurant.name} has been submitted!`,
    html: `<html>Speakerboxxx / The Love Below</html>`
  }

  try {
    mailer_transport.sendMail(mailOptions)
  } catch (e) {
    logging.error('error mailing after payment submitted', e)
  }
}

utils.sendConfirmationEmail = function * (foodSession) {

  console.log('pay_utils send confirmation email called')

  var menu = Menu(foodSession.menu)
  var header = '<img src="http://tidepools.co/kip/oregano/cafe.png">'
  var slackbot = yield db.slackbots.findOne({team_id: foodSession.team_id}).exec()
  var date = foodSession.order.order_time;
  console.log('this is the new date format', date);

  var options = {
    uri: 'https://slack.com/api/team.info',
    json: true,
    qs: {
      token: slackbot.bot.bot_access_token
    }
  }

  var team_info = yield rp(options);
  var team_url = team_info.team.domain;

  // var slacklink = 'https://' + team_info.team.domain + '.slack.com'

  // var formatTime = function (date) {
  //   return "^^I am a time^^"
  //   // var minutes = date.getMinutes()
  //   // var hours = date.getHours()
  //   // return (hours > 9 ? '' + hours : '0' + hours) + ':' + (minutes > 9 ? '' + minutes : '0' + minutes)
  // }

  var formatDate = function (date) {
    var year = date.slice(0, 4)
    var month = date.slice(5, 7)
    var day = date.slice(8, 10)
    return month + '/' + day + '/' + year;
  }

  var merchant = yield db.merchants.findOne({id: foodSession.chosen_restaurant.id})
  var phone_number = merchant.data.summary.phone;

  //header

  var html = `<html>${header}` + br;
  html += `<h1 style="font-size:2em;">Order Receipt</h1>`
  html += `<p style="color:black;text-decoration:none;">${foodSession.convo_initiater.first_name} ${foodSession.convo_initiater.last_name} from ${slackbot.team_name} ordered from <a href="${foodSession.chosen_restaurant.url}" style="text-decoration:none;color:${kip_blue}">${foodSession.chosen_restaurant.name}</a>${(phone_number ? ' (' + phone_number + ')' : '')} on ${formatDate(date)}</p>`
  html += `\nHere is a list of items:\n`

  //column headings
  html += `<table border="0" style="margin-top:4px;width:600px;border-spacing:5.5px;"><thead style="color:white;background-color:${kip_blue}"><tr><th>Menu Item</th>`
  html += `<th>Item Options</th>`
  html += `<th>Price</th>`
  html += `<th>Recipient</th></tr></thead>`

  //items ordered
  foodSession.cart.filter(i => i.added_to_cart).map((item) => {
    var foodInfo = menu.getItemById(String(item.item.item_id))
    var descriptionString = _.keys(item.item.option_qty).map((opt) => menu.getItemById(String(opt)).name).join(', ')
    var user = foodSession.team_members.filter(j => j.id === item.user_id)
    var td_style = 'style="background-color:' + ryan_grey + ';padding:8px;"'

    var price_expansion = ( item.item.item_qty > 1 ? `<p style="text-align:center;">$${(menu.getCartItemPrice(item).toFixed(2) / item.item.item_qty).toFixed(2)} (x${item.item.item_qty})</p><hr>` : '')

    html += `<tr><td ${td_style};"><b>${foodInfo.name}</b></td>`
    html += `<td ${td_style}"><p>${descriptionString}</p>`
    html += `${(item.item.instructions ? '<p><i>' + item.item.instructions + '</i></p>': '')}</td>`
    html += `<td ${td_style}>` + price_expansion + `<p style="text-align:center;"><b>$${menu.getCartItemPrice(item).toFixed(2)}</b></p></td>`
    // console.log('USER', user)
    if (user[0].first_name && user[0].last_name) html += `<td ${td_style}"><p>${user[0].first_name} ${user[0].last_name}</p>`
    else html += `<td ${td_style}>`
    html += `<p>@${user[0].name}</p></td></tr>`
    // html += `<p><a href="https://${team_url}.slack.com/messages/@${user[0]}" style="text-decoration:none;color:${kip_blue}">@${user[0].name}</a></p></td></tr>`
  })

  html += `</thead></table>` + br + br

  //itemized charges

  var line_item_style = `padding:0 0 0 8px;margin:2px;`

  html += `<table border="0"><tr><td style="width:300px;">`

  html += `<div style="border-left:4px solid ${kip_blue};">`
  html += `<p style="${line_item_style}">Cart Subtotal: ${foodSession.order.subtotal.$}</p>`
  html += `<p style="${line_item_style}">Tax: ${foodSession.order.tax.$}</p>`
  html += `<p style="${line_item_style}">Delivery Fee: ${foodSession.order.delivery_fee.$}</p>`
  html += `<p style="${line_item_style}">Service Fee: ${foodSession.service_fee.$}</p>`
  if (foodSession.discount_amount) html += `🎉 Kip Coupon: -${foodSession.discount_amount.$}`
  html += `<p style="${line_item_style}">Tip: ${(foodSession.tip.percent === 'cash') ? '$0.00 (Will tip in cash)' : foodSession.tip.amount.$}</p>`
  html += `<p style="${line_item_style}"><b>Order Total: ${foodSession.calculated_amount.$}</b></p></div>`

  //misc Information
  html += `</td style="width=300px;"><td>`
  html += `<p style="${line_item_style}"><b>Delivery Address:</b></p><br/><p style="${line_item_style}">${foodSession.chosen_location.address_1}</p>`
  if (foodSession.chosen_location.address_2) html += `<p style="${line_item_style}">${foodSession.chosen_location.address_2}</p>`
  html += `<p style="${line_item_style}">${foodSession.chosen_location.city}, ${foodSession.chosen_location.state} </p>`
  html += `<p style="${line_item_style}">${foodSession.chosen_location.zip_code}</p>` + br
  if (foodSession.instructions) html += `<p style="${line_item_style}"><i>${foodSession.instructions}</i></p>`
  html += `</td></tr></table>`

  //footer
  html += `<p style="text-decoration:none;color:grey;"><img height="14" width="14" alt="delivery.com" src="http://tidepools.co/kip/dcom_footer.png"> Powered by delivery.<span>com</p>` + br

  order_users = '@' + foodSession.all_members.map(function (member) {
    return member.name
  }).join(',')

  html += `<table border="0" style="padding:10px;width:100%;background-color:${kip_blue};"><tr style="width:100%;"><td style="width:100%;"><table style="border-spacing:0 20px;border-radius:4px;width:100%">`
  html += `<tr style="width:100%"><td><div style="position:absolute;width:100%;height:100%;text-align:center;"><img style="position:relative;down:10px;" height="28" width="28" src="http://tidepools.co/kip/head_squared.png">`
  html += `<b style="color:white;text-decoration:none;font-weight:normal;font-size:160%;text-align:center;">&nbsp; Enjoy your food!</b></div></td></tr></table>`
  // html += `<a href="https://${team_url}.slack.com/messages/${order_users}/" style="color:white;text-decoration:none;font-size:140%;text-align:center;">&nbsp;Click to chat with your food crew!</a></td></tr></table>`
  html += `<table style="width:100%;"><tr><td style="width:300px;"><p style="padding:0 20px 0 20px;font-size:85%;color:white;text-align:right;">Kip © 2017</p></td>`
  html += `<td style="width:300px;"><a style="padding:0 20px 0 20px;color:white;text-decoration:none;font-size:85%" href="https://kipthis.com/legal.html">Terms of Use</a></td></tr>`
  html += `</table></td></tr></table>` + br

  // send confirmation email to admin
  var mailOptions = {
    to: `${foodSession.convo_initiater.name} <${foodSession.convo_initiater.email}>`,
    from: `Kip Café <hello@kipthis.com>`,
    subject: `Your Order Receipt for ${foodSession.chosen_restaurant.name}`,
    html: `${html}</html>`
  }

  logging.info('mailOptions', mailOptions)

  try {
    mailer_transport.sendMail(mailOptions)
  } catch (e) {
    logging.error('error mailing after payment submitted', e)
  }
}

module.exports = utils;
