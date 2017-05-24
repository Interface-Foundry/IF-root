const co = require('co')
const crontab = require('node-crontab')

var db;
const dbReady = require('../db');
dbReady.then((models) => { db = models; }).catch(e => console.error(e));

// try to reengage cart owners at 11:00 on weekdays
// var reengageJob = crontab.scheduleJob('0 11 * * 1-5', 'function')
var reengageJob = crontab.scheduleJob('* * * * *', function () {
  co(reengage)
})

var reengage = function * () {
  console.log('running reengage')
  yield dbReady;
  var carts = yield db.Carts.find({}).populate('items').populate('leader');

  // filter for empty carts
  var emptyCarts = carts.filter(function (c) {
    return !c.items.length && !c.leader.reminded
  })

  // filter out carts less than a week old
  emptyCarts = emptyCarts.filter(function (cart) {
    var monthCreated = cart.createdAt.getMonth()
    var dateCreated = cart.createdAt.getDate()
    var yearCreated = cart.createdAt.getFullYear()
    var now = new Date()
    var elapsedDays = (now.getDate() - dateCreated) + (30*(now.getMonth() - monthCreated)) + (360*(yearCreated - now.getFullYear()));
    console.log('elapsed days:', elapsedDays)
    return elapsedDays >= 7
  })

  // email leaders of the carts we've selected
  yield emptyCarts.map(function * (cart) {
    var email = yield db.Emails.create({
      sender: 'hello@kipthis.com',
      recipients: cart.leader.email_address,
      subject: `Add items to ${cart.name}!`,
      unsubscribe_group_id: 2583
    })

    yield email.template('reengagement', {
      cart_id: cart.id,
      cart: cart,
      baseUrl: `https://mint-dev.kipthis.com`,
      username: cart.leader.username || cart.leader.email_address.split('@')[0]
    })

    yield email.send();
    console.log('email sent')

    // flip a reminded flag on the cart so that we don't email more than once per cart
    cart.leader.reminded = true;
    yield cart.leader.save();
  })

  console.log('all emails sent')
}
