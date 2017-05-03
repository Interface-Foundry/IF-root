var CronJob = require('cron').CronJob;
var wait = require('co-wait');
var co = require('co');
var camel = require('./deals');

var db;
const dbReady = require('../../db');
dbReady.then((models) => { db = models; })

var sendDailyDeals = function * () {
  if (!process.env.SEND_DAILY_DEALS) {
    console.log('set SEND_DAILY_DEALS=1 in your shell to send daily deal emails')
    return Promise.resolve()
  }
  yield dbReady;
  console.log('starting sendDailyDeals')

  //pull most recent camel deals from db
  var deals = yield camel.getDeals(6);
  logging.info('allDeals', deals)
  deals = [deals.slice(0, 2), deals.slice(2, 4), deals.slice(4, 6)];

  //pull a list of all our users from db
  var users = yield db.UserAccounts.find({});

  yield users.map(function * (user) {
    // Get the user's most recent cart
    const memberCarts = yield db.carts_members__user_accounts_id.find({
      user_accounts_id: user.id
    })

    const memberCartsIds = memberCarts.map( c => c.carts_members )

    // find the single most recently created cart where their user id appears in the leader or member field
    const carts = yield db.Carts.find({
      where: {
        or: [
          { leader: user.id },
          { id: memberCartsIds }
        ]
      },
      limit: 1,
      sort: 'createdAt DESC'
    }).populate('items').populate('leader').populate('members')

    // What if they don't have a cart?
    // undefined behavior becuase there's no way to sign in without viewing a cart
    // as either a leader or member
    if (!carts[0]) {
      throw new Error('Somehow there is a user without a cart')
    }

    //create a new email to send
    var daily = yield db.Emails.create({
      recipients: user.email_address,
      subject: 'Today\'s Top Deals from Kip',
      unsubscribe_group_id: 2275,
      cart: carts[0]
    })

    //load the template and send it
    yield daily.template('daily_deals', {
      cart: carts[0],
      deals: deals,
      name: user.email_address.split('@')[0]
    })

    yield daily.send();
  });
}

// Start the cron job, 10 am server time
var job = new CronJob('0 0 10 * * *', () => co(sendDailyDeals).catch(e => {
  console.error(e)
}))

// this just says that the job is enabled, it doesn't run it right this minute
// waits for the cron time to trigger before running.
if (process.env.SEND_DAILY_DEALS) {
  logging.info('setting up send-daily-deals.js')
  job.start()
}

module.exports = job
