var shopping_home_default = module.exports.shopping_home_default = function(id) {
  return [{
    name: "more",
    text: "See More Results",
    style: "default",
    type: "button",
    value: "more"
  }, {
    name: "shopping.home.expand",
    text: "🐧",
    style: "default",
    type: "button",
    value: id
  }]
}

var focus_home_default = module.exports.focus_home_default = function(message) {
  return [{
    "name": "addcart",
    "text": "Add to Cart",
    "style": "primary",
    "type": "button",
    "value": message.focus - 1
  }, {
    "name": "cheaper",
    "text": "Find Cheaper",
    "style": "default",
    "type": "button",
    "value": message.focus - 1
  }, {
    "name": "similar",
    "text": "Find Similar",
    "style": "default",
    "type": "button",
    "value": message.focus - 1
  }, {
    "name": "focus.home.expand",
    "text": "🐧",
    "style": "default",
    "type": "button",
    "value": message._id
  }]
}


var shopping_team_default = module.exports.shopping_team_default = function(id) {
  return [{
    "name": "exit",
    "text": "Exit Members",
    "style": "primary",
    "type": "button",
    "value": "exit"
  }, {
    "name": "shopping.home.expand",
    "text": "🐧",
    "style": "default",
    "type": "button",
    "value": id
  }]
}

var shopping_settings_default = module.exports.shopping_settings_default = function(id) {

  return [{
    name: "exit",
    text: "Exit Settings",
    style: "primary",
    type: "button",
    value: "exit"
  }, {
    name: "shopping.home.expand",
    text: "🐧",
    style: "default",
    type: "button",
    value: id
  }]

}


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

var slack_shopping_mode = module.exports.slack_shopping_mode = [{
  pretext: "Going back to Shopping Mode ☺️",
  image_url: "http://kipthis.com/kip_modes/mode_shopping.png",
  text: "",
  mrkdwn_in: [
    "text",
    "pretext"
  ],
  color: "#45a5f4"
}, {
  text: "Tell me what you're looking for, or use `help` for more options",
  mrkdwn_in: [
    "text",
    "pretext"
  ],
  color: "#49d63a"
}, {
  text: 'Tap to search for something',
  fallback: 'You are unable to choose a game',
  callback_id: 'wopr_game',
  color: '#3AA3E3',
  attachment_type: 'default',
  actions: slack_shopping_buttons
}];


// ONBOARDING MODE TEMPLATES

var slack_onboard_start = module.exports.slack_onboard_start = [{
  name: "onboard.start.lunch",
  text: "Kip Café",
  style: "default",
  type: "button",
  value: "lunch"
}, {
  name: "onboard.start.supplies",
  text: "Kip Store",
  style: "default",
  type: "button",
  value: "supplies"
}, {
  name: "onboard.start.remind",
  text: "Remind Me Later",
  style: "default",
  type: "button",
  value: "remind"
}];

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


var slack_onboard_default = module.exports.slack_onboard_default = [{
  name: "exit",
  text: "Exit Onboarding",
  style: "default",
  type: "button",
  value: "exit"
}];

var slack_onboard_basic = module.exports.slack_onboard_basic = [{
  name: "onboard.bundle.yes",
  text: "Yes",
  style: "primary",
  type: "button",
  value: "team"
}, {
  name: "onboard.bundle.no",
  text: "No",
  style: "default",
  type: "button",
  value: "checkout"
}, {
  name: "onboard.bundle.more",
  text: "More Info",
  style: "default",
  type: "button",
  value: "more_info"
}];

var slack_onboard_team = module.exports.slack_onboard_team = [{
  name: "onboard.team.send",
  text: "Send Onboarding",
  style: "primary",
  type: "button",
  value: "member"
}, {
  name: "onboard.team.help",
  text: "Help",
  style: "primary",
  type: "button",
  value: "more_info"
}, {
  name: "exit",
  text: "Exit Onboarding",
  style: "primary",
  type: "button",
  value: "exit"
}];

var cart_reminder = module.exports.cart_reminder = [{
  name: "onboard.start.confirm_cart_reminder",
  text: "Today",
  style: "default",
  type: "button",
  value: "confirm_cart_reminder.today"
}, {
  name: "onboard.start.confirm_cart_reminder",
  text: "Tomorrow",
  style: "default",
  type: "button",
  value: "confirm_cart_reminder.tomorrow"
}, {
  name: "onboard.start.confirm_cart_reminder",
  text: "1 Week",
  style: "default",
  type: "button",
  value: "confirm_cart_reminder.one_week"
}, {
  name: "onboard.start.confirm_cart_reminder",
  text: "1 Month",
  style: "default",
  type: "button",
  value: "confirm_cart_reminder.one_month"
}, {
  name: "onboard.start.confirm_cart_reminder",
  text: "Never",
  style: "default",
  type: "button",
  value: "confirm_cart_reminder.never"
}];

var admin_reminder = module.exports.admin_reminder = [{
  name: "onboard.start.confirm_admin_reminder",
  text: "Today",
  style: "default",
  type: "button",
  value: "confirm_admin_reminder.today"
}, {
  name: "onboard.start.confirm_admin_reminder",
  text: "Tomorrow",
  style: "default",
  type: "button",
  value: "confirm_admin_reminder.tomorrow"
}, {
  name: "onboard.start.confirm_admin_reminder",
  text: "1 Week",
  style: "default",
  type: "button",
  value: "confirm_admin_reminder.one_week"
}, {
  name: "onboard.start.choose",
  text: "Choose for me",
  style: "default",
  type: "button",
  value: "confirm_admin_reminder.choose"
}];

var member_reminder = module.exports.member_reminder = [{
  name: "onboard_shopping.start.reminder_confirm",
  text: "Today",
  style: "default",
  type: "button",
  value: "reminder_confirm.today"
}, {
  name: "onboard_shopping.start.reminder_confirm",
  text: "Tomorrow",
  style: "default",
  type: "button",
  value: "reminder_confirm.tomorrow"
}, {
  name: "onboard_shopping.start.reminder_confirm",
  text: "1 Week",
  style: "default",
  type: "button",
  value: "reminder_confirm.one_week"
}, {
  name: "onboard_shopping.start.choose",
  text: "Choose for me",
  style: "default",
  type: "button",
  value: "reminder_confirm.choose"
}];


var slack_onboard_member = module.exports.slack_onboard_member = [{
  name: "onboard_shopping.start.step_1",
  text: "✓ Ok!",
  style: "primary",
  type: "button",
  value: "step_1"
}, {
  name: "onboard_shopping.start.reminder",
  text: "Remind me later",
  style: "default",
  type: "button",
  value: "reminder"
}];

var slack_member_onboard_start = module.exports.slack_member_onboard_start = [{
  "name": "onboard_shopping.start.step_2",
  "text": "Headphones",
  "style": "default",
  "type": "button",
  "value": "step_2.headphones"
}, {
  "name": "onboard_shopping.start.step_2",
  "text": "Coding Books",
  "style": "default",
  "type": "button",
  "value": "step_2.coding_books"
}, {
  "name": "onboard_shopping.start.step_2",
  "text": "Healthy Snacks",
  "style": "default",
  "type": "button",
  "value": "step_2.healthy_snacks"
}];