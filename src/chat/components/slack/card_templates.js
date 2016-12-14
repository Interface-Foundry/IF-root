var _ = require('lodash');

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

var simple_home = module.exports.simple_home = [{
  name: 'passthrough',
  value: 'food',
  text: 'Kip Café',
  type: 'button'
}, {
  name: 'passthrough',
  value: 'shopping',
  text: 'Kip Store',
  type: 'button'
}, {
  name: 'settings',
  text: 'Settings',
  style: 'default',
  type: 'button',
  value: 'start'
}]


// {
//   name: "onboard.start.confirm_cart_reminder",
//   text: "Today",
//   style: "default",
//   type: "button",
//   value: "confirm_cart_reminder.today"
// }


var settings_intervals = module.exports.settings_intervals = [
{
    "name": "settings.cron.daily",
    "text": "Daily",
    "style": "default",
    "type": "button",
    "value": "daily"
  },
  {
    "name": "settings.cron.weekly",
    "text": "Weekly",
    "style": "default",
    "type": "button",    
    "value": "weekly"
  },
  {
    "name": "settings.cron.monthly",
    "text": "Monthly",
    "style": "default",
    "type": "button",
    "value": "monthly"
  },
   {
    "name": "settings.cron.never",
    "text": "Never",
    "style": "default",
    "type": "button",
    "value": "never"
  }]

var settings_days= module.exports.settings_days = [
    {
      "name": "settings.set_day.monday",
      "text": "Mon",
      "style": "default",
      "type": "button",
      "value": '1'
    },
    {
      "name": "settings.set_day.tuesday",
      "text": "Tues",
      "style": "default",
      "type": "button",
      "value": '2'
    },
     {
      "name": "settings.set_day.wednesday",
      "text": "Wed",
      "style": "default",
      "type": "button",
      "value": '3'
    },
    {
      "name": "settings.set_day.thursday",
      "text": "Thurs",
      "style": "default",
      "type": "button",
      "value": '4'
    },
    {
      "name": "settings.set_day.friday",
      "text": "Fri",
      "style": "default",
      "type": "button",
      "value": '5'
    },
    {
      "name": "settings.set_day.saturday",
      "text": "Sat",
      "style": "default",
      "type": "button",
      "value": '6'
    },
    {
      "name": "settings.set_day.sunday",
      "text": "Sun",
      "style": "default",
      "type": "button",
      "value": '0'
    }
  ]


var settings_weeks= module.exports.settings_weeks = function(message) {
  return [
    {
      "name": "settings.set_week.1",
      "text": "1",
      "style": "default",
      "type": "button",
      "value": '1'
    },
    {
      "name": "settings.set_week.2",
      "text": "2",
      "style": "default",
      "type": "button",
      "value": '2'
    },
     {
      "name": "settings.set_week.3",
      "text": "3",
      "style": "default",
      "type": "button",
      "value": '3'
    },
    {
      "name": "settings.set_week.4",
      "text": "4",
      "style": "default",
      "type": "button",
      "value": '4'
    }
  ]
} 


var settings_menu = module.exports.settings_menu = [{
    "name": "settings.back",
    "text": "< Back",
    "style": "default",
    "type": "button"
  },
  {
    name: 'team',
    text: 'Team Members',
    style: 'default',
    type: 'button',
    value: 'start',
  }];

var team_buttons = module.exports.team_buttons =
  [{
    name: 'settings',
    text: '< Back',
    style: 'default',
    type: 'button',
    value: 'start'
  }, {
    "name": "settings.back",
    "text": "Home",
    "style": "default",
    "type": "button"
  }];

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
    "name": "settings.back",
    "text": "Home",
    "style": "default",
    "type": "button"
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
}, 
// {
//   name: "onboard.bundle.more",
//   text: "More Info",
//   style: "default",
//   type: "button",
//   value: "more_info"
// }
];

var slack_onboard_team = module.exports.slack_onboard_team = [{
  name: "onboard.team.send",
  text: "Notify Channels",
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
    "name": "settings.back",
    "text": "Home",
    "style": "default",
    "type": "button"
}];

var cart_reminder = module.exports.cart_reminder = [{
  name: "onboard.start.confirm_cart_reminder",
  text: "Daily",
  style: "default",
  type: "button",
  value: "confirm_cart_reminder.daily"
}, {
  name: "onboard.start.confirm_cart_reminder",
  text: "Weekly",
  style: "default",
  type: "button",
  value: "confirm_cart_reminder.weekly"
}, {
  name: "onboard.start.confirm_cart_reminder",
  text: "Monthly",
  style: "default",
  type: "button",
  value: "confirm_cart_reminder.monthly"
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
  name: "member_onboard.start.reminder_confirm",
  text: "Today",
  style: "default",
  type: "button",
  value: "reminder_confirm.today"
}, {
  name: "member_onboard.start.reminder_confirm",
  text: "Tomorrow",
  style: "default",
  type: "button",
  value: "reminder_confirm.tomorrow"
}, {
  name: "member_onboard.start.reminder_confirm",
  text: "1 Week",
  style: "default",
  type: "button",
  value: "reminder_confirm.one_week"
}, {
  name: "member_onboard.start.choose",
  text: "Choose for me",
  style: "default",
  type: "button",
  value: "reminder_confirm.choose"
}];


var slack_onboard_member = module.exports.slack_onboard_member = [{
  name: "member_onboard.start.step_1",
  text: "✓ Ok!",
  style: "primary",
  type: "button",
  value: "step_1"
}, {
  name: "member_onboard.start.reminder",
  text: "Remind me later",
  style: "default",
  type: "button",
  value: "reminder"
}];

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