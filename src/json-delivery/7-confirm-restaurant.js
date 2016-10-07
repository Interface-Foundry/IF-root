{
    "attachments": [
		{
			"mrkdwn_in":[
				"text"
				],
            "text": "I'll collect orders for `Choza Taqueria`",
            "fallback": "n/a",
            "callback_id": "wopr_game",
            "color": "#3AA3E3",
            "attachment_type": "default",
            "actions": [
                {
                    "name": "902 Broadway 6th fl",
                    "text": "Confirm",
                    "type": "button",
					"style": "primary",
                    "value": "chess"
                },
                {
                    "name": "maze",
                    "text": "View Team Members",
                    "type": "button",
                    "value": "maze"
                },
                {
                    "name": "war",
                    "text": "< Change Restaurant",
                    "type": "button",
                    "value": "war",
                    "confirm": {
                        "title": "Are you sure?",
                        "text": "Wouldn't you prefer a good game of chess?",
                        "ok_text": "Yes",
                        "dismiss_text": "No"
                    }
                }
            ]
        }
    ]
}