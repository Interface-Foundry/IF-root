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
     name: "help_btn",
     text: "Help",
     style: "default",
     type: "button",
     value: "help_btn"
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


var slack_settings_default = module.exports.slack_settings_default = [{
      name: "exit",
      text: "Exit Settings",
      style: "primary",
      type: "button",
      value: "exit"
    },{
     name: "help_btn",
     text: "Help",
     style: "default",
     type: "button",
     value: "help_btn"
    },{
      name: "home_btn",
      text: "🐧",
      style: "default",
      type: "button",
      value: "home_btn"
    }];


var slack_settings = module.exports.slack_settings = [{
     name: "help_btn",
     text: "Help",
     style: "default",
     type: "button",
     value: "help_btn"
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
     pretext: "Ok thanks! Going back to Shopping Mode ☺️",
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
