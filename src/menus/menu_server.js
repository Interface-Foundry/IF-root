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
var menuURL = config.menuURL

app.use(volleyball);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(jsonParser);

app.use('/menus', express.static('static'));
app.use('/test', express.static('test'));
app.use('/ang', express.static('ang'));

var router = express.Router()

app.use('/menus', router)

var MenuSession = db.Menu_session;
var Menu = db.Menus;
var Merchants = db.Merchants;
var Delivery = db.Delivery;

var ObjectId = require('mongodb').ObjectID;

// require('../chat/components/delivery.com/scrape_menus.js');

//handle post request with a binder full of data
router.post('/cafe', (req, res) => co(function * () {
  console.log('post to cafe')
  var ms = new MenuSession({
    session_token: crypto.randomBytes(256).toString('hex') // gen key inside object
  });

  console.log('new menusession created')

  console.log('req.body', req.body)

  logging.debug('req.body', req.body)

  var rest_id = req.body.rest_id;
  var result = yield Menu.findOne({merchant_id: rest_id});

  if (!result) {
    ms.menu.data = yield db.Delivery.findOne({team_id: req.body.team_id, active: true}).select('menu').exec()
  } else {
    ms.menu.data = result.raw_menu.menu;
  }
  console.log('this is the menu data')
  console.log(ms.menu.data);
  ms.foodSessionId = req.body.delivery_ObjectId;
  ms.user.id = req.body.user_id;
  ms.budget = req.body.budget;
  ms.merchant.id = rest_id;

  var merchant = yield Merchants.findOne({id: rest_id});

  console.log('found merchant')

  ms.merchant.logo = merchant.data.summary.merchant_logo
  ms.merchant.name = merchant.data.summary.name;
  ms.merchant.minimum = merchant.data.ordering.minimum + "";
  ms.selected_items = req.body.selected_items;

  var foodSession = yield Delivery.findOne({_id: ObjectId(req.body.delivery_ObjectId)}).exec()

  console.log('found food sesh')

  ms.admin_name = foodSession.convo_initiater.name //initiatOr

  var user = yield db.Chatusers.findOne({id: ms.user.id})
  if (!user) user = yield db.email_users.findOne({id: ms.user.id}).exec()

  console.log('found user')

  ms.user.is_admin = user.is_admin

  var sb = yield db.Slackbots.findOne({team_id: foodSession.team_id})

  console.log('found slackbot')

  ms.team_name = sb.team_name

  console.log('ms', ms);
  yield ms.save();

  //return a url w a key in a query string
  res.send(menuURL + '/?k=' + ms.session_token);
}));

//when user hits that url up, post to /session w/key and gets correct pg

router.post('/session', (req, res) => co(function * () {
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

router.post('/order', function (req, res) {
  co(function * () {
    console.log('post to /order');
    if (_.get(req, 'body')) {
      var order = req.body.order;
      var user_id = req.body.user_id;
      var deliv_id = req.body.deliv_id;
      var foodSession = yield Delivery.findOne({active: true, _id: new ObjectId(deliv_id)});
      console.log('found the delivery object');
      var cart = foodSession.cart;

      for (var i = 0; i < order.length; i++) {
        console.log(order[i]);
        cart.push({
          added_to_cart: true,
          item: order[i],
          user_id: user_id
        });
      }

      var orders = foodSession.confirmed_orders
      console.log('orders', orders)
      orders.push(user_id)
      console.log('orders plus a new one', orders)

      yield Delivery.update({active: true, _id: ObjectId(deliv_id)}, {$set: {cart: cart, confirmed_orders: orders}});

      //----------Message Queue-----------//

      console.log('updated delivery; looking for source message');

      console.log('ostensibly done');
      res.send();

      //----------Message Queue-----------//

    }
  });
});

// k8s readiness ingress health check
router.get('/health', function (req, res) {
  res.sendStatus(200)
})

var port = 8001
app.listen(port, function () {
  console.log('Listening enthusiastically on ' + port)
})
