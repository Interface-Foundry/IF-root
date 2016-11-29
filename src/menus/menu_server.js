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

app.use('/', express.static(path.join(__dirname, 'web')));

//require('../chat/components/delivery.com/scrape_menus.js');

//DB stuff
//test id "583db883d388443e97348da6"
var Menu = require('../chat/components/delivery.com/Menu.js');

//GET serve up menu
app.get('/menu', function (req, res) {
  db.Menu.findOne({}).exec()
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

//PUT update item quantity

//PUT select new item

//POST check out // add message to the queue

var port = 8001
app.listen(port, function () {
  console.log('Listening on ' + port)
})
