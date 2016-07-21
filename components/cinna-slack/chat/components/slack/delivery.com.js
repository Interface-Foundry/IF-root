var emojis = require('../emojis')('slack');
var _ = require('lodash');

var delivery = module.exports = {com: {}}



delivery.com.results = function *(message) {
  var att = [{
    text: `_yummy things near ${message.data.params.addr}_`,
    mrkdwn_in: ['text', 'pretext'],
    color: '#45a5f4'
  }];

  att = att.concat(message.data.results.map((r, i) => {
    var stars = [':star:', ':star:', ':star:', ':star:', ':star:'].slice(0, Math.round(r.summary.star_ratings)).join('');
    var dollars = '$$$$$'.substr(0, r.summary.price_rating);
    return {
      title: `${emojis(i+1)} ${r.summary.name}`,
      text: `${r.summary.description || r.summary.cuisines.join(', ')}\n*${dollars}* ${stars} (${r.summary.num_ratings} ratings)`,
      color: '#45a5f4',
      image_url: r.summary.merchant_logo,
      title_link: r.summary.url.complete,
      fallback: 'Search Results',
      mrkdwn_in: ['text']
    }
  }))

  console.log(att);
  return att;
}

delivery.com.menu = function*(message) {
  debugger;
  var recommended = Object.keys(message.data.merchant.summary.recommended_items).map(k => {
    var i = message.data.merchant.summary.recommended_items[k];
    return `${i.name} ($${i.price})`;
  }).join('\n');
  var att = [{
    text: `_Popular Items_\n${recommended}`,
    mrkdwn_in: ['text'],
    color: '#45a5f4'
  }];

  // att = att.concat(message.data.menu.map(m => {
  //   return m.
  // }))

  att.push({
    text: `Type the name of the thing you are hungry for and I'll show you your options.  Type "full menu" to see the full menu.`,
    color: '#45a5f4'
  })

  console.log(att);
  return att;
}

delivery.com.fullMenu = function*(message) {
  return _.flatten(message.data.menu.map(i => {
    if (generators[i.type]) {
      kip.debug('handling', i.type, i.id);
      return generators[i.type](i);
    } else {
      console.error(i);
      kip.err('no menu item generator for item ' + i.id);
    }
  }))
}


//
// generate content for individual pieces of the menu
//
var generators = {};

generators.menu = function(i) {
  console.log(i);

  // some menus have a top level menu and then nested menus underneath
  if (i.children && i.children.length > 0 && i.children[0].type === 'menu') {
    return i.children.map(c => generators.menu(c));
  }

  var text = `*${i.name}*`;
  if (i.description) {
    text += '\n' + i.description;
  }

  var itemList = i.children.map(c => {
    return `${c.name} - $${c.price.toFixed(2)}`
  });

  text += '\n' + itemList.join('\n');

  return {
    text: text, 
    mrkdwn_in: ['text'],
    color: '#45a5f4'
  }
}