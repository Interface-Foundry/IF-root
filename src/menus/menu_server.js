require('kip');
require('colors');

//loads basic server structure
var bodyParser = require('body-parser');
var express = require('express');
var app = express();
var jsonParser = bodyParser.json();
var path = require('path');
var volleyball = require('volleyball');
var crypto = require('crypto');
var co = require('co');
var _ = require('lodash');

var cafeMenu = require('../chat/components/delivery.com/Menu.js');
var menuURL = 'localhost:8001/session';

app.use(volleyball);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(jsonParser);

app.use('/', express.static('template'));
app.use('/ang', express.static('ang'));

var MenuSession = db.Menu_session;
var Menu = db.Menu;
var Merchant = db.Merchant;
// console.log(Menu);
// console.log(Merchant);

//require('../chat/components/delivery.com/scrape_menus.js');
//
// var menus = {};
// var names = {};

//handle post request with a binder full of data
app.post('/cafe', (req, res) => co(function * () {

  var ms = new MenuSession({
    session_token: crypto.randomBytes(256).toString('hex') // gen key inside object
  });

  var rest_id = req.body.rest_id;
  var team_id = req.body.team_id; //etc, or whatever we need

  var result = yield Menu.findOne({merchant_id: rest_id})

  //console.log('got raw menu data');

  ms.menu.data = cafeMenu(result.raw_menu).allItems();

  ms.merchant.id = rest_id;
  ms.merchant.data = yield Merchant.findOne({id: rest_id}).select('data.summary.name');

  console.log('ms', ms);

  yield ms.save();

  //return a url w a key in a query string
  res.send(menuURL + '#?k=' + ms.session_token);
}));

//when user hits that url up, post to /session w/key and gets correct pg

app.post('/session', (req, res) => co(function * () {
  if (req.query && req.query.k) {
    var t = req.query.k.replace(/[^\w\s]/gi, '') // clean special char
    try {
      var ms = yield MenuSession.findOne({session_token: t});
      res.send(JSON.stringify(ms))
    } catch (err) {
      logging.error('catching error in session ', err)
    }
  }
}))

// app.get('/session', function (req, res) {
//   res.send(menus[req.body.k]);
// });
//
// app.post('/session/name', function (req, res) {
//   console.log(names);
//   res.send(names[req.body.k]);
// });

//TODO: error handling for promises

var port = 8001
app.listen(port, function () {
  console.log('Listening on ' + port)
})
