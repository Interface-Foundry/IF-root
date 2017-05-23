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
    yield db.Emails.create({
      sender: 'hello@kipthis.com',
      recipients: cart.leader.email_address
    })
  })


  // TODO send out reengagement email
  // TODO with checkout link
})
