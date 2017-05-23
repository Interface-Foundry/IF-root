const co = require('co')

var db;
const dbReady = require('../db');
dbReady.then((models) => { db = models; }).catch(e => console.error(e));

co(function * () {
  console.log('running')
  yield dbReady;
  var carts = yield db.Carts.find({}).populate('items').populate('leader');
  console.log('got carts')
  var emptyCarts = carts.filter(function (c) {
    return !c.items.length && !c.reminded
  })
  console.log('EMPTY CARTS:', carts);

  yield emptyCarts.map(function * (cart) {

    console.log('about to create email')

    var email = yield db.Emails.create({
      sender: 'hello@kipthis.com',
      recipients: cart.leader.email_address,
      subject: `Add items to ${cart.name}!`,
      unsubscribe_group_id: 2583
    })

    console.log('created email')

    yield email.template('reengagement', {
      cart_id: cart.id,
      cart: cart,
      baseUrl: `https://18e137de.ngrok.io`,
      username: cart.leader.username || cart.leader.email_address.split('@')[0]
    })

    console.log('templated email')

    yield email.send();
    console.log('email sent')

    cart.reminded = true;
    yield cart.save();
  })

  console.log('all receipts sent')

  // TODO send out reengagement email
  // TODO with checkout link
})
