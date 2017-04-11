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

  var deals = yield camel.getDeals(6);
  logging.info('allDeals', deals)
  deals = [deals.slice(0, 2), deals.slice(2, 4), deals.slice(4, 6)];

  var daily = yield db.Emails.create({
    recipients: 'hannah.katznelson@kipthis.com',
    sender: 'deals@kip.ai',
    subject: 'Daily Deals',
    template_name: 'daily_deals'
    // message_html: '<html><body>Daily Deals; Be HUMBLE.</body></html>'
  })

  logging.info('about to load template');
  yield daily.template('daily_deals', {
    id: '7a43d85c928f',
    deals: deals,
    name: 'hannah.katznelson'
  })
  console.log('loaded template');
  yield daily.send();
}
//
// agenda.define('test', function (job, done) {
//   logging.info('this is a test');
//   done();
// })

agenda.define('deals', function (job, done) {
  logging.info('deals!')
  co.wrap(sendDailyDeals)()
    .then(function () {
      done();
    })
    .catch(function (err) {
      console.error('error:', err)
    });
  // var deals;
  // dbReady.then(function () {
  //   logging.info('db ready')
  // })
  // .then(function () {
  //   var allDeals = 'this is a test'; //this is being returned or w/e
  //   return camel.getDeals(6, 2);
  // })
  // .then(function (allDeals) {
  //   logging.info('allDeals', allDeals)
  //   deals = [allDeals.slice(0, 2), allDeals.slice(2, 4), allDeals.slice(4, 6)];
  // })
  // .then(function () {
  //   return db.Emails.create({
  //     recipients: 'hannah.katznelson@kipthis.com',
  //     sender: 'deals@kip.ai',
  //     subject: 'Daily Deals',
  //     // template_name: 'daily_deals'
  //     message_html: '<html><body>Daily Deals; Be HUMBLE.</body></html>'
  //   })
  // })
  // .then(function (daily) {
  //   logging.info('about to load template');
  //   daily.template('daily_deals', {
  //     id: '7a43d85c928f',
  //     deals: deals
  //   })
  //   return daily;
  // })
  // .then(function (daily) {
  //   daily.send();
  //   logging.info('daily deal sent');
  // })
  // .then(function () {
  //   logging.info('done!');
  //   return done();
  // })
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
