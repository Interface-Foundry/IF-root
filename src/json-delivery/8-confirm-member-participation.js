{
    "text":"`Alyx` chose *<kipthis.com|Choza Taqueria>* \n Mexican, Southwestern - est. wait time 45-55 min",
    "attachments": [
        {
            "mrkdwn_in":[
                "text"
                ],
            "text": "Want to be in this order?",
            "fallback": "n/a",
            "callback_id": "wopr_game",
            "color": "#3AA3E3",
            "attachment_type": "default",
            "actions": [
                {
                    "name": "902 Broadway 6th fl",
                    "text": "Yes",
                    "type": "button",
                    "style": "primary",
                    "value": "chess"
                },
                {
                    "name": "war",
                    "text": "No",
                    "type": "button",
                    "value": "war",
                    "confirm": {
                        "title": "Are you sure?",
                        "text": "Are you sure you don't want lunch?",
                        "ok_text": "Yes",
                        "dismiss_text": "No"
                    }
                }
            ]
        }
    ]
}