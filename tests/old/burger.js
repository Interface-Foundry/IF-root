module.exports = {
    "text": "*Burger A – $12.95* \n Fresh spinach cooked in a wok, tossed with cottage cheese and creme with mild or hot thin curry sauce. Served with basmati rice and brown rice. Dal onion, relish, tamarind and hot mint sauce upon request.",
    "attachments": [
        {
            "mrkdwn_in": [
                "text"
            ],
            "fallback": "You are unable to choose a game",
            "callback_id": "wopr_game",
            "color": "grey",
            "attachment_type": "default",
            "actions": [
                {
                    "name": "chess",
                    "text": "—",
                    "type": "button",
                    "value": "chess"
                },
                {
                    "name": "chess",
                    "text": "1",
                    "type": "button",
                    "value": "chess"
                },
                {
                    "name": "chess",
                    "text": "+",
                    "type": "button",
                    "value": "chess"
                }
            ]
        },
        {
            "text": "*Choose Toppings* \n Required - Choose as many as you like.",
            "mrkdwn_in": [
                "text"
            ],
            "fallback": "You are unable to choose a game",
            "callback_id": "wopr_game",
            "color": "#3AA3E3",
            "attachment_type": "default",
            "actions": [
                {
                    "name": "chess",
                    "text": "☐ Lettuce",
                    "type": "button",
                    "value": "chess"
                },
                {
                    "name": "chess",
                    "text": "☐ Tomato",
                    "type": "button",
                    "value": "chess"
                },
                {
                    "name": "chess",
                    "text": "☐ Onion",
                    "type": "button",
                    "value": "chess"
                },
                {
                    "name": "chess",
                    "text": "☐ Potato",
                    "type": "button",
                    "value": "chess"
                },
                {
                    "name": "chess",
                    "text": "☐ Egg",
                    "type": "button",
                    "value": "chess"
                }
            ]
        },
        {
            "fallback": "You are unable to choose a game",
            "callback_id": "wopr_game",
            "color": "#3AA3E3",
            "attachment_type": "default",
            "mrkdwn_in": [
                "text"
            ],
            "actions": [
                {
                    "name": "chess",
                    "text": "☐ Pork Belly",
                    "type": "button",
                    "value": "chess"
                },
                {
                    "name": "chess",
                    "text": "☐ Halumi",
                    "type": "button",
                    "value": "chess"
                },
                {
                    "name": "chess",
                    "text": "☐ Habanero",
                    "type": "button",
                    "value": "chess"
                },
                {
                    "name": "chess",
                    "text": "☐ Caviar",
                    "type": "button",
                    "value": "chess"
                }
            ]
        },
        {
            "text": "*Choose Bread* \n Required - Choose 1.",
            "mrkdwn_in": [
                "text"
            ],
            "fallback": "You are unable to choose a game",
            "callback_id": "wopr_game",
            "color": "#3AA3E3",
            "attachment_type": "default",
            "actions": [
                {
                    "name": "chess",
                    "text": "￮ Plain",
                    "type": "button",
                    "value": "chess"
                },
                {
                    "name": "chess",
                    "text": "￮ Whole Wheat",
                    "type": "button",
                    "value": "chess"
                },
                {
                    "name": "chess",
                    "text": "￮ Ramen +$2.95",
                    "type": "button",
                    "value": "chess"
                }
            ]
        },
        {
            "text": "*Would you like a meal addition?* \n Optional - Choose as many as you like.",
            "mrkdwn_in": [
                "text"
            ],
            "fallback": "You are unable to choose a game",
            "callback_id": "wopr_game",
            "color": "grey",
            "attachment_type": "default",
            "actions": [
                {
                    "name": "chess",
                    "text": "☐ Lentil Soup +$6.50",
                    "type": "button",
                    "value": "chess"
                },
                {
                    "name": "chess",
                    "text": "☐ Hummus +$2.35",
                    "type": "button",
                    "value": "chess"
                },
                {
                    "name": "chess",
                    "text": "☐ Diet Pepsi +$1.50",
                    "type": "button",
                    "value": "chess"
                },
                {
                    "name": "chess",
                    "text": "☐ Baklava +$1.25",
                    "type": "button",
                    "value": "chess"
                }
            ]
        },
        {
            "text": "*Would you prefer the dressing on the side?* \n Optional - Choose a maximum of 2.",
            "mrkdwn_in": [
                "text"
            ],
            "fallback": "You are unable to choose a game",
            "callback_id": "wopr_game",
            "color": "grey",
            "attachment_type": "default",
            "actions": [
                {
                    "name": "chess",
                    "text": "☐ Dressing on the Side",
                    "type": "button",
                    "value": "chess"
                },
                {
                    "name": "chess",
                    "text": "☐ Dressing on top",
                    "type": "button",
                    "value": "chess"
                },
                {
                    "name": "chess",
                    "text": "☐ No Dressing",
                    "type": "button",
                    "value": "chess"
                }
            ]
        },
        {
            "text": "Special Instructions: _None_",
            "fallback": "You are unable to choose a game",
            "callback_id": "wopr_game",
            "color": "#49d63a",
            "attachment_type": "default",
            "mrkdwn_in": [
                "text"
            ],
            "actions": [
                {
                    "name": "chess",
                    "text": "Add to Cart: $12.95",
                    "type": "button",
                    "style": "primary",
                    "value": "chess"
                },
                {
                    "name": "chess",
                    "text": "+ Special Instructions",
                    "type": "button",
                    "value": "chess"
                },
                {
                    "name": "chess",
                    "text": "< Back",
                    "type": "button",
                    "value": "chess"
                }
            ]
        }
    ]
}

