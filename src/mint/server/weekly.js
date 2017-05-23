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
    return !c.items.length;
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
      value: 88
    })

    console.log('templated email')

    yield email.send();
    console.log('email sent')
  })

  console.log('all receipts sent')

  // TODO send out reengagement email
  // TODO with checkout link
})
