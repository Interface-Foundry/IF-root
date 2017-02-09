require('../kip');
const config = kip.config

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
var path = require('path')
var request = require('request-promise')


var Menu = require('../chat/components/delivery.com/Menu.js')
var menuURL = config.menuURL

// k8s readiness ingress health check
app.get('/health', function (req, res) {
  res.sendStatus(200)
})

app.use(volleyball);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(jsonParser);

app.use('/menus', express.static(path.join(__dirname, 'static')));
app.use('/test', express.static(path.join(__dirname, 'test')));
app.use('/ang', express.static(path.join(__dirname, 'ang')));

var router = express.Router()

app.use('/menus', router)

var MenuSession = db.Menu_session;
// var Menu = db.Menus;
var Merchants = db.Merchants;
var Delivery = db.Delivery;

var ObjectId = require('mongodb').ObjectID;

// require('../chat/components/delivery.com/scrape_menus.js');

//handle post request with a binder full of data
router.post('/cafe', (req, res) => co(function * () {
  logging.debug('post to cafe')
  var ms = new MenuSession({
    session_token: crypto.randomBytes(256).toString('hex') // gen key inside object
  });

  logging.debug('new menusession created')

  // logging.debug('req.body', req.body)

  var rest_id = req.body.rest_id;
  var result = yield db.Menus.findOne({merchant_id: rest_id});

  if (!result) {
    ms.menu.data = yield db.Delivery.findOne({team_id: req.body.team_id, active: true}).select('menu').exec()
  } else {
    ms.menu.data = result.raw_menu.menu;
  }

  ms.foodSessionId = req.body.delivery_ObjectId;
  ms.user.id = req.body.user_id;
  ms.budget = req.body.budget;
  ms.merchant.id = rest_id;

  var merchant = yield Merchants.findOne({id: rest_id});

  ms.merchant.logo = merchant.data.summary.merchant_logo
  ms.merchant.name = merchant.data.summary.name;

  ms.merchant.minimum = merchant.data.ordering.minimum + "";

  ms.selected_items = req.body.selected_items;

  var foodSession = yield Delivery.findOne({_id: ObjectId(req.body.delivery_ObjectId)}).exec()

  ms.admin_name = foodSession.convo_initiater.name //initiatOr

  var user = yield db.Chatusers.findOne({id: ms.user.id})
  if (!user) user = yield db.email_users.findOne({id: ms.user.id}).exec()

  ms.user.is_admin = user.is_admin

  var sb = yield db.Slackbots.findOne({team_id: foodSession.team_id})

  ms.team_name = sb.team_name

  // logging.debug('ms', ms);
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
    logging.debug('post to /order');
    if (_.get(req, 'body')) {
      var order = req.body.order;
      var user_id = req.body.user_id;

      // logging.debug('req.body', req.body)

      var deliv_id = req.body.deliv_id;
      var foodSession = yield Delivery.findOne({active: true, _id: new ObjectId(deliv_id)});
      logging.debug('found the delivery object');
      var cart = foodSession.cart;
      var menu = Menu(foodSession.menu)
      var money_spent = 0;
      console.log('got cart and menu')
      for (var i = 0; i < order.length; i++) {
        // logging.debug(order[i]);
        cart.push({
          added_to_cart: true,
          item: order[i],
          user_id: user_id
        });
        console.log('added everything to the cart')
        if (foodSession.budget) {
          money_spent += Number(menu.getCartItemPrice(cart[cart.length-1]))
          console.log('calculated money spent')
        }
      }

      console.log('added everything to team cart')

      var user_budgets = foodSession.user_budgets
      user_budgets[user_id] -= money_spent

      console.log('calculated money spent')

      yield Delivery.update({active: true, _id: ObjectId(deliv_id)}, {$set: {cart: cart, user_budgets: user_budgets}});

      console.log('updated the delivery object')

      //----------Message Queue-----------//

        logging.debug('updated delivery; looking for source message');

        var foodMessage = yield db.Messages.find({
          'source.user': user_id,
          mode: 'food',
          incoming: false
        }).sort('-ts').limit(1);

        logging.debug('found foodmessage')

        foodMessage = foodMessage[0];

        var mess = new db.Messages({
          incoming: true,
          thread_id: foodMessage.thread_id,
          action: 'cart.personal',
          user_id: foodMessage.source.user,
          mode: 'food',
          origin: 'slack',
          source: foodMessage.source,
        })

        yield mess.save();

        request.post({
          url: kip.config.slack.internal_host + '/menuorder',
          json: true,
          body: {
            topic: 'incoming',
            verification_token: kip.config.slack.verification_token,
            message: mess
          }

        })

      logging.debug('ostensibly done');
      res.send();

      //----------Message Queue-----------//

    }
  });
});

var port = 8001
app.listen(port, function () {
  logging.info('Listening enthusiastically on ' + port)
})
