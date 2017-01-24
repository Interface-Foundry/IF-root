var shopping_home_default = module.exports.shopping_home_default = function(id) {
  return [{
    name: "more",
    text: "More >",
    style: "default",
    type: "button",
    value: "more"
  }, {
    'name': 'passthrough',
    'text': 'Home',
    'type': 'button',
    'value': 'home'
  }]
}

var home_screen = module.exports.home_screen = function(isAdmin, userId) {
  let buttonDescrip = isAdmin ? 'Collect' : 'Get';
  return {
    text: require('./utils').randomWelcome(userId),
    attachments: [{
      'mrkdwn_in': ['text'],
      text: '*Kip Café*\n' + require('./utils').randomCafeDescrip(),
      color: '#f43440',
      callback_id: 'wow such home',
      actions: [{
        name: 'passthrough',
        value: 'food',
        text: `${buttonDescrip} Food`,
        type: 'button'
      }]
    }, {
      text: '*Kip Store*\n'+ require('./utils').randomStoreDescrip(),
      'mrkdwn_in': ['text'],
      color: '#fe9b00',
      callback_id: 'wow such home',
      actions: [{
        name: isAdmin ? 'collect.initial' : 'passthrough',
        value: isAdmin ? 'initial' : 'shopping',
        text: `${buttonDescrip} Supplies`,
        type: 'button'
      }, {
        name: 'view_cart_btn',
        text: '⁂ View Cart',
        style: 'default',
        type: 'button',
        value: 'view_cart_btn'
      }]
    }]
  };
};

var onboard_home_attachments = module.exports.onboard_home_attachments = function(delay) {
  let attachments = []
  if (delay !== 'initial') {
    attachments.push({
      text: '',
      callback_id: 'whatevs',
      actions: [{
        name: 'onboard.start.remind_later',
        text: '◷ Snooze',
        style: 'default',
        type: 'button',
        value: `remind_later.${delay}`
      }]
    })
  }
  attachments.push({
    mrkdwn_in: ['text'],
    text: '*Kip Café*\nI can help you collect food orders for the team',
    color: '#f43440',
    callback_id: 'wow such home',
    actions: [{
      name: 'onboard.start.lunch',
      text: 'Order Food',
      style: 'default',
      type: 'button',
      value: 'lunch'
    }]
  });
  attachments.push({
    text: '*Kip Store*\nI can help you get a list of things your team needs',
    mrkdwn_in: ['text'],
    color: '#fe9b00',
    callback_id: 'wow such home',
    actions: [{
      name: 'onboard.start.supplies',
      text: 'Get Supplies',
      style: 'default',
      type: 'button',
      value: 'supplies'
    }]
  });
  return attachments;
};

var onboard_admin_attachments = module.exports.onboard_admin_attachments = function(delay, teamName) {
  let attachments = [];
  if (delay !== 'initial') {
    attachments.push({
      text: '',
      callback_id: 'whatevs',
      actions: [{
        name: `onboarding.remind_later.${delay}`,
        text: '◷ Snooze',
        style: 'default',
        type: 'button',
        value: `onboarding.remind_later.${delay}`
      }]
    });
  }
  attachments.push({
    image_url: 'http://tidepools.co/kip/oregano/thanks.png',
    color: '#3AA3E3',
    mrkdwn_in: ['text'],
    fallback: 'Thanks for inviting me to your team! It’s my first day at <team name> :D\nCould you tell me who buys the office supplies and food? Type `me` or `me and @jane`',
    callback_id: 'none'
  });
  attachments.push({
    text: `Thanks for inviting me to your team! It’s my first day at *${teamName}* :D\nCould you tell me who buys the office supplies and food? Type \`me\` or \`me and @jane\``,
    mrkdwn_in: ['text'],
    color: '#3AA3E3'
  });
  return attachments;
}

var settings_menu = module.exports.settings_menu = [{
  "name": "settings.back",
  "text": "Home",
  "style": "default",
  "type": "button"
}];

var cart_check = module.exports.cart_check = function(id) {
  return [{
    name: "removeall",
    text: 'Remove',
    style: 'danger',
    type: 'button',
    value: id
  }, {
    "name": "cancelremove",
    "text": "Nevermind",
    "style": "default",
    "type": "button",
    value: 'cancelremove'
  }]
}

var empty_cart_check = module.exports.empty_cart_check = [{
  name: "emptycart",
  text: 'Empty Cart',
  style: 'danger',
  type: 'button',
  value: 'emptycart'
}, {
  "name": "cancelemptycart",
  "text": "Nevermind",
  "style": "default",
  "type": "button",
  value: 'cancelemptycart'
}]
var team_buttons = module.exports.team_buttons =
  [{
    "name": "settings.back",
    "text": "Home",
    "style": "default",
    "type": "button"
  }];

var focus_default = module.exports.focus_default = function(message) {
  return [{
    "name": "addcart",
    "text": "+ Add to Cart",
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
  }]
}

var focus_home = module.exports.focus_home = [{
  'name': 'passthrough',
  'text': 'Home',
  'type': 'button',
  'value': 'home'
}, {
  name: 'view_cart_btn',
  text: '⁂ View Cart',
  style: 'default',
  type: 'button',
  value: 'view_cart_btn'
}];

