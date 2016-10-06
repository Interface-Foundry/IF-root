{
    "attachments": [ 
        {
            "mrkdwn_in": [
               "text"
            ],
            "text": "Cool! You selected `902 Broadway 6th Floor New York, NY 10010`. Delivery or Pickup?",
            "fallback": "You are unable to choose a game",
            "callback_id": "wopr_game",
            "color": "#3AA3E3",
            "attachment_type": "default",
            "actions": [
                {
                    "name": "chess",
                    "text": "Delivery",
                    "type": "button",
                    "value": "chess"
                },
                {
                    "name": "maze",
                    "text": "Pickup",
                    "type": "button",
                    "value": "maze"
                },
                {
                    "name": "maze",
                    "text": "< Change Address",
                    "type": "button",
                    "value": "maze"
                }
            ]
        }
    ]
}