//SUB_2 (add food inputs)
{
    "text": "*Burger A – $49.65* \n Fresh spinach cooked in a wok, tossed with cottage cheese and creme with mild or hot thin curry sauce. Served with basmati rice and brown rice. Dal onion, relish, tamarind and hot mint sauce upon request.",
    "attachments": [
        {
            "mrkdwn_in": [
                "text"
            ],
            "fallback": "You are unable to choose a game",
            "callback_id": "wopr_game",
            "color": "grey",
            "attachment_type": "default",
            "actions": [
                {
                    "name": "chess",
                    "text": "—",
                    "type": "button",
                    "value": "chess"
                },
                {
                    "name": "chess",
                    "text": "3",
                    "type": "button",
                    "value": "chess"
                },
                {
                    "name": "chess",
                    "text": "+",
                    "type": "button",
                    "value": "chess"
                }
            ]
        },
        {
            "text": "*Choose Toppings* \n Required - Choose as many as you like.",
            "mrkdwn_in": [
                "text"
            ],
            "fallback": "You are unable to choose a game",
            "callback_id": "wopr_game",
            "color": "#3AA3E3",
            "attachment_type": "default",
            "actions": [
                {
                    "name": "chess",
                    "text": "☐ Lettuce",
                    "type": "button",
                    "value": "chess"
                },
                {
                    "name": "chess",
                    "text": "☐ Tomato",
                    "type": "button",
                    "value": "chess"
                },
                {
                    "name": "chess",
                    "text": "✔ Onion",
                    "type": "button",
                    "value": "chess"
                },
                {
                    "name": "chess",
                    "text": "☐ Potato",
                    "type": "button",
                    "value": "chess"
                },
                {
                    "name": "chess",
                    "text": "☐ Egg",
                    "type": "button",
                    "value": "chess"
                }
            ]
        },
        {
            "fallback": "You are unable to choose a game",
            "callback_id": "wopr_game",
            "color": "#3AA3E3",
            "attachment_type": "default",
            "mrkdwn_in": [
                "text"
            ],
            "actions": [
                {
                    "name": "chess",
                    "text": "✔ Pork Belly",
                    "type": "button",
                    "value": "chess"
                },
                {
                    "name": "chess",
                    "text": "☐ Halumi",
                    "type": "button",
                    "value": "chess"
                },
                {
                    "name": "chess",
                    "text": "☐ Habanero",
                    "type": "button",
                    "value": "chess"
                },
                {
                    "name": "chess",
                    "text": "✔ Caviar",
                    "type": "button",
                    "value": "chess"
                }
            ]
        },
        {
            "text": "*Choose Bread* \n Required - Choose 1.",
            "mrkdwn_in": [
                "text"
            ],
            "fallback": "You are unable to choose a game",
            "callback_id": "wopr_game",
            "color": "#3AA3E3",
            "attachment_type": "default",
            "actions": [
                {
                    "name": "chess",
                    "text": "￮ Plain",
                    "type": "button",
                    "value": "chess"
                },
                {
                    "name": "chess",
                    "text": "◉ Whole Wheat",
                    "type": "button",
                    "value": "chess"
                },
                {
                    "name": "chess",
                    "text": "￮ Ramen +$2.95",
                    "type": "button",
                    "value": "chess"
                }
            ]
        },
        {
            "text": "*Would you like a meal addition?* \n Optional - Choose as many as you like.",
            "mrkdwn_in": [
                "text"
            ],
            "fallback": "You are unable to choose a game",
            "callback_id": "wopr_game",
            "color": "grey",
            "attachment_type": "default",
            "actions": [
                {
                    "name": "chess",
                    "text": "☐ Lentil Soup +$6.50",
                    "type": "button",
                    "value": "chess"
                },
                {
                    "name": "chess",
                    "text": "✔ Hummus +$2.35",
                    "type": "button",
                    "value": "chess"
                },
                {
                    "name": "chess",
                    "text": "☐ Diet Pepsi +$1.50",
                    "type": "button",
                    "value": "chess"
                },
                {
                    "name": "chess",
                    "text": "✔ Baklava +$1.25",
                    "type": "button",
                    "value": "chess"
                }
            ]
        },
        {
            "text": "*Would you prefer the dressing on the side?* \n Optional - Choose a maximum of 2.",
            "mrkdwn_in": [
                "text"
            ],
            "fallback": "You are unable to choose a game",
            "callback_id": "wopr_game",
            "color": "grey",
            "attachment_type": "default",
            "actions": [
                {
                    "name": "chess",
                    "text": "✔ Dressing on the Side",
                    "type": "button",
                    "value": "chess"
                },
                {
                    "name": "chess",
                    "text": "☐ Dressing on top",
                    "type": "button",
                    "value": "chess"
                },
                {
                    "name": "chess",
                    "text": "✔ No Dressing",
                    "type": "button",
                    "value": "chess"
                }
            ]
        },
        {
            "text": "Special Instructions: _Hold the egg, no gluten or other farm based products. I eat shadows only. Extra Ranch Dressing!!_",
            "fallback": "You are unable to choose a game",
            "callback_id": "wopr_game",
            "color": "#49d63a",
            "attachment_type": "default",
            "mrkdwn_in": [
                "text"
            ],
            "actions": [
                {
                    "name": "chess",
                    "text": "Add to Cart: $49.65",
                    "type": "button",
                    "style": "primary",
                    "value": "chess"
                },
                {
                    "name": "chess",
                    "text": "Edit Instructions",
                    "type": "button",
                    "value": "chess"
                },
                {
                    "name": "chess",
                    "text": "< Back",
                    "type": "button",
                    "value": "chess"
                }
            ]
        }
    ]
}

