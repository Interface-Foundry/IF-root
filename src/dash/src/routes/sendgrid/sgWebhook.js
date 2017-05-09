const rp = require('request-promise');
const sg_const = require('./sg_const');
// //test route
// router.get('/test', function (req, res) {
//   console.log('this is a test');
//   res.send('this is a test');
// });
//route sg will post to
// router.post('/', function (req, res) {
//   console.log('req.body', req.body);
//   res.send('posted at by sendgrid');
// });
//~~~~~post request to send-grid api setting up the webhook~~~~~//
var options = {
  method: 'POST',
  uri: 'https://api.sendgrid.com/api/filter.setup.json',
  form: {
    api_user: sg_const.api_user,
    api_key: sg_const.api_key,
    name: "eventnotify",
    processed: 1,
    dropped: 1,
    deferred: 1,
    delivered: 1,
    bounce: 1,
    click: 1,
    open: 1,
    unsubscribe: 1,
    group_unsubscribe: 1,
    group_resubscribe: 1,
    spamreport: 1,
    url: "https://0a8370bb.ngrok.io/sg"
  }
};
rp(options)
  .then(function (result) {
    logging.info('successfully connected to sendgrid webhook');
    console.log(result);
  })
  .catch(function (error) {
    logging.error('error with sendgrid webhook', error);
  });
// //~~~~~~~~~~//
// module.exports = router;
