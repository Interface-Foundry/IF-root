var app     = require('express')();
var colors  = require('colors');
var server  = require('http').createServer(app).listen(process.env.PORT || 5000);

var InstagramStream = require('instagram-realtime');
// var secrets = require('./secrets.json');

// console.log(secrets);

var stream = InstagramStream(
  server,
  {
    client_id     : '9069a9b469824abea0d0cce7acb51fa8',
    client_secret : 'cb7a9f7cdb67498bbf0641b6d7489604',
    url           : 'secrets.url',
    callback_path : 'callback'
  }
);

stream.on('unsubscribe', function (req, resp) {
  console.log('unsubscribe'.green);
  stream.subscribe({ tag : 'yolo' });
});

stream.on('new', function (response, body) {

  console.log('asdf');
}
stream.on('new/error', function (error, response, body) {
}

// stream.on('new', function (req, body) {
//   console.log(body);
// });

// app.get('/', function (req, resp) {
//   resp.set('Content-Type', 'text/plain; charset=utf-8');
//   resp.end('🍕🏊');
// });

stream.unsubscribe('all');