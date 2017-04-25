var Agenda = require('agenda');
var wait = require('co-wait');
var co = require('co');
var config = require('../../config');
var agenda = new Agenda({db: {address: config.mongodb.url}});
var camel = require('./deals/deals');

var db;
const dbReady = require('../db');
dbReady.then((models) => { db = models; })

logging.info('running agenda.js')

var sendDailyDeals = function * () {
  console.log('this is the sendDailyDeals function')
  yield wait(2000);
  console.log('and two seconds later');

  yield dbReady;

  //pull most recent camel deals from db
  var deals = yield camel.getDeals(6);
  logging.info('allDeals', deals)
  deals = [deals.slice(0, 2), deals.slice(2, 4), deals.slice(4, 6)];

  //pull a list of all our users from db
  var users = yield db.UserAccounts.find({});
  yield users.map(function * (user) {
    //create a new email to send
    var daily = yield db.Emails.create({
      recipients: user.email_address,
      sender: 'deals@kip.ai',
      subject: 'Daily Deals',
      template_name: 'daily_deals',
      unsubscribe_group_id: 2275
    })

    console.log('EMAIL:', daily)

    //query for correct cart id
    yield db.Carts.find({}).limit(1)

    //load the template and send it
    logging.info('about to load template');
    yield daily.template('daily_deals', {
      id: '7a43d85c928f',
      deals: deals,
      name: 'hannah.katznelson'
    })
    console.log('loaded template');
    yield daily.send();
  });
}

agenda.define('deals', function (job, done) {
  logging.info('deals!')
  co.wrap(sendDailyDeals)()
    .then(function () {
      done();
    })
    .catch(function (err) {
      console.error('error:', err)
    });
});

agenda.on('ready', function () {
  logging.info('ready, woohoo')
  //clears the incomplete jobs so that they can restart if the server does
  function failGracefully() { //not really working oops -- just delete jobs from db in robomongo!
    agenda.stop(() => process.exit(0));
  }
  process.on('SIGTERM', failGracefully);
  process.on('SIGINT', failGracefully);
  agenda.every('1 day', 'deals');
  // logging.info('about to start agendas');
  agenda.start();
  logging.info('started agendas')
});

module.exports = agenda;
