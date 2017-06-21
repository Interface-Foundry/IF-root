// const CronJob = require('cron').CronJob
// const co = require('co')
// const Invoice = require('./payments/Invoice')
//
// var db;
// const dbReady = require('../db');
// dbReady.then((models) => { db = models; }).catch(e => console.error(e));
//
// logging.info('invoice reminder file required')
//
// if (process.env.NODE_ENV !== 'production') {
//   logging.info('loyalty loyalty loyalty')
//   // reminder sent out once a day after the invoice is created
//   var reminderJob = new CronJob('1 * * * * *', function () {
//     logging.info('cron job executing')
//     co(function * () {
//       var invoices = yield db.Invoices.find({paid: false})
//       yield invoices.map(function * (inv) {
//         var invoice = yield Invoice.GetById(inv.id)
//         yield invoice.sendEmailReminder()
//       })
//     })
//   }, null, true);
//
//   reminderJob.start()
//
//   logging.info('payment reminder job scheduled')
// }
