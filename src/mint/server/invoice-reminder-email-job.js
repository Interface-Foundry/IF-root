const CronJob = require('cron').CronJob
const co = require('co')
const Invoice = require('./payments/Invoice')

var db;
const dbReady = require('../db');
dbReady.then((models) => { db = models; }).catch(e => console.error(e));

if (process.env.NODE_ENV !== 'production') {
  // reminder sent out once a day after the invoice is created
  var reminderJob = new CronJob('0 0 12 * * *', function () {
    logging.info('cron job executing')
    co(function * () {
      var invoices = yield db.Invoices.find({
        paid: false
      })
      logging.info('INVOICES', invoices)
      yield invoices.map(function * (inv) {
        var created = new Date(Date.parse(inv.createdAt))
        var now = new Date()
        if (now >= created.setDate(created.getDate() + 1)) {
          logging.info('old enough:', inv)
          var invoice = yield Invoice.GetById(inv.id)
          yield invoice.sendEmailReminder()
        }
      })
    })
  }, null, true);

  reminderJob.start()

  logging.info('payment reminder job scheduled')
}
