const CronJob = require('cron').CronJob
const co = require('co')
const Invoice = require('./payments/Invoice')

var db;
const dbReady = require('../db');
dbReady.then((models) => { db = models; }).catch(e => console.error(e));

if (process.env.NODE_ENV !== 'production') {
  // reminder sent out once a day after the invoice is created
  var reminderJob = new CronJob('0 0 12 * * *', function () {
    co(function * () {
      var invoices = yield db.Invoices.find({
        paid: false
      })
      yield invoices.map(function * (inv) {
        // make sure we're not sending out a reminder for an invoice that was just sent out
        var created = new Date(Date.parse(inv.createdAt))
        var now = new Date()
        if (now >= created.setDate(created.getDate() + 1)) {
          var invoice = yield Invoice.GetById(inv.id)
          yield invoice.sendEmailReminder()
        }
      })
    })
  }, null, true);

  reminderJob.start()
  logging.info('payment reminder job scheduled')
}