//SUB_3 (on add to cart click, and errors in form, show errors)
{
    "text": "*Burger A – $49.65* \n Fresh spinach cooked in a wok, tossed with cottage cheese and creme with mild or hot thin curry sauce. Served with basmati rice and brown rice. Dal onion, relish, tamarind and hot mint sauce upon request.",
    "attachments": [
        {
            "mrkdwn_in": [
                "text"
            ],
            "fallback": "You are unable to choose a game",
            "callback_id": "wopr_game",
            "color": "grey",
            "attachment_type": "default",
            "actions": [
                {
                    "name": "chess",
                    "text": "—",
                    "type": "button",
                    "value": "chess"
                },
                {
                    "name": "chess",
                    "text": "3",
                    "type": "button",
                    "value": "chess"
                },
                {
                    "name": "chess",
                    "text": "+",
                    "type": "button",
                    "value": "chess"
                }
            ]
        },
        {
            "text": "*Choose Toppings* \n Required - Choose as many as you like. \n `Option required`",
            "mrkdwn_in": [
                "text"
            ],
            "fallback": "You are unable to choose a game",
            "callback_id": "wopr_game",
            "color": "#fa951b",
            "attachment_type": "default",
            "actions": [
                {
                    "name": "chess",
                    "text": "☐ Lettuce",
                    "type": "button",
                    "value": "chess"
                },
                {
                    "name": "chess",
                    "text": "☐ Tomato",
                    "type": "button",
                    "value": "chess"
                },
                {
                    "name": "chess",
                    "text": "☐ Onion",
                    "type": "button",
                    "value": "chess"
                },
                {
                    "name": "chess",
                    "text": "☐ Potato",
                    "type": "button",
                    "value": "chess"
                },
                {
                    "name": "chess",
                    "text": "☐ Egg",
                    "type": "button",
                    "value": "chess"
                }
            ]
        },
        {
            "fallback": "You are unable to choose a game",
            "callback_id": "wopr_game",
            "color": "#fa951b",
            "attachment_type": "default",
            "mrkdwn_in": [
                "text"
            ],
            "actions": [
                {
                    "name": "chess",
                    "text": "☐ Pork Belly",
                    "type": "button",
                    "value": "chess"
                },
                {
                    "name": "chess",
                    "text": "☐ Halumi",
                    "type": "button",
                    "value": "chess"
                },
                {
                    "name": "chess",
                    "text": "☐ Habanero",
                    "type": "button",
                    "value": "chess"
                },
                {
                    "name": "chess",
                    "text": "☐ Caviar",
                    "type": "button",
                    "value": "chess"
                }
            ]
        },
        {
            "text": "*Choose Bread* \n Required - Choose 1.",
            "mrkdwn_in": [
                "text"
            ],
            "fallback": "You are unable to choose a game",
            "callback_id": "wopr_game",
            "color": "#3AA3E3",
            "attachment_type": "default",
            "actions": [
                {
                    "name": "chess",
                    "text": "￮ Plain",
                    "type": "button",
                    "value": "chess"
                },
                {
                    "name": "chess",
                    "text": "◉ Whole Wheat",
                    "type": "button",
                    "value": "chess"
                },
                {
                    "name": "chess",
                    "text": "￮ Ramen +$2.95",
                    "type": "button",
                    "value": "chess"
                }
            ]
        },
        {
            "text": "*Would you like a meal addition?* \n Optional - Choose as many as you like.",
            "mrkdwn_in": [
                "text"
            ],
            "fallback": "You are unable to choose a game",
            "callback_id": "wopr_game",
            "color": "grey",
            "attachment_type": "default",
            "actions": [
                {
                    "name": "chess",
                    "text": "☐ Lentil Soup +$6.50",
                    "type": "button",
                    "value": "chess"
                },
                {
                    "name": "chess",
                    "text": "✔ Hummus +$2.35",
                    "type": "button",
                    "value": "chess"
                },
                {
                    "name": "chess",
                    "text": "☐ Diet Pepsi +$1.50",
                    "type": "button",
                    "value": "chess"
                },
                {
                    "name": "chess",
                    "text": "✔ Baklava +$1.25",
                    "type": "button",
                    "value": "chess"
                }
            ]
        },
        {
            "text": "*Would you prefer the dressing on the side?* \n Optional - Choose a maximum of 2. \n `Maximum number of options exceeded`",
            "mrkdwn_in": [
                "text"
            ],
            "fallback": "You are unable to choose a game",
            "callback_id": "wopr_game",
            "color": "#fa951b",
            "attachment_type": "default",
            "actions": [
                {
                    "name": "chess",
                    "text": "✔ Dressing on the Side",
                    "type": "button",
                    "value": "chess"
                },
                {
                    "name": "chess",
                    "text": "✔ Dressing on top",
                    "type": "button",
                    "value": "chess"
                },
                {
                    "name": "chess",
                    "text": "✔ No Dressing",
                    "type": "button",
                    "value": "chess"
                }
            ]
        },
        {
            "text": "Special Instructions: _Hold the egg, no gluten or other farm based products. I eat shadows only. Extra Ranch Dressing!!_",
            "fallback": "You are unable to choose a game",
            "callback_id": "wopr_game",
            "color": "#49d63a",
            "attachment_type": "default",
            "mrkdwn_in": [
                "text"
            ],
            "actions": [
                {
                    "name": "chess",
                    "text": "Add to Cart: $49.65",
                    "type": "button",
                    "style": "primary",
                    "value": "chess"
                },
                {
                    "name": "chess",
                    "text": "Edit Instructions",
                    "type": "button",
                    "value": "chess"
                },
                {
                    "name": "chess",
                    "text": "< Back",
                    "type": "button",
                    "value": "chess"
                }
            ]
        }
    ]
}
