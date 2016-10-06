{
	"text": "`Alyx` is collecting lunch suggestions, vote now!",
    "attachments": [
        {
            "title": "Delivery Contact",
            "mrkdwn_in": [
                "text"
            ],
            "text": "Type what you want or tap a button",
            "fallback": "You are unable to choose a game",
            "callback_id": "wopr_game",
            "color": "#3AA3E3",
            "attachment_type": "default",
            "actions": [
                {
                    "name": "chess",
                    "text": "Thai",
                    "type": "button",
                    "value": "chess"
                },
				{
                    "name": "chess",
                    "text": "Sushi",
                    "type": "button",
                    "value": "chess"
                },
				{
                    "name": "chess",
                    "text": "Mexican",
                    "type": "button",
                    "value": "chess"
                },
				{
                    "name": "chess",
                    "text": "Surprise Me",
                    "type": "button",
                    "value": "chess"
                },
				{
                    "name": "chess",
                    "text": "× No Lunch for Me",
					"style": "danger",
                    "type": "button",
                    "value": "chess"
                }
            ]
        }
    ]
}