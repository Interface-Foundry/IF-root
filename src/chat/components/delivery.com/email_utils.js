var menu_utils = require('./menu_utils')

var row_length = 2;
var column_length = 4;
var header = '<img src="http://tidepools.co/kip/oregano/cafe.png">';
var br = '<br/>'

var kip_blue = '#47a2fc'
var ryan_grey = "#F5F5F5"

var utils = {};

utils.quickpickHTML = function * (foodSession, slacklink, email) {

  var user = yield db.email_users.findOne({email: email, team_id: foodSession.team_id});
  var merch_url = yield menu_utils.getUrl(foodSession, user.id)
  var resto = yield db.merchants.findOne({id: foodSession.chosen_restaurant.id});

  var sortedMenu = menu_utils.sortMenu(foodSession, user, []);
  var quickpicks = sortedMenu.slice(0, 9);

  //header
  var html = '<html><body>';
  html += header + br
  html += `<h1 style="font-size:2em;">${foodSession.chosen_restaurant.name}</h1>` + br
  html += `<p><a style="color:${kip_blue}" href="' + merch_url + '">Click to View Full Menu `
  html += menu_utils.cuisineEmoji(resto.data.summary.cuisines[0])
  html += '</a></p>'

  //quickpicks
  html += '<table style="width:100%" border="0">'

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
  html += `<p><a style="color:${kip_blue};" href="' + merch_url + '">Click to View Full Menu `
  html += menu_utils.cuisineEmoji(resto.data.summary.cuisines[0]) + '</a>' + br + br

  html += `<table border="0" style="padding:10px;width:600px;background-color:${kip_blue};">`
  html += `<tr></tr>`
  html += `<tr></tr>`
  html += `</table>` + br

  html += `<a style="color:${kip_blue};text-decoration:none;" href="${slacklink}">Join your team on Slack!</a>` + br + br
  html += `<a style="color:${kip_blue};text-decoration:none;" href="https://kipthis.com/legal.html">Terms of Service</a>`
  html += '</body></html>'

  return html;
}

utils.formatItem = function (i, j, quickpicks) {
  return `<table border="0" style="position:absolute;"><tr style="position:absolute;top:30px;"><td>` +
  `<table><tr><td style="font-weight:bold;">${quickpicks[row_length*i+j].name}</td></tr>` +
  `<tr><td>${quickpicks[row_length*i+j].description}</td></tr></table></td></tr>` +
  `<tr><td><table><tr><td style="padding:8px 0 8px 0;font-weight:bold;">$${parseFloat(quickpicks[row_length*i+j].price).toFixed(2)}</td></tr>` +
  `<tr><td><div style="display:inline-block;background-color:white;border-radius:8px;border-color:${kip_blue};border-style:solid;border-width:2px;">` +
  `<p style="font-weight:bold;color:${kip_blue}">&nbsp;&nbsp;&nbsp;Add to Cart&nbsp;&nbsp;&nbsp;</p></div></td></tr></table>` +
  `</td></tr></table>`;
}

module.exports = utils;
