require('../kip');
require('colors');
var config = require('../config');

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

// VARIOUS STUFF TO POST BACK TO USER EASILY
// --------------------------------------------
var queue = require('../chat/components/queue-mongo')
var UserChannel = require('../chat/components/delivery.com/UserChannel')
var replyChannel = new UserChannel(queue)
// --------------------------------------------

var cafeMenu = require('../chat/components/delivery.com/Menu.js');
// var menuURL = 'http://e0616f78.ngrok.io'
var menuURL = config.menuURL

console.log('this is a speakerbox', menuURL)

app.use(volleyball);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(jsonParser);

app.use('/', express.static('static'));
app.use('/test', express.static('test'));
app.use('/ang', express.static('ang'));

var MenuSession = db.Menu_session;
var Menu = db.Menu;
var Merchants = db.Merchants;
var Delivery = db.Delivery;
var Messages = db.Messages;

var ObjectId = require('mongodb').ObjectID;

// require('../chat/components/delivery.com/scrape_menus.js');

//handle post request with a binder full of data
app.post('/cafe', (req, res) => co(function * () {
  console.log('post to cafe')
  var ms = new MenuSession({
    session_token: crypto.randomBytes(256).toString('hex') // gen key inside object
  });

  console.log('new menusession created')

  var selected_items = req.body.selected_items;
  var rest_id = req.body.rest_id;
  var result = yield Menu.findOne({merchant_id: rest_id});

  console.log('menu found')
  ms.menu.data = result.raw_menu.menu;
  ms.foodSessionId = req.body.delivery_ObjectId;
  ms.userId = req.body.user_id;
  ms.merchant.id = rest_id;
  var merchant = yield Merchants.findOne({id: rest_id});
  ms.merchant.name = merchant.data.summary.name;
  ms.merchant.minimum = merchant.data.ordering.minimum + "";
  ms.selected_items = selected_items;
  console.log('ms', ms);

  yield ms.save();

  //return a url w a key in a query string
  res.send(menuURL + '?k=' + ms.session_token);
}));

//when user hits that url up, post to /session w/key and gets correct pg

app.post('/session', (req, res) => co(function * () {
  if (_.get(req, 'body') && _.get(req, 'body.session_token')) {
    var t = req.body.session_token.replace(/[^\w\s]/gi, '') // clean special char
    try {
      var ms = yield MenuSession.findOne({session_token: t});
      res.send(JSON.stringify(ms))
    } catch (err) {
      logging.error('catching error in session ', err)
    }
  }
}))

//updates the correct delivery object in the db
//with the delivery object id saved on the menu session

app.post('/order', function (req, res) {
  co(function * () {
    console.log('post to /order');
    if (_.get(req, 'body')) {
      var order = req.body.order;
      var user_id = req.body.user_id;
      var deliv_id = req.body.deliv_id;
      var deliv = yield Delivery.findOne({active: true, _id: new ObjectId(deliv_id)});
      console.log('found the delivery object');
      var cart = deliv.cart;

      for (var i = 0; i < order.length; i++) {
        console.log(order[i]);
        cart.push({
          added_to_cart: true,
          item: order[i], //end goal: cart[i].item.long_id = the long id :)
          user_id: user_id
        });
      }

      yield Delivery.update({active: true, _id: ObjectId(deliv_id)}, {$set: {cart: cart}});

      //----------Message Queue-----------//

      console.log('updated delivery; looking for source message');

      // var foodMessage = yield Messages.find({
      //   'source.user': deliv.convo_initiater.id,
      //   mode: 'food',
      //   incoming: false
      // }).sort('-ts').limit(1);
      //
      // foodMessage = foodMessage[0];
      //
      // var mess = new Messages({
      //   incoming: true,
      //   thread_id: foodMessage.thread_id,
      //   action: 'cart.personal',
      //   user_id: foodMessage.source.user,
      //   mode: 'food',
      //   origin: 'slack',
      //   source: foodMessage.source,
      // })
      //
      // yield mess.save();
      //
      // yield queue.publish('incoming', mess, ['slack', foodMessage.source.channel, foodMessage.ts, new Date().getSeconds()].join('.'), true)

      console.log('ostensibly done');
      res.send();

      //----------Message Queue-----------//

    }
  });
});

var port = 8001
app.listen(port, function () {
  console.log('Listening excitedly on ' + port)
})
