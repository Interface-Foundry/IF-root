//S9A: Display top food choices to participating members 
{
	"text":"`Choza Taqueria` - <https://kipthis.com/menu/url/|View Full Menu> ",
    "attachments": [
		{
			"mrkdwn_in":[
				"text"
				]
		},
       {
            "title": "Tacos – $8.04",
            "text": "Double corn tortillas with your choice of meat or vegetable, topped with fresh cilantro.",
            "fallback": "You are unable to choose a game",
            "callback_id": "wopr_game",
            "color": "#3AA3E3",
            "attachment_type": "default",
            "thumb_url": "http://i.imgur.com/GImiWp2.jpg",
            "actions": [
                {
                    "name": "chess",
                    "text": "Add to Cart",
                    "type": "button",
					"style": "primary",
                    "value": "chess"
                }
            ]
        },
		       {
            "title": "Tostada – $8.22",
            "text": "Crispy corn tortilla topped with black beans, lettuce, salsa, queso fresco and your choice of meat or vegetable.",
            "fallback": "You are unable to choose a game",
            "callback_id": "wopr_game",
            "color": "#3AA3E3",
            "attachment_type": "default",
            "thumb_url": "http://i.imgur.com/GImiWp2.jpg",
            "actions": [
                {
                    "name": "chess",
                    "text": "Add to Cart",
                    "type": "button",
					"style": "primary",
                    "value": "chess"
                }
            ]
        },
		       {
            "title": "Jarritos – $2.75",
            "text": "Tamarind, lime, pineapple, mandarin, grapefruit, mango, sangria, sidral.",
            "fallback": "You are unable to choose a game",
            "callback_id": "wopr_game",
            "color": "#3AA3E3",
            "attachment_type": "default",
            "thumb_url": "http://i.imgur.com/RtHKdqA.jpg",
            "actions": [
                {
                    "name": "chess",
                    "text": "Add to Cart",
                    "type": "button",
					"style": "primary",
                    "value": "chess"
                }
            ]
        },
		{
            "text": "",
            "fallback": "You are unable to choose a game",
            "callback_id": "wopr_game",
            "color": "#3AA3E3",
            "attachment_type": "default",
            "actions": [
                {
                    "name": "chess",
                    "text": "<",
                    "type": "button",
                    "value": "chess"
                },
                {
                    "name": "chess",
                    "text": "More >",
                    "type": "button",
                    "value": "chess"
                },
				 {
                    "name": "chess",
                    "text": "Category",
                    "type": "button",
                    "value": "chess"
                }
            ]
        }
    ]
}