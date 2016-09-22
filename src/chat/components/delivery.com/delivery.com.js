var queue = require('../queue-mongo');
var kip = require('kip');
var co = require('co');
var db = require('db');
var _ = require('lodash');
var api = require('./api-wrapper');

var search = require('./search');

var winston = require('winston');
var fs = require('fs');
var yaml = require('js-yaml');
var dsxsvc = require('./dsx_services');
var dsxutils = require('./dsx_utils')
var ui = require('../ui_controls');

// get the command line arguments
var argv = require('minimist')(process.argv.slice(2));


// process command-line args
var initFilename = argv['config'];
if(initFilename === null || initFilename === undefined){
    console.log('--config parameter not found. Please invoke this script using --config=<config_filename>.');
    process.exit(-1);
}

var yamlDoc;
try {
    yamlDoc = yaml.safeLoad(fs.readFileSync(initFilename, 'utf8'));
}
catch(err){
    console.log(err);
    process.exit(-1);
}

// initialize logging
//
const loggingTransports = yamlDoc['globals']['log_transports'];
var logger = new(winston.Logger)({
    transports: loggingTransports.map(
	function(currentVal){
	    return new (eval(currentVal['type']))(currentVal);
	}
    )
});



var loadedParams = dsxutils.ServiceObjectLoader(yamlDoc).loadServiceObjectParams('DSXClient');

logger.info(loadedParams);
logger.info(typeof(loadedParams))
console.log("### looking at loadedParams again");
console.log(loadedParams)


var dsxClient = new dsxsvc.DSXClient(loadedParams);

console.log(dsxClient.getURI());


class UserChannel {

    constructor(queue) {
        this.queue = queue;
          // replyChannel.send(session, 'food.fulfillment_select', component.render());
        this.send = function(session, nextHandlerID, data) { 
            var newSession = new db.Message({
              incoming: false,
              thread_id: session.thread_id,
              resolved: true,
              user_id: 'kip',
              origin: session.origin,
              source: session.source,
              mode: session.mode,
              action: session.action,
              state: session.state
            })
            newSession['reply'] = data;            
            newSession.mode = nextHandlerID.split('.')[0];
            newSession.action = nextHandlerID.split('.')[1];
            kip.debug('inside channel.send(). Session mode is ' + newSession.mode);
            kip.debug('inside channel.send(). Session action is ' + newSession.action);
            var self = this;
            newSession.save(function(err, saved){
              if (err) {
                kip.debug('mongo save err: ',err);
                throw Error(err);
              } 
              self.queue.publish('outgoing.' + newSession.origin, newSession, newSession._id + '.reply.results');
            });  
        }
        return this;
    }
}

var replyChannel = new UserChannel(queue);0


function default_reply(message) {
  return new db.Message({
    incoming: false,
    thread_id: message.thread_id,
    resolved: true,
    user_id: 'kip',
    origin: message.origin,
    text: "I'm sorry I couldn't quite understand that",
    source: message.source,
    mode: message.mode,
    action: message.action,
    state: message.state
  })
}

function text_reply(message, text) {
  var msg = default_reply(message);
  msg.text = text;
  return msg
}

function send_text_reply(message, text) {
  var msg = text_reply(message, text);
  msg.save();
  console.log('<<<'.yellow, text.yellow);
  queue.publish('outgoing.' + message.origin, msg, message._id + '.reply.' + (+(Math.random() * 100).toString().slice(3)).toString(36))
}

//
// Listen for incoming messages from all platforms because I'm 🌽 ALL 🌽 EARS
//
queue.topic('incoming').subscribe(incoming => {
  co(function*() {
    console.log('>>>'.yellow, incoming.data.text.yellow);
    kip.debug('\n\n\n\n\nINCOMING: ', incoming,'\n\n\n\n\n\n')
    // find the last 20 messages in this conversation, including this one
    var history = yield db.Messages.find({
      thread_id: incoming.data.thread_id,
      ts: {
        $lte: incoming.data.ts
      }
    }).sort('-ts').limit(20);

    var session = history[0];
    if (history[1]) {
      session.mode = history[1].mode;
      session.action = history[1].action;
      session.route = session.mode + '.' + session.action;
      session.prevMode = history[1].mode;
      session.prevAction = history[1].action;
      session.prevRoute = session.prevMode + '.' + session.prevAction;
      // session.state = history[1].state;
    }
    // session.state = session.state || {};
    session.history = history.slice(1);
    if (session._id.toString() !== incoming.data._id.toString()) {
      throw new Error('correct session not retrieved from db');
    }



      

    //var route = yield getRoute(session);
    //

      // NOTE: temporary hack until we figure out what's going on here. --DT

      
      kip.debug('### inside subscribe routine. Session object is: ' + session);
      var route = yield getRoute(session);
      kip.debug('### route: ', route);
      
    //session.mode = 'food';
    //session.action = route.replace(/^food./, '');
    yield handlers[route](session);
    session.save();
    incoming.ack();

  }).catch(kip.err);
});

