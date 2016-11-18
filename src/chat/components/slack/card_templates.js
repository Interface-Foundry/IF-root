var slack_home_default = module.exports.slack_home_default = [{
     name: "more",
     text: "See More Result",
     style: "default",
     type: "button",
     value: "more"
   },
   {
     name: "home_btn",
     text: "🐧",
     style: "default",
     type: "button",
     value: "home"
   }]


var slack_home = module.exports.slack_home =[{
     name: "cafe_btn",
     text: "Kip Cafe",
     style: "default",
     type: "button",
     value: "cafe_btn"
   },
   {
     name: "settings",
     text: "Settings",
     style: "default",
     type: "button",
     value: "home",
   },
   {
     name: "team",
     text: "Team Members",
     style: "default",
     type: "button",
     value: "home",
   }, 
   {
     name: "view_cart_btn",
     text: "View Cart",
     style: "default",
     type: "button",
     value: "view_cart_btn"
     }, 
   {
     name: "back_btn",
     text: "< Back",
     style: "default",
     type: "button",
     value: "back"
   }];

var slack_team_default = module.exports.slack_team_default = [
      {
        "name": "exit",
        "text": "Exit Members",
        "style": "primary",
        "type": "button",
        "value": "exit"
      },
      {
        "name": "home_btn",
        "text": "🐧",
        "style": "default",
        "type": "button",
        "value": "home_btn"
      }
  ]

var slack_team = module.exports.slack_team =[{
     name: "cafe_btn",
     text: "Kip Cafe",
     style: "default",
     type: "button",
     value: "cafe_btn"
   },
   {
     name: "back_btn",
     text: "< Back",
     style: "default",
     type: "button",
     value: "back"
   }];

var slack_settings_default = module.exports.slack_settings_default = [{
      name: "exit",
      text: "Exit Settings",
      style: "primary",
      type: "button",
      value: "exit"
    },{
      name: "home_btn",
      text: "🐧",
      style: "default",
      type: "button",
      value: "home_btn"
    }];


var slack_settings = module.exports.slack_settings = [{
     name: "cafe_btn",
     text: "Kip Cafe",
     style: "default",
     type: "button",
     value: "cafe_btn"
   },
   {
     name: "team",
     text: "Team Members",
     style: "default",
     type: "button",
     value: "home",
   }, 
   {
     name: "view_cart_btn",
     text: "View Cart",
     style: "default",
     type: "button",
     value: "view_cart_btn"
     }, 
   {
     name: "back_btn",
     text: "< Back",
     style: "default",
     type: "button",
     value: "back"
   }];

var slack_shopping_mode = module.exports.slack_shopping_mode = [{
     pretext: "Going back to Shopping Mode ☺️",
     image_url:"http://kipthis.com/kip_modes/mode_shopping.png",
     text:"",
     mrkdwn_in: [
         "text",
         "pretext"
     ],
     color:"#45a5f4"
   },
   {
       text: "Tell me what you're looking for, or use `help` for more options",
       mrkdwn_in: [
           "text",
           "pretext"
       ],
       color:"#49d63a"
   }
];

// ONBOARDING MODE TEMPLATES

var slack_onboard_default = module.exports.slack_onboard_default = [{
      name: "exit",
      text: "Exit Onboarding",
      style: "primary",
      type: "button",
      value: "exit"
    },{
      name: "onboard.home.menu",
      text: "🐧",
      style: "default",
      type: "button",
      value: "home_btn"
    }];


var slack_onboard_home = module.exports.slack_onboard_home  = [{
     name: "cafe_btn",
     text: "Kip Cafe",
     style: "default",
     type: "button",
     value: "cafe_btn"
   },
   {
     name: "shopping_btn",
     text: "Kip Shopping",
     style: "default",
     type: "button",
     value: "shopping_btn"
   },
   {
     name: "onboard.home.default",
     text: "< Back",
     style: "default",
     type: "button",
     value: "back_btn"
   }];

var slack_onboard_start = module.exports.slack_onboard_start = [{
     name: "onboard.start.lunch",
     text: "Lunch",
     style: "default",
     type: "button",
     value: "lunch"
   },
   {
     name: "onboard.start.supplies",
     text: "Supplies",
     style: "default",
     type: "button",
     value: "supplies"
   },
   {
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
   },
  {
     name: "onboard.supplies.drinks",
     text: "Drinks",
     style: "default",
     type: "button",
     value: "bundle.drinks"
   },
   {
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
    },{
      name: "onboard.bundle.no",
      text: "No",
      style: "default",
      type: "button",
      value: "checkout"
    },{
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
      value: "reminder"
    },{
      name: "onboard.team.help",
      text: "Help",
      style: "primary",
      type: "button",
      value: "more_info"
    },
    {
      name: "exit",
      text: "Exit Onboarding",
      style: "primary",
      type: "button",
      value: "exit"
    }];

var slack_reminder = module.exports.slack_reminder = [{
    name: "onboard.start.confirm_reminder",
    text: "Today",
    style: "default",
    type: "button",
    value: "confirm_reminder.today"
  }, {
    name: "onboard.start.confirm_reminder",
    text: "Tomorrow",
    style: "default",
    type: "button",
    value: "confirm_reminder.tomorrow"
  }, {
    name: "onboard.start.confirm_reminder",
    text: "1 Week",
    style: "default",
    type: "button",
    value: "confirm_reminder.one_week"
  }, {
    name: "onboard.start.confirm_reminder",
    text: "1 Month",
    style: "default",
    type: "button",
    value: "confirm_reminder.one_month"
  }, {
    name: "onboard.start.confirm_reminder",
    text: "Never",
    style: "default",
    type: "button",
    value: "confirm_reminder.never"
  }
];

var slack_remind = module.exports.slack_remind = [{
    name: "onboard.start.confirm_remind",
    text: "Today",
    style: "default",
    type: "button",
    value: "confirm_remind.today"
  }, {
    name: "onboard.start.confirm_remind",
    text: "Tomorrow",
    style: "default",
    type: "button",
    value: "confirm_remind.tomorrow"
  }, {
    name: "onboard.start.confirm_remind",
    text: "1 Week",
    style: "default",
    type: "button",
    value: "confirm_remind.one_week"
  }, {
    name: "onboard.start.choose",
    text: "Choose for me",
    style: "default",
    type: "button",
    value: "confirm_remind.choose"
  }
];