{
    "text": "*Confirm Team Order* for <kipthis.com|Choza Taqueria>",
    "attachments": [
                    {
            "title": "",
            "mrkdwn_in": [

                "text"

            ],
            "image_url":"http://i.imgur.com/IOdnfDV.png",
            "color": "#3AA3E3"
            },
        {
            "title": "Tacos – $10.79",
            "mrkdwn_in": [

                "text"

            ],
            "text": "Double corn tortillas with chicken, corn salsa, pico de gallo, fresh cilantro, lettuce, rice, guacamole.\n *Added by:* <www.blah.com|@Alyx>",
            "fallback": "You are unable to choose a game",
            "callback_id": "wopr_game",
            "color": "#3AA3E3",
            "attachment_type": "default",
            "thumb_url": "http://i.imgur.com/GImiWp2.jpg",
            "actions": [
                {
                    "name": "chess",
                    "text": "+",
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
                    "text": "—",
                    "type": "button",
                    "value": "chess"
                }
            ]
        },
                {
            "title": "Tostada – $8.22",
            "mrkdwn_in": [

                "text"

            ],
            "text": "Crispy corn tortilla topped with black beans, lettuce, salsa, queso fresco and steak \n *Added by:* <www.blah.com|@Rachel>, <www.blah.com|@Alyx>, <www.blah.com|@Peter>",
            "fallback": "You are unable to choose a game",
            "callback_id": "wopr_game",
            "color": "#3AA3E3",
            "attachment_type": "default",
            "thumb_url": "http://i.imgur.com/GImiWp2.jpg",
            "actions": [
                {
                    "name": "chess",
                    "text": "+",
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
                    "text": "—",
                    "type": "button",
                    "value": "chess"
                },
                                {
                    "name": "chess",
                    "text": "Remove All",
                    "type": "button",
                    "value": "chess",
                    "confirm": {
                        "title": "Are you sure?",
                        "text": "Are you sure you don't want remove all items from team cart?",
                        "ok_text": "Yes",
                        "dismiss_text": "No"
                    }
                }
            ]
        },
        {
            "title": "Jarritos – $2.75",
            "mrkdwn_in": [

                "text"

            ],
            "text": "Jarritos flavor Pineapple.\n *Added by:* <www.blah.com|@Rachel>",
            "fallback": "You are unable to choose a game",
            "callback_id": "wopr_game",
            "color": "#3AA3E3",
            "attachment_type": "default",
            "thumb_url": "http://i.imgur.com/RtHKdqA.jpg",
            "actions": [
                {
                    "name": "chess",
                    "text": "+",
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
                    "text": "—",
                    "type": "button",
                    "value": "chess"
                }
            ]
        },
       {
           "title":"",
           "mrkdwn_in": [

                "text"

            ],
            "text": "*Delivery Fee:* $7.00 \n *Taxes:* $4.52 \n *Team Cart Total:* $49.72 \n",
            "fallback": "You are unable to choose a game",
            "callback_id": "wopr_game",
            "color": "#49d63a",
            "attachment_type": "default",
           "actions": [
                {
                    "name": "chess",
                    "text": "✓ Checkout: $49.72",
                    "style": "primary",
                    "type": "button",
                    "value": "chess"
                }
               ]
        }
    ]
}