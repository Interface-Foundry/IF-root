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

var Menu = require('../chat/components/delivery.com/Menu.js');
var menuURL = 'localhost:8001/session'

app.use(volleyball);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(jsonParser);

app.use('/', express.static('template'));
app.use('/ang', express.static('ang'));

//require('../chat/components/delivery.com/scrape_menus.js');

var menus = {};
var names = {};

//handle post request with a binder full of data
app.post('/cafe', function (req, res) {

  var rest_id = req.body.rest_id;
  var team_id = req.body.team_id; //etc, or whatever we need

  //generate key
  var session_token = crypto.randomBytes(256).toString('hex');

  //should probably query db at this point
  db.Menu.findOne({merchant_id: rest_id})
  .then(function (result) {
    if (result) {
      menus[session_token] = Menu(result.raw_menu).allItems();
    }
  });

  db.Merchant.findOne({id: rest_id})
  .then(function (result) {
    names[session_token] = result.data.summary.name;
    console.log(names[session_token]);
  })

  //return a url w a key in a query string
  res.send(menuURL + '#?k=' + session_token);
});

//when user hits that url up, post to /session w/key and gets correct pg

app.post('/session/menu', function (req, res) {
  res.send(menus[req.body.k]);
});

app.post('/session/name', function (req, res) {
  console.log(names);
  res.send(names[req.body.k]);
});

//TODO: error handling for promises

var port = 8001
app.listen(port, function () {
  console.log('Listening on ' + port)
})
