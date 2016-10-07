{
    "attachments": [
		{
			"title": "",
			"image_url":"http://i.imgur.com/89L2srg.png"
		},	
        {
            "text": "Great! Which address is this for?",
            "fallback": "You are unable to choose a game",
            "callback_id": "wopr_game",
            "color": "#3AA3E3",
            "attachment_type": "default",
            "actions": [
                {
                    "name": "chess",
                    "text": "902 Broadway, New York, NY",
                    "type": "button",
                    "value": "chess"
                },
                {
                    "name": "maze",
                    "text": "43 Main St. New York",
                    "type": "button",
                    "value": "maze"
                },
				{
                    "name": "maze",
                    "text": "New +",
                    "type": "button",
                    "value": "maze"
                }
            ]
        }
    ]
}