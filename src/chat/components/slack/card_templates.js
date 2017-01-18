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

var home_screen = module.exports.home_screen = function(isAdmin) {
  let buttonDescrip = isAdmin ? 'Collect' : 'Get';
  return {
    text: require('./utils').randomWelcome(),
    attachments: [{
      'mrkdwn_in': ['text'],
      text: '*Kip Café*\nHungry? I can help you find lunch',
      color: '#f43440',
      callback_id: 'wow such home',
      actions: [{
        name: 'passthrough',
        value: 'food',
        text: `${buttonDescrip} Food`,
        type: 'button'
      }]
    }, {
      text: '*Kip Store*\nAdd things you need to your team\'s cart',
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
    text: '*Kip Café*\nI can order food for your team!\nLet me show you how to make lunch easier',
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
    text: '*Kip Store*\nI can shop for your team!\nLet me show you how to make team shopping better',
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

var onboard_admin_attachments = module.exports.onboard_admin_attachments = function(delay) {
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
    image_url: 'https://kipthis.com/kip_modes/mode_success.png',
    color: '#3AA3E3',
    mrkdwn_in: ['text'],
    fallback: 'Kudos! *Kip* is now officially a member of your team :blush:',
    callback_id: 'none'
  });
  attachments.push({
    text: 'Kudos! *Kip* is now officially a member of your team :blush: ',
    mrkdwn_in: ['text'],
    color: '#3AA3E3'
  })
  attachments.push({
    text: 'Who manages the office purchases? Type something like `me` or `me and @jane`',
    color: '#3AA3E3',
    mrkdwn_in: [
      'text',
      'pretext'
    ]
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
    image_url: "http://kipthis.com/kip_modes/mode_shopping.png",
    fallback: 'Welcome to Kip Store',
    text: "",
    mrkdwn_in: [
      "text",
      "pretext"
    ],
    color: "#45a5f4"
  }, {
    text: 'Tap to search for something',
    fallback: 'Tap to search for something',
    callback_id: 'wopr_game',
    color: "#45a5f4",
    attachment_type: 'default',
    actions: slack_shopping_buttons
  }, {
    text: require('./utils').randomStoreHint(),
    mrkdwn_in: ['text']
  }]
};

var slack_bundles = module.exports.slack_bundles = [{
  name: "bundles.supplies.snackbox",
  text: "Snackbox",
  style: "default",
  type: "button",
  value: "bundle.snacks"
}, {
  name: "bundles.supplies.drinks",
  text: "Drinks",
  style: "default",
  type: "button",
  value: "bundle.drinks"
}, {
  name: "bundles.supplies.supplies",
  text: "Office Supplies",
  style: "default",
  type: "button",
  value: "bundle.supplies"
}];

// ONBOARDING MODE TEMPLATES
var slack_onboard_bundles = module.exports.slack_onboard_bundles = [{
  name: "onboard.supplies.snackbox",
  text: "Snackbox",
  style: "default",
  type: "button",
  value: "bundle.snacks"
}, {
  name: "onboard.supplies.drinks",
  text: "Drinks",
  style: "default",
  type: "button",
  value: "bundle.drinks"
}, {
  name: "onboard.supplies.supplies",
  text: "Office Supplies",
  style: "default",
  type: "button",
  value: "bundle.supplies"
}];

var slack_onboard_basic = module.exports.slack_onboard_basic = [{
  name: "onboard.bundle.yes",
  text: "Yes",
  style: "primary",
  type: "button",
  value: "team"
}, {
  name: "onboard.start.handoff",
  text: "No",
  style: "default",
  type: "button",
  value: "handoff"
}];

var slack_onboard_team = module.exports.slack_onboard_team = [{
  name: "onboard.team.send",
  text: "Notify Members",
  style: "primary",
  type: "button",
  value: "member"
}];

var member_onboard_attachments = module.exports.member_onboard_attachments = function(admin, delay) {
  let reply = [{
    'image_url': 'http://kipthis.com/kip_modes/mode_howtousekip.png',
    'text': '',
    'mrkdwn_in': [
      'text',
      'pretext'
    ],
    'color': '#45a5f4'
  }, {
    text: `Make <@${admin}>'s life easier! Let me show you how to add items to the team cart`,
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