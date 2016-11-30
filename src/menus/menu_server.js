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

app.use(volleyball);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(jsonParser);

app.use('/', express.static('template'));
app.use('/ang', express.static('ang'));

//require('../chat/components/delivery.com/scrape_menus.js');
//<===========>

//handle post request with a binder full of data
app.post('/cafe', function (req, res) {

  var rest_id = req.body.rest_id;
  var team_id = req.body.team_id; //etc, or whatever we need

  //should probably query db at this point

  db.Menu.findOne({merchant_id: rest_id})
  .then(function (result) {
    if (result) {
      res.send(Menu(result.raw_menu).allItems());
    }
    else res.send('no menu found')
  })
  .catch(function (err) {
    res.send(err);
  });

});

//save data locally

//generate key

//return a url w a key in a query string

//when user hits that url up, post to /session w/key and gets correct pg

//<===========>
//
// //TODO: change to take its own (unofficial) ID
// //serve up restaurant name
// app.get('/name', function (req, res) {
//   db.Menu.findOne({_id: ObjectId(req.params.id)}).exec()
//   .then(function (result) {
//     console.log('merchantId', result);
//     return db.Merchant.findOne({id: result.merchant_id}).exec();
//   })
//   .then(function (result) {
//     res.send(result.data.summary.name);
//   })
//   .catch(function (err) {
//     console.log(err);
//     res.send(err);
//   });
// });

//PUT update item quantity

//PUT select new item

//POST check out // add message to the queue

var port = 8001
app.listen(port, function () {
  console.log('Listening on ' + port)
})
