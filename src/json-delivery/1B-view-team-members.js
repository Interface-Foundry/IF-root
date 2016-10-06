{
    "text": "",
    "attachments": [
        {
            "image_url":"http://i.imgur.com/JOF175p.png",
            "title": ""
        },
        {
            "title": "",
            "text": "",
            "mrkdwn_in": [
                "fields"
            ],
            "fallback": "You are unable to choose a game",
            "callback_id": "wopr_game",
            "color": "#3AA3E3",
            "attachment_type": "default",
             "fields": [
                {
                    "title": "Slack Channel Members",
                    "value": "<https://kipsearch.slack.com/archives/zz|#zz> \n <https://kipsearch.slack.com/archives/shopping-test|#shopping-test>",
                    "short": true
                },
                {
                    "title": "Emails",
                    "value": "<mailto:hello@kipthis.com|hello@kipthis.com> \n<mailto:alyx@kipthis.com|alyx@kipthis.com> \n<mailto:rachel@kipthis.com|rachel@kipthis.com> \n<mailto:peter@kipthis.com|peter@kipthis.com>",
                    "short": true
                }
            ]
        },
        {
            "title": "Options",
            "mrkdwn_in": [
                    "fields"
            ],
            "text": "",
            "fallback": "You are unable to choose a game",
            "callback_id": "wopr_game",
            "color": "#3AA3E3",
            "attachment_type": "default",
             "fields": [
                {
                    "title": "",
                    "value": "_Add channel_ `add #channel` \n _Remove channel_ `rm #channel`",
                    "short": true
                },
                {
                    "title": "",
                    "value": "_Add email_ `add name@email.com` \n _Remove email_ `rm name@email.com`",
                    "short": true
                }
            ]
        },
        {
            "title": "Delivery Contact",
            "mrkdwn_in": [
                "text"
            ],
            "text": "*Address:* 902 Broadway, New York, NY 10010 \n *Apt/Floor#:* 6th \n *Phone Number:* 718-310-8047 \n *Budget:* $15 (per team member) \n*Delivery Instructions:* _Please come up to the 6th floor_",
            "fallback": "You are unable to choose a game",
            "callback_id": "wopr_game",
            "color": "#3AA3E3",
            "attachment_type": "default",
            "actions": [
                {
                    "name": "chess",
                    "text": "Edit",
                    "type": "button",
                    "value": "chess"
                }
            ]
        },
         {
            "title": "",
            "text": "Update group cart members or delivery contact? Or type `exit`",
            "mrkdwn_in": [
                "text"
            ],
            "fallback": "You are unable to choose a game",
            "callback_id": "wopr_game",
            "color": "#49d63a",
            "attachment_type": "default",
             "attachment_type": "default",
            "actions": [
                {
                    "name": "chess",
                    "text": "Exit Members",
                    "type": "button",
                    "style": "primary",
                    "value": "chess"
                },
                {
                    "name": "chess",
                    "text": "Help",
                    "type": "button",
                    "value": "chess"
                },
                {
                    "name": "chess",
                    "text": ":penguin:",
                    "type": "button",
                    "value": "chess"
                }
            ]
        }
    ]
}