var slack_shopping_buttons = module.exports.slack_shopping_buttons = [{
  // buttons search for whatever follows search in value. e.g. search.healthy_snacks searches for 'healthy snacks'
  'name': 'search_btn.start.search',
  'text': 'Headphones',
  'style': 'default',
  'type': 'button',
  'value': 'search.headphones'
}, {
  'name': 'search_btn.start.search',
  'text': 'Coding Books',
  'style': 'default',
  'type': 'button',
  'value': 'search.coding_books'
}, {
  'name': 'search_btn.start.search',
  'text': 'Healthy Snacks',
  'style': 'default',
  'type': 'button',
  'value': 'search.healthy_snacks'
}];

var slack_shopping_mode = module.exports.slack_shopping_mode = function() {
  return [{
    text: 'Looking for something?',
    fallback: 'Looking for something?',
    image_url: "http://tidepools.co/kip/oregano/store.png",
    callback_id: 'wopr_game',
    color: "#45a5f4",
    attachment_type: 'default',
    actions: slack_shopping_buttons
  }, {
    text: require('./utils').randomStoreHint(),
    mrkdwn_in: ['text']
  }]
};

var slack_bundles = module.exports.slack_bundles = function(isOnboard = false) {
  let attachments = [{
    text: '*Snackbox*\nAll the snacks your team needs for your office',
    mrkdwn_in: ['text'],
    color: '#3AA3E3',
    callback_id: 'none',
    thumb_url: 'http://tidepools.co/kip/oregano/bundle_snacks.png',
    actions: [{
      name: (isOnboard ? 'onboard' : 'bundles') + '.supplies.snackbox',
      text: '+ Add Bundle',
      style: 'primary',
      type: 'button',
      value: 'bundle.snacks'
    }]
  }, {
    text: '*Drinks*\nAll the drinks your team needs for your office',
    mrkdwn_in: ['text'],
    color: '#3AA3E3',
    callback_id: 'none',
    thumb_url: 'http://tidepools.co/kip/oregano/bundle_drinks.png',
    actions: [{
      name: (isOnboard ? 'onboard' : 'bundles') + '.supplies.drinks',
      text: '+ Add Bundle',
      style: 'primary',
      type: 'button',
      value: 'bundle.drinks'
    }]
  }, {
    text: '*Supplies*\nAll the office supplies you need',
    mrkdwn_in: ['text'],
    color: '#3AA3E3',
    callback_id: 'none',
    thumb_url: 'http://tidepools.co/kip/oregano/bundle_supplies.png',
    actions: [{
      name: (isOnboard ? 'onboard' : 'bundles') + '.supplies.supplies',
      text: '+ Add Bundle',
      style: 'primary',
      type: 'button',
      value: 'bundle.supplies'
    }]
  }];
  return attachments;
};

var slack_onboard_basic = module.exports.slack_onboard_basic = [{
  name: "onboard.bundle.yes",
  text: "➤ Continue",
  style: "primary",
  type: "button",
  value: "team"
}];

var slack_onboard_team = module.exports.slack_onboard_team = [{
  name: "onboard.team.send",
  text: "✔︎ Update Members",
  style: "primary",
  type: "button",
  value: "member"
}, {
  name: "onboard.handoff",
  text: "Only Me",
  style: "default",
  type: "button",
  value: "member"
}];

var member_onboard_attachments = module.exports.member_onboard_attachments = function(admin, user, delay) {
  let reply = [{
    'image_url': 'http://kipthis.com/kip_modes/mode_howtousekip.png',
    'text': '',
    'mrkdwn_in': [
      'text',
      'pretext'
    ],
    'color': '#45a5f4'
  }, {
    text: `Hi <@${user}>! I'm Kip and I help <@${admin}> collect food orders and shopping requests\nMy job is to provide the team (that’s you!) everything they need to feel happy and comfortable! :)\n Let me show you how to add things to the team cart`,
    mrkdwn_in: ['text'],
    fallback: 'Welcome to Kip!',
    callback_id: 'none',
    actions: [{
      color: '#45a5f4',
      name: "member_onboard.start.step_1",
      text: "✓ Ok!",
      style: "primary",
      type: "button",
      value: "step_1"
    }]
  }];
  if (delay !== 'initial') {
    reply[1].actions.push({
      name: 'member_onboard.start.remind_later',
      text: '◷ Snooze',
      style: 'default',
      type: 'button',
      value: `remind_later.${delay}.${admin}`
    })
  }
  return reply
};

var slack_member_onboard_start = module.exports.slack_member_onboard_start = [{
  "name": "member_onboard.start.step_2",
  "text": "Headphones",
  "style": "default",
  "type": "button",
  "value": "step_2.headphones"
}, {
  "name": "member_onboard.start.step_2",
  "text": "Coding Books",
  "style": "default",
  "type": "button",
  "value": "step_2.coding_books"
}, {
  "name": "member_onboard.start.step_2",
  "text": "Healthy Snacks",
  "style": "default",
  "type": "button",
  "value": "step_2.healthy_snacks"
}];
