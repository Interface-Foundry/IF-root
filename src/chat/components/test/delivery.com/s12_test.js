require('co-mocha');
var should = require('should');
var mock_slack = require('./mock_slack_users');
var _ = require('lodash');


/*  
   _____________________  
 /   _____/_   \_____  \ 
 \_____  \ |   |/  ____/ 
 /        \|   /       \ 
/_______  /|___\_______ \
        \/             \/
*/
describe('admin confirms team order after all orders are finished or time is up', () => {

  describe('kip pings admin with team order', () => {
    it('should send a DM message to admin with the team order ', function * () {

        var admin = yield mock_slack.ExistingAdmin()
        var msg = yield admin.receiveTeamOrder()

        msg.should.be.instanceof(Object);
        msg.attachments.should.be.instanceof(Array);
        msg.attachments.length.should.equal(3);

        // -- first item -- //
        _.get(msg, 'attachments[0].title').should.equal("Burger A – $12.95");
        _.get(msg, 'attachments[0].text').should.equal("8 oz. Burger, toasted bun, spicy chipotle mayo, spicy pickled jalapenos, lettuce, tomato, red onions, avocado. Served with home made sauce \n *Quantity: 1*");
        _.get(msg, 'attachments[0].fallback').should.equal("You were unable to load the food item.");
        _.get(msg, 'attachments[0].color').should.equal("#3AA3E3");
        _.get(msg, 'attachments[0].attachment_type').should.equal("default");
        _.get(msg, 'attachments[0].attachment_type').should.equal("http://comps.canstockphoto.com/can-stock-photo_csp21433030.jpg");
        msg.attachments[0].actions.should.have.length(3);
        msg.attachments[0].actions[0].text.should.equal('+');
        msg.attachments[0].actions[1].text.should.equal('-');
        msg.attachments[0].actions[2].text.should.equal('Remove All');


        // -- second item -- //
        _.get(msg, 'attachments[1].title').should.equal("Lunch Special B – $9.99");
        _.get(msg, 'attachments[1].text').should.equal("8 oz. Burger, toasted bun, spicy chipotle mayo, spicy pickled jalapenos, lettuce, tomato, red onions, avocado. Served with home made sauce \n *Quantity: 1*");
        _.get(msg, 'attachments[1].fallback').should.equal("You were unable to load the food item.");
        _.get(msg, 'attachments[1].color').should.equal("#3AA3E3");
        _.get(msg, 'attachments[1].attachment_type').should.equal("default");
        _.get(msg, 'attachments[1].attachment_type').should.equal("https://www.emojibase.com/resources/img/emojis/hangouts/1f371.png");
        msg.attachments[1].actions.should.have.length(2);
        msg.attachments[1].actions[0].text.should.equal('+');
        msg.attachments[1].actions[1].text.should.equal('-');


        // -- cart summary -- //
        _.get(msg, 'attachments[2].text').should.equal("Total: $22.94");
        _.get(msg, 'attachments[2].fallback').should.equal("You were unable to load the cart.");
        _.get(msg, 'attachments[2].color').should.equal("#3AA3E3");
        _.get(msg, 'attachments[2].attachment_type').should.equal("default");
        msg.attachments[2].actions.should.have.length(2);
        msg.attachments[2].actions[0].text.should.equal('Confirm Order');
        msg.attachments[2].actions[0].text.should.equal('< Back');

        describe('admin taps + button on item 1', () => {
          it('should be able to tap a button to increase quantity', function * () {
            msg = yield admin.tap(msg, 0, 0); 
            _.get(msg, 'attachments[1].text').should.equal("8 oz. Burger, toasted bun, spicy chipotle mayo, spicy pickled jalapenos, lettuce, tomato, red onions, avocado. Served with home made sauce \n *Quantity: 3*")
          })
        })

        describe('admin taps - button on item 1', () => {
          it('should be able to tap a button to decrease quantity', function * () {
            msg = yield admin.tap(msg, 0, 1) ;
            _.get(msg, 'attachments[1].text').should.equal("8 oz. Burger, toasted bun, spicy chipotle mayo, spicy pickled jalapenos, lettuce, tomato, red onions, avocado. Served with home made sauce \n *Quantity: 2*")
          })
        })

        describe('admin taps - button on item 2', () => {
          it('the item should disappear from the card if the quantity becomes zero.', function * () {
            msg = yield admin.tap(msg, 1, 1) ;
            msg.attachments.length.should.equal(2);              
          })
        })

        describe('admin taps "Remove all" button', () => {
          it('should remove all quantities of item 1 and cart should say empty', function * () {
            yield admin.tap(msg, 0, 0); 
            msg = yield admin.tap(msg, 1, 2) 
            _.get(msg, 'attachments[1].text').should.equal("Your Cart is Empty.")
          })
        })

    })
  })
});