require('kip');
require('colors');

//loads basic server structure
var bodyParser = require('body-parser');
var express = require('express');
var app = express();
var jsonParser = bodyParser.json();
var path = require('path');
var volleyball = require('volleyball');
app.use(volleyball);

app.use('/', express.static('template'));
app.use('/ang', express.static('ang'));

//require('../chat/components/delivery.com/scrape_menus.js');

//DB stuff
var Menu = require('../chat/components/delivery.com/Menu.js');
var ObjectId = require('mongoose').Types.ObjectId;

//GET serve up menu
app.get('/menu/:id', function (req, res) {
  db.Menu.findOne({_id: ObjectId(req.params.id)}).exec()
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

//serve up restaurant name
app.get('/name/:id', function (req, res) {
  db.Menu.findOne({_id: ObjectId(req.params.id)}).exec()
  .then(function (result) {
    res.send(result.merchant_id);
  })
  .catch(function (err) {
    res.send(err);
  });
});

//PUT update item quantity

//PUT select new item

//POST check out // add message to the queue

var port = 8001
app.listen(port, function () {
  console.log('Listening on ' + port)
})
