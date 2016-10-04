require('co-mocha')
var should = require('should')
var mock_slack = require('../mock_slack_users')
var _ = require('lodash')

// procedes up to S7
function * chooseRestaurantSomehow(admin, restaurantToPick) {
  var reply = yield admin.text('food')
  var res = yield admin.tap(reply, 1, 0)
  // TODO
  // ...
  return admin.tap(reply, 2, 0) // tap the third attachment's first button i guess
}


/*______   _______  
.' ____ \ |  ___  | 
| (___ \_||_/  / /  
 _.____`.     / /   
| \____) |   / /    
 \______.'  /_/     
*/
describe.skip('Confirm restaurant choice', () => {
  describe('participation prompt', () => {
    it('should display "collecting food now message" to the admin', function * () {
      var admin = yield mock_slack.ExistingUser()
      var res = yield chooseRestaurantSomehow(admin, "Dos Toros Taqueria")
      should.not.exist(res.replacementMessage)
      _.get(res, 'newMessages[0].text', 0).should.equal('Confirm Restaurant')
      _.get(res, 'newMessages[0].attachments[0].text', 0).should.equal("I'll collect orders for Dos Toros Taqueria")
      _.get(res, 'newMessages[0].attachments[0].actions[0].text', 0).should.equal('Confirm')
      _.get(res, 'newMessages[0].attachments[0].actions[1].text', 0).should.equal('Change Restaurant')
    })  
  })
})


/*______     ____    
.' ____ \  .' __ '.  
| (___ \_| | (__) |  
 _.____`.  .`____'.  
| \____) || (____) | 
 \______.'`.______.'                    
*/
describe('Confirm restaurant participation in the order', () => {
  it('should show the right restuarant and stuff', function * () {
    var user = yield mock_slack.ExistingUser()
    var msg = yield user.text('test.s8')

    // check the message format
    _.get(msg, "text", '').should.equal("`Alyx` chose `Choza Taqueria` - Mexican, Southwestern - est. wait time 45-55 min")
    _.get(msg, "attachments[0].text", '').should.equal("Want to be in this order?")
    
    // check the buttons
    _.get(msg, "attachments[0].actions[0].text", '').should.equal("Yes")
    _.get(msg, "attachments[0].actions[1].text", '').should.equal("No")

    // the "no" should have a confirmation
    _.get(msg, "attachments[0].actions[1].confirm.text", '').should.equal("Are you sure you don't want lunch?")
  })

  it.skip('should remove the message when user taps No', function * () {
    var user = yield mock_slack.ExistingUser()
    var admin = yield mock_slack.ExistingAdmin()
    automateRestaurantChoice(admin, "Dos Toros Taqueria")
    var msg = yield user.awaitMessage()
    var res = yield user.tap(msg, 0, 1)

    // no new messages, it's just ... gone
    should.not.exist(res.newMessages)

    // message gets replaced with empty string i guess TODO is this right way to check? seems weird
    res.replacementMessage.should.equal('')
  })

  it('should move on when user taps Yes', function * () {
    var user = yield mock_slack.ExistingUser()
    var msg = yield user.text('test.s8')
    msg = yield user.tap(msg, 0, 0)

    // new message received
    msg.text.should.equal('`Choza Taqueria` - <https://kipthis.com/menu/url/|View Full Menu>')
    
  })
})

/*______    ______   
.' ____ \ .' ____ '. 
| (___ \_|| (____) | 
 _.____`. '_.____. | 
| \____) || \____| | 
 \______.' \______,'
*/
describe('Display top food choices to participating members', () => {
  it('should display items according to their preferences', function * () {
    // grab an existing user
    var user = yield mock_slack.ExistingUser()
    var msg = yield user.goto('S9')

    // check the top text
    msg.text.should.equal("`Choza Taqueria` - <https://kipthis.com/menu/url/|View Full Menu>")
    
    // check the first item in the Menu (0th is empty)
    _.get(msg, 'attachments[1].text', '').should.equal("Double corn tortillas with your choice of meat or vegetable, topped with fresh cilantro.")
    //_.get(msg, 'attachments[1].image_url', '').should.equal("https://amazingassburrito.com/selfie.png")
    _.get(msg, 'attachments[1].actions[0].text', '').should.equal("Add to Cart")

    // check the button menu
    _.get(msg, 'attachments[4].actions[0].text', '').should.equal("More >")
    _.get(msg, 'attachments[4].actions[1].text', '').should.equal("Category")

    // try clicking the "more" button
    msg = yield user.tap(msg, 4, 0)
    msg.text.should.equal('`Choza Taqueria` - <https://kipthis.com/menu/url/|View Full Menu>')

    // try clicking the "category" button
    msg = yield user.tap(msg, 4, 1)

  })


})


/*______    __     ____    
.' ____ \  /  |  .'    '.  
| (___ \_| `| | |  .--.  | 
 _.____`.   | | | |    | | 
| \____) | _| |_|  `--'  | 
 \______.'|_____|'.____.'
*/
describe.skip("Choose sub-options for item", () => {
  it('should display subchoices when you click Add to Cart', function * () {
    // grab an existing user
    var user = yield mock_slack.ExistingUser()
    var msg = yield user.goto('S9')
    var submenu = yield user.tap(msg, 1, 0)

    
  })
})

/*______    __     __    
.' ____ \  /  |   /  |   
| (___ \_| `| |   `| |   
 _.____`.   | |    | |   
| \____) | _| |_  _| |_  
 \______.'|_____||_____| 
*/
describe.skip('Confirm personal order', () => {
  it('should return the items you ordered in a single message', function * () {
    var msg = yield orderTwoItemsSomehow()

    // top message
    msg.text.should.equal('Your Order for Dos Toros Taqueria')

    // first ordered item
    _.get('msg.attachments[0].text', '').should.equal('todo put real thing here')
    _.get('msg.attachments[0].actions[0].text', '').should.equal('Remove')

    // second ordered item
    _.get('msg.attachments[1].text', '').should.equal('todo put real thing here')
    _.get('msg.attachments[1].actions[0].text', '').should.equal('Remove')

    // total
    _.get('msg.attachments[2].text', '').should.equal('Total: $10000000000 todo')
    _.get('msg.attachments[2].actions[0].text', '').should.equal('Confirm Order')
    _.get('msg.attachments[2].actions[1].text', '').should.equal('< Back')

  })
})