//
// this is the worst part of building bots: intent recognition
//
function getRoute(session) {
  kip.debug(`prevRoute ${session.prevRoute}`)
  return co(function*() {
      if (session.text === 'food') {

          kip.debug('### User typed in :' + session.text);

          return 'food.begin';
      }
     /*
    if (message.prevRoute === 'food.begin') return 'food.address';
    if ('123'.match(message.text)) {
      if (!message.state.merchant_id)
        return 'food.restaurant.select';
      else
        return 'food.menu.select';
    }
    if (message.prevRoute === 'food.restaurant.list') {
      return 'food.restaurant.search';
    }
    if (message.state.merchant_id && message.text === 'full menu') {
      return 'food.menu.list';
    }
    if (message.state.merchant_id && message.prevRoute !== 'food.menu.search') {
      return 'food.menu.search';
    }
    */
    else{
        return (session.mode + '.' + session.action);
    }
    
    //throw new Error("couldn't figure out the right mode/action to route to")
  }).catch(kip.err);
}

var handlers = {};

//
// the user's intent is to initiate a food order
//
handlers['food.begin'] = function* (session) {    
    //session.state = {};
    //session.save();  // hypothesis: the problem is we are saving the session object before setting its routing info (in replyChannel.send()
    
    var component = new ui.UIComponentFactory(session.origin).buildTextMessage("yeah let's eat! what address should i use?");
    replyChannel.send(session, 'food.store_context', component.render());

  // todo save addresses and show saved addresses
}



handlers['food.store_context'] = function* (session) {
    var addr = session.text;
    
    var deliveryContext = yield dsxClient.createDeliveryContext(addr, 'none', session.source.team, session.source.user);

    var component = new ui.UIComponentFactory(session.origin).buildButtonGroup('Select your order method.', ['Delivery', 'Pickup'], null);
    
    replyChannel.send(session, 'food.context_update', component.render());
}



handlers['food.context_update'] = function* (session) {   
 
    var fulfillmentMethod = session.text;
    var updatedDeliveryContext = yield dsxClient.setFulfillmentMethodForContext(fulfillmentMethod, session.source.team, session.source.user)

    var component = new ui.UIComponentFactory(session.origin).buildTextMessage("delivery context updated.")
    replyChannel.send(session, 'food.ready_to_poll', component.render());
}


handlers['food.ready_to_poll'] = function* (session) {

    var component = new ui.UIComponentFactory(session.origin).buildTextMessage('Ready to poll team members.');
    replyChannel.send(session, component.render());
}





//
// the user's intent is to search for a specific type of food or a specific restaurant
//
handlers['food.restaurant.search'] = function*(message) {
  var results = yield search.search({
    addr: message.state.addr,
    q: message.text
  })
  var results_message = default_reply(message);
  results_message.action = 'restaurant.list';
  results_message.text = `Here are some restaurants matching ${message.text} that you might like nearby`;
  results_message.data = {
    results: results.results,
    params: {addr: results.address}
  };
  results_message.save();
  queue.publish('outgoing.' + message.origin, results_message, message._id + '.reply.results');
}

//
// the user's intent is to choose a restaurant to order from
//
handlers['food.restaurant.select'] = function*(message) {
  return yield handlers['food.restaurant.info'](message);
}

//
// the user's intent is to obtian more information about a restaurant
//
handlers['food.restaurant.info'] = function*(message) {
  var results_message = message.history.filter(m => {
    return _.get(m, 'data.results.0');
  })[0];

  var selection = parseInt(message.text) - 1;
  var merchant = results_message.data.results[selection];
  message.state.merchant_id = merchant.id;
  var info_message = default_reply(message);
  info_message.action = 'restaurant.info';
  info_message.text = `Okay, here's the menu for ${merchant.summary.name}`
  var menu = yield api.getMenu(merchant.id);
  info_message.data = {
    merchant: merchant,
    menu: menu
  };
  info_message.save();
  queue.publish('outgoing.' + message.origin, info_message, message._id + '.reply.menu');
}

//
// the user wants to see the full menu
//
handlers['food.menu.list'] = function*(message) {
  var info_message = default_reply(message);
  info_message.action = 'menu.list';
  info_message.data = message.history.filter(m => {
    return m.action === 'restaurant.info' && _.get(m, 'data.merchant') && _.get(m, 'data.menu');
  })[0].data;
  info_message.text = `Okay, here's the full menu for ${info_message.data.merchant.summary.name}`
  info_message.save();
  queue.publish('outgoing.' + message.origin, info_message, message._id + '.reply.menu');
  
}

//
// the user is looking at a menu and is searching for an item to add
//
handlers['food.menu.search'] = function*(message) {
  var results_message = default_reply(message);
  results_message.action = 'menu.search.results';
  var results = yield search.menuSearch({
    q: message.text,
    menu: message.history.filter(m => {
      return m.action === 'restaurant.info' && _.get(m, 'data.merchant') && _.get(m, 'data.menu');
    })[0].data.menu
  });
  results_message.data = {
    results: results
  };
  results_message.text = `Okay, here are the items matching "${message.text}"`;
  results_message.save();
  queue.publish('outgoing.' + message.origin, results_message, message._id + '.reply.results');
}

//
// the user's intent is to obtain more information about a menu item
//
handlers['food.item.info'] = function*(message) {

}

// the user's intent is to add a menu item to cart
handlers['food.item.add'] = function*(message) {

}

// the user's intent is to select an option for a menu item, like size or type of sauce
// the item could already be in their cart or not. message.item should be what you modify
handlers['food.item.option'] = function*(message) {

}
