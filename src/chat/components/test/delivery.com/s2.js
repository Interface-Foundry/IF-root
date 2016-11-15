var mock = require('../mock_slack_users.js')
var should = require('should')
require('co-mocha')
var _ = require('lodash')

describe('greeting', () => {
  before(function * () {
    this.timeout(5000)
    yield mock.setup()
  })
  it('should allow an admin to start an order for delivery', function * () {
    this.timeout(10000)
    var user = yield mock.Admin()
    user.chatuser.id.should.equal('admin_yolo')
    user.chatuser.team_id.should.equal('yolo')

    // Start the food convo with the admin
    var msg = yield user.text('food.begin', {expect: 2})

    // choose a saved address
    msg = yield user.tap(msg[1], 0, 0)

    // S2
    _.get(msg, 'attachments[0].text', '').should.equal('Cool! You selected `21 Essex St 10002`. Delivery or Pickup?')
    _.get(msg, 'attachments[0].actions.length', 0).should.equal(3)
    _.get(msg, 'attachments[0].actions[0].text', '').should.equal('Delivery')
    _.get(msg, 'attachments[0].actions[1].text', '').should.equal('Pickup')
    _.get(msg, 'attachments[0].actions[2].text', '').should.equal('< Change Address')

    // tap delivery
    msg = yield user.tap(msg, 0, 0, {expect: 2})

    console.log(JSON.stringify(msg, null, 2))

    _.get(msg, '[0].text', '').should.equal('Searching your area for good food...')
    _.get(msg, '1.attachments.0.text', '').replace(/goo.gl\/[A-Z]+/i).should.equal('You ordered `Delivery` from <https://|*Lily\'s*> recently, order again?')
    _.get(msg, '1.attachments.1.text', '').should.equal('*Tip:* `✓ Start New Poll` polls your team on what type of food they want.')
/*
    msg.should.equal([
      {
        "text": "Searching your area for good food..."
      },
      {
        "attachments": [
          {
            "text": "You ordered `Delivery` from <https://goo.gl/IDTFMq|*Lily's*> recently, order again?",
            "image_url": "https://storage.googleapis.com/if-kip-chat-images/delivery%2Fslack%2F483de8ed5b7a480b81d9e6e4222ca70a",
            "color": "#3AA3E3",
            "callback_id": "27957",
            "fallback": "You are unable to choose a restaurant",
            "attachment_type": "default",
            "mrkdwn_in": [
              "text"
            ],
            "actions": [
              {
                "name": "food.admin.restaurant.confirm",
                "text": "✓ Choose",
                "type": "button",
                "style": "primary",
                "value": "27957"
              }
            ]
          },
          {
            "mrkdwn_in": [
              "text"
            ],
            "text": "*Tip:* `✓ Start New Poll` polls your team on what type of food they want.",
            "fallback": "You are unable to choose a game",
            "callback_id": "wopr_game",
            "color": "#3AA3E3",
            "attachment_type": "default",
            "actions": [
              {
                "name": "passthrough",
                "text": "✓ Start New Poll",
                "style": "primary",
                "type": "button",
                "value": "food.poll.confirm_send"
              },
              {
                "name": "passthrough",
                "text": "× Cancel",
                "type": "button",
                "value": "food.exit.confirm",
                "confirm": {
                  "title": "Leave Order",
                  "text": "Are you sure you want to stop ordering food?",
                  "ok_text": "Don't order food",
                  "dismiss_text": "Keep ordering food"
                }
              }
            ]
          }
        ]
      }
    ])
    */


    // // S2B after never having ordered before
    // _.get(msg, '0.text', '').should.equal("Searching your area for good food...")
    // _.get(msg, '1.attachments[0].text', '').should.equal('')
    // // _.get(msg, 'attachments[0].actions.length', 0).should.equal(1)
    // // _.get(msg, 'attachments[0].actions[0].text', '').should.equal('Choose Restaurant')
    // _.get(msg, 'attachments[1].text', '').should.equal('*Tip:* `✓ Start New Poll` polls your team on what type of food they want.')
    // _.get(msg, 'attachments[1].actions[0].text', '').should.equal('✓ Start New Poll')
    // _.get(msg, 'attachments[1].actions[1].text', '').should.equal('See More')
    // _.get(msg, 'attachments[1].actions[2].text', '').should.equal('× Cancel')
  })
})
