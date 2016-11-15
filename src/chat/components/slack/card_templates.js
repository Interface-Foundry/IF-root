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
