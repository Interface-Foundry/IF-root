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

//TODO get id of chosen restaurant in whichever delivery is currently active
//NOTE: then can probably remove req param from /menu get

//GET serve up menu
app.get('/menu/:id', function (req, res) {
  db.Menu.findOne({_id: ObjectId(req.params.id)}).exec()
  .then(function (result) {
    if (result) {
      var bigMenu = Menu(result.raw_menu).allItems();
      var smallMenu = [];
      for (var i = 0; i < bigMenu.length; i++) {
        smallMenu.push({
          children: bigMenu[i].children,
          price: bigMenu[i].price,
          description: bigMenu[i].description,
          name: bigMenu[i].name
        });
      }
      console.log('small', smallMenu);
      res.send(smallMenu);
    }
    else res.send('no menu found')
  })
  .catch(function (err) {
    res.send(err);
  });
});

//TODO: change to take its own (unofficial) ID
//serve up restaurant name
app.get('/name/:id', function (req, res) {
  db.Menu.findOne({_id: ObjectId(req.params.id)}).exec()
  .then(function (result) {
    console.log('merchantId', result);
    return db.Merchant.findOne({id: result.merchant_id}).exec();
  })
  .then(function (result) {
    res.send(result.data.summary.name);
  })
  .catch(function (err) {
    console.log(err);
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
