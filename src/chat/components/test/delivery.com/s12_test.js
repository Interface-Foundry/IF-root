var should = require('should')
var mock_slack = require('./mock_slack')

describe('admin confirms team order after all orders are finished or time is up', () => {
  
  describe('kip pings admin with team order', () => {
    it('should locate admin user and send a DM message wit hthe team order ', function * () {
        // create a new user with no conversation history
        var user = yield mock_slack.User();
        // start the conversation with a text to kip
        var reply = yield user.text("i'm hungry"); // TODO maybe add a button tap test too to trigger this mode
        // "reply" is the formatted slack message, so exactly what we send to slack with attachments etc 
        reply.should.be.instanceof(Array);
        reply.length.should.equal(2);
        // check for sticker
        _.get(reply, '0.attachments.0.image_url').should.equal('kip_eats_sticker.png')
        // check the text
        _.get(reply, '1.text').should.equal("Great! Which address is this for?")
        // check the buttons
        _.get(reply, '1.attachments.1.actions.text').should.equal('')
        reply.attachments[0].actions.should.have.length(2)
        reply.attachments[0].actions[0].text.should.equal('Enter New Address +')
        // etc
    })
  })


  















})

describe('initializing the food search conversation for existing user', () => {
  it('should pick up on some common phrases indicating that you want food', function * () {
    // create a new user with no conversation history
    var user = yield mock_slack.ExistingUser()

    // start the conversation with a text to kip
    var reply = yield user.text("i'm hungry") // TODO maybe add a button tap test too to trigger this mode

    // "reply" is the formatted slack message, so exactly what we send to slack with attachments etc 
    reply.should.be.instanceof(Array)
    reply.length.should.equal(2)

    // check for sticker
    _.get(reply, '0.attachments.0.image_url').should.equal('kip_eats_sticker.png')
    
    // check the text
    _.get(reply, '1.text').should.equal("Great! Which address is this for?")

    // check the buttons
    _.get(reply, '1.attachments.1.actions.0.text').should.equal('902 Broadway 6th floor')
    _.get(reply, '1.attachments.1.actions.1.text').should.equal('43 Main st New York, NY')
    _.get(reply, '1.attachments.1.actions.2.text').should.equal('New +')

  })
})

describe('choosing an address for existing user', () => {
  it('should be able to tap a button to choose a pre-saved address', function * () {
    // create a new user with no conversation history
    var user = yield mock_slack.ExistingUser()

    // start the conversation with a text to kip
    var reply = yield user.text("i'm hungry") // TODO maybe add a button tap test too to trigger this mode

    // tap the broadway button, which is the first button aka action
    var replies = yield user.tap(reply, 1, 0) // to tap reply.attachments[1].actions[0]

    // make sure that the previous message has been replaced (aka the white arrow)
    _.get(replies, 'replacementMessage.text').should.equal('902 Broadway 6th floor New York, NY 10010.\n Delivery or Pickup?')
    
    // test buttons like before
    _.get()

    // assert there was not a new message (aka black arrow)
    should.not.exist(replies.newMessages)

  })
})


describe('merchant search', () => {
  it('should allow you to type a new address', function * () {
    // create a new user with no conversation history
    var user = yield mock_slack.User()

    // start the conversation
    yield user.text('food')

    // kip would then reply "OK Let's Eat! What address should I use?" etc
    var reply = yield user.text('902 Broadway 10010')
    reply.text.should.equal('OK, here are some options near 902 Broadway 10010')

  // etc
  })

  it('should allow you to select an old address with a button click', function * () {
    // create a new user with no conversation history
    var user = yield mock_slack.User()

    // start the conversation
    var message = yield user.text('food')

    // kip would then reply "OK Let's Eat! What address should I use?" etc
    var reply = yield user.click(message.attachments[0].actions[0])
    reply.text.should.equal('OK, here are some options near 902 Broadway 10010')

  // etc
  })
})