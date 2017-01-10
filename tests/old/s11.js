require('co-mocha')
var should = require('should')
var mock = require('../mock_slack_users')
var _ = require('lodash')


/*______    __     __
.' ____ \  /  |   /  |
| (___ \_| `| |   `| |
 _.____`.   | |    | |
| \____) | _| |_  _| |_
 \______.'|_____||_____|
*/
describe('Confirm personal order', () => {
  before(function * () {
    this.timeout(5000)
    yield mock.setup()
  })
  it('should return the items you ordered in a single message', function * () {
    var user = yield mock.ExistingUser()
    var msg = yield user.text('food.cart.personal')

    msg.should.deepEqual({
      "text": "*Confirm Your Order* for <https://goo.gl/IDTFMq|Lily's>",
      "attachments": [
        {
          "title": "",
          "image_url": "https://storage.googleapis.com/kip-random/kip-my-cafe-cart.png",
          "callback_id": "default"
        },
        {
          "title": "L18.  General Tso's Chicken Dinner Combo – $13.40",
          "text": "Hot and spicy.",
          "callback_id": 410,
          "color": "#3AA3E3",
          "attachment_type": "default",
          "actions": [
            {
              "name": "food.cart.personal.quantity.add",
              "text": "+",
              "type": "button",
              "value": 0
            },
            {
              "name": "food.null",
              "text": 1,
              "type": "button",
              "value": 410
            },
            {
              "name": "food.cart.personal.quantity.subtract",
              "text": "—",
              "type": "button",
              "value": 0,
              "confirm": {
                "title": "Remove Item",
                "text": "Are you sure you want to remove \"L18.  General Tso's Chicken Dinner Combo\" from your personal cart?",
                "ok_text": "Remove it",
                "dismiss_text": "Keep it"
              }
            }
          ]
        },
        {
          "title": "9. Dumpling – $6.95",
          "text": "Your choice of chicken, shrimp, roast pork, beef, or vegetable. Prepared steamed or fried.",
          "callback_id": 24,
          "color": "#3AA3E3",
          "attachment_type": "default",
          "actions": [
            {
              "name": "food.cart.personal.quantity.add",
              "text": "+",
              "type": "button",
              "value": 1
            },
            {
              "name": "food.null",
              "text": 1,
              "type": "button",
              "value": 24
            },
            {
              "name": "food.cart.personal.quantity.subtract",
              "text": "—",
              "type": "button",
              "value": 1,
              "confirm": {
                "title": "Remove Item",
                "text": "Are you sure you want to remove \"9. Dumpling\" from your personal cart?",
                "ok_text": "Remove it",
                "dismiss_text": "Keep it"
              }
            }
          ]
        },
        {
          "title": "9. Dumpling – $13.90",
          "text": "Your choice of chicken, shrimp, roast pork, beef, or vegetable. Prepared steamed or fried.",
          "callback_id": 24,
          "color": "#3AA3E3",
          "attachment_type": "default",
          "actions": [
            {
              "name": "food.cart.personal.quantity.add",
              "text": "+",
              "type": "button",
              "value": 2
            },
            {
              "name": "food.null",
              "text": 2,
              "type": "button",
              "value": 24
            },
            {
              "name": "food.cart.personal.quantity.subtract",
              "text": "—",
              "type": "button",
              "value": 2
            }
          ]
        },
        {
          "text": "",
          "fallback": "You are unable to choose a game",
          "callback_id": "wopr_game",
          "color": "#49d63a",
          "attachment_type": "default",
          "actions": [
            {
              "name": "food.cart.personal.confirm",
              "text": "✓ Confirm: $34.25",
              "type": "button",
              "value": "chess",
              "style": "primary"
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
    })
  })
})
