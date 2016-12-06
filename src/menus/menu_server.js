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
var menuURL = 'localhost:8001';

app.use(volleyball);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(jsonParser);

app.use('/', express.static('template'));
app.use('/test', express.static('test'));
app.use('/ang', express.static('ang'));

var MenuSession = db.Menu_session;
var Menu = db.Menu;
var Merchant = db.Merchant;
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

  var rest_id = req.body.rest_id;
  var result = yield Menu.findOne({merchant_id: rest_id});

  // console.log('menu found') // last printed

  // console.log('result:', result)
  ms.menu.data = result.raw_menu.menu;
  ms.foodSessionId = req.body.delivery_ObjectId;
  ms.userId = req.body.user_id;
  ms.merchant.id = rest_id;
  merchant = yield Merchant.findOne({id: rest_id});
  console.log('merchant', merchant)
  ms.merchant.name = merchant.data.summary.name;
  ms.merchant.minimum = merchant.data.ordering.minimum + "";
  console.log('ms', ms);

  yield ms.save();

  //return a url w a key in a query string
  res.send(menuURL + '#?k=' + ms.session_token);
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

// VARIOUS STUFF TO POST BACK TO USER EASILY
// --------------------------------------------
var queue = require('../chat/components/queue-mongo')
var UserChannel = require('../chat/components/delivery.com/UserChannel')
var replyChannel = new UserChannel(queue)
// --------------------------------------------

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

      var cart = deliv.cart;

      for (var i = 0; i < order.length; i++) {
        cart.push({
          added_to_cart: true,
          item: order[i],
          user_id: user_id
        });
      }

      yield db.delivery.update({active: true, _id: ObjectId(deliv_id)}, {$set: {cart: cart}});

      //----------Message Queue-----------//

      var foodMessage = yield Messages.find({
        'source.user': user.id,
        mode: 'food',
        incoming: false
      });

      console.log('food message~~~', foodMessage);

      //look up last message about this order
      //identify correct handler from cart_handlers
      //send message back

      //----------Message Queue-----------//

    }
  });
});

var port = 8001
app.listen(port, function () {
  console.log('Listening on ' + port)
})
