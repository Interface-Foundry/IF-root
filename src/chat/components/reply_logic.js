
/*eslint-env es6*/
var async = require('async');
var request = require('request');
var co = require('co');
var _ = require('lodash');
var fs = require('fs');

var banter = require("./banter.js");
var amazon_search = require('./amazon_search.js');
var picstitch = require("./picstitch.js");
var processData = require("./process.js");
var purchase = require("./purchase.js");

var kipcart = require('./cart');
var nlp = require('../../nlp2/api');
//set env vars
var config = require('../../config');
var mailerTransport = require('../../mail/IF_mail.js');

//load mongoose models
var mongoose = require('mongoose');
var db = require('../../db');
var Message = db.Message;
var Chatuser = db.Chatuser;
var Slackbots = db.Slackbots;

// var supervisor = require('./supervisor');
var upload = require('./upload.js');
var email = require('./email');
/////////// LOAD INCOMING ////////////////

var queue = require('./queue-mongo');
var kip = require('../../kip');

const test_payloads = require('./test_payloads');


//temp in-memory mode tracker
var modes = {};

// For container stuff, this file needs to be totally stateless.
// all state should be in the db, not in any cache here.

var winston = require('winston');
winston.level = process.env.NODE_ENV === 'production' ? 'info' : 'debug';


winston.debug('debug ', modes)


// I'm sorry i couldn't understand that
function default_reply(message) {
  return new db.Message({
    incoming: false,
    thread_id: message.thread_id,
    resolved: true,
    user_id: 'kip',
    origin: message.origin,
    text: "I'm sorry I couldn't quite understand that",
    source: message.source
  })
}

// get a simple text message
function text_reply(message, text) {
  var msg = default_reply(message);
  msg.text = text;
  msg.execute = msg.execute ? msg.execute : [];
  msg.execute.push({
        mode: 'banter',
        action: 'reply',
      })
  return msg
}

// sends a simple text reply
function send_text_reply(message, text) {
  var msg = text_reply(message, text);
  winston.debug('\n\n\nsendmsg: ', msg);
  queue.publish('outgoing.' + message.origin, msg, message._id + '.reply.' + (+(Math.random() * 100).toString().slice(3)).toString(36))
}

// Make it look like Kip is typing
function typing(message) {
  var msg = {
    action: 'typing',
    source: message.source,
    origin: message.origin
  };
  queue.publish('outgoing.' + message.origin, msg, message._id + '.typing.' + (+(Math.random() * 100).toString().slice(3)).toString(36))
}



//TODO: IF EXECUTE PROPERTY EXISTS, SKIP NLP PARSING




//
// Listen for incoming messages from all platforms because I'm 🌽 ALL 🌽 EARS
//
queue.topic('incoming').subscribe(incoming => {
  co(function*() {

    kip.debug('🔥', incoming);

    var timer = new kip.SavedTimer('message.timer', incoming.data);

    timer.tic('getting history');
    // find the last 20 messages in this conversation, including this one
    var history = yield db.Messages.find({
      thread_id: incoming.data.thread_id,
      ts: {
        $lte: incoming.data.ts
      }
    }).sort('-ts').limit(20);
    var message = history[0];
    message.history = history.slice(1);

    //sanitize text input
    if(message.text){
      message.text = message.text.replace(/[^0-9a-zA-Z.]/g, ' ')
    }

    timer.tic('got history');
    message._timer = timer;

    // fail fast
    if (message._id.toString() !== incoming.data._id.toString()) {
      throw new Error('correct message not retrieved from db');
    }


    //// MODES STUFF ////
    var user = {
      id : incoming.data.user_id
    }

    if(incoming.data.action == 'mode.update'){
      modes[user.id] = 'onboarding'
      winston.debug('UPDATED MODE!!!!')
      incoming.ack();
      return;
    }

    if (!modes[user.id]){
        modes[user.id] = 'shopping';
    }

    /////////////////////

    //MODE SWITCHER
    switch(modes[user.id]){
      case 'onboarding':
        winston.debug('ONBAORDING MODE')

        //check for valid country
        //turn this into a function
        if(text == 'Singapore' || text == 'United States'){
          winston.debug('SAVING TO DB')
          replies = ['Saved country!'];

          //access onboard template per source origin!!!!
          modes[user.id] = 'shopping';
        }else {
          replies = ['Didnt understand, please choose a country thx'];
          winston.debug('Didnt understand, please choose a country thx')
        }
      break;
      //default Kip Mode shopping
      default:
        winston.debug('DEFAULT SHOPPING MODE')
        //try for simple reply
        timer.tic('getting simple response')
        var replies = yield simple_response(message);
        timer.tic('got simple response')
        kip.debug('simple replies'.cyan, replies);

        //not a simple reply, do NLP
        if (!replies || replies.length === 0) {

          timer.tic('getting nlp response')

          winston.info('👽 passing to nlp: ', message.text);
          

	    if(message.execute && message.execute.length >= 1){
		 replies = yield execute(message);
	    }
	    else{
		replies = yield nlp_response(message);
		kip.debug('+++ NLPRESPONSE ' + replies);
	    }
          
          timer.tic('got nlp response')
          kip.debug('nlp replies'.cyan,
            replies.map(function*(r){
                return {
                  text: r.text,
                  execute: r.execute
                  }
          }))
        }

        if (!replies || replies.length === 0) {
          kip.error('Could not understand message ' + message._id);
          replies = [default_reply(message)];
        }
    }

    kip.debug('num replies', replies.length);
    timer.tic('saving message');
    yield message.save(); // the incoming message has had some stuff added to it :)
    timer.tic('done saving message');
    timer.tic('saving replies');
    yield replies.map(r => {
      if (r.save) {
        r.save()
      } else {
        winston.debug('could not save ' + r);
      }
    });
    timer.tic('done saving replies');
    timer.tic('sending replies');
    yield replies.map((r, i) => {
      kip.debug('reply', r.mode, r.action);
      queue.publish('outgoing.' + r.origin, r, message._id + '.reply.' + i);
    });
    incoming.ack();
    timer.stop();
  }).catch(kip.err);
});


//pre process incoming messages for canned responses
function* simple_response(message) {
  kip.debug('simple_response begin'.cyan)
  var replies = [];

  //check for canned responses/actions before routing to NLP
  // this adds mode and action to the message
  // winston.debug('\n\n\n\n\n\nBEFORE BANTER: ', message);
  var reply = banter.checkForCanned(message);

  kip.debug('prefab reply from banter.js', reply);

  if (!reply.flag) {
    return
  }

  switch (reply.flag) {
    case 'basic': //just respond, no actions
      return [text_reply(message, reply.res)];

    case 'search.initial':
      //send a reply right away
      send_text_reply(message, reply.res);

      //if(message.origin !== 'skype'){
        typing(message);
      //}

      //now also search for item
      message.mode = 'shopping';
      message.action = 'initial';
      message.execute.push({
        mode: 'shopping',
        action: 'initial',
        params: {
          query: reply.query
        }
      })
      break;

    case 'search.focus':
      message.mode = 'shopping';
      message.action = 'focus';
      message.execute.push({
        mode: 'shopping',
        action: 'focus',
        params: {
          focus: reply.query
        }
      })
      break;

    case 'search.more':
      message.mode = 'shopping';
      message.action = 'more';
      message.execute.push({
        mode: 'shopping',
        action: 'more'
      })
      break;
    case 'purchase.remove':
    case 'cart.remove':
      message.mode = 'cart';
      message.action = 'remove';
      message.execute.push({
        mode: 'cart',
        action: 'remove',
        params: {
          focus: reply.query
           // ? reply.query : (message.searchSelect[0] ? message.searchSelect[0] : undefined)
        }
      })
      break;

    //for testing in PAPRIKA
    case 'slack.search':
    // message.searchSelect = [];
    // data.mode = 'search';

      var slackTester;

      if (res == 'cheaper') {
        slackTester = {
          payload: test_payloads.CHEAPER
        };
      } else if (res == 'addcart') {
        slackTester = {
          payload: test_payloads.ADD_CART
        };
      } else if (res == 'similar') {
        slackTester = {
          payload: test_payloads.SIMILAR
        };
      } else if (res == 'modify') {
        slackTester = {
          payload: test_payloads.MODIFY
        };
      } else if (res == 'moreinfo') {
        slackTester = {
          payload: test_payloads.MOREINFO
        };
      }

      incomingMsgAction(slackTester);
      break;
    case 'cancel': //just respond, no actions
      //send message
      winston.debug('Kip response cancelled');
      break;
    default:
      winston.debug('error: canned action flag missing');
  }

  var messages = yield execute(message);
  kip.debug('simple replies', messages.length);

  return messages;
}


// use nlp to deterine the intent of the user
function* nlp_response(message) {
  kip.debug('nlp_response begin'.cyan)
  // the nlp api adds the processing data to the message

  try {
    yield nlp.parse(message);
    if (process.env.NODE_ENV !== 'production') {
      var debug_message = text_reply(message, '_debug nlp_ `' + JSON.stringify(message.execute) + '`');
    }
    var messages = yield execute(message);
  } catch(err) {
    kip.err(err);
  }
  if (process.env.NODE_ENV !== 'production') {
    return [debug_message].concat(messages);
  } else {
    return messages;
  }
}

// do the things
function execute(message) {
  kip.debug('exec', message.execute);
  return co(function*() {
    message._timer.tic('getting messages');
    var messages = yield message.execute.reduce((messages, exec) => {
      var route = exec.mode + '.' + exec.action;
      kip.debug('route', route, 'exec', exec);
      if (!handlers[route]) {
        throw new Error(route + ' handler not implemented');
      }

      var message_promises = handlers[route](message, exec);

      if (message_promises instanceof Array) {
        messages = messages.concat(message_promises)
      } else {
        messages.push(message_promises)
      }
      return messages;
    }, [])
    // only return messages
    var replies = messages.reduce((all, m) => {
      winston.debug(typeof m);
      if (m instanceof Array) {
        all = all.concat(m);
      } else {
        all.push(m);
      }
      return all;
    }, []);
    return replies;
  })
}


;`
LIFE OF  NEKO
LIFE OF  NEKO
LIFE OF  NEKO
LIFE OF  NEKO
LIFE OF  NEKO
LIFE OF  NEKO
    ＿＿＿＿＿
　 ／＼＿＿＿＿＼
　|￣＼∩・ω・)＼
　|　 ｜￣￣∪￣｜ ﾁﾗｯ
`

//
// Handlers take something from the message.execute array and turn it into new messages
//
var handlers = {};

handlers['shopping.initial'] = function*(message, exec) {
  typing(message);
  message._timer.tic('starting amazon_search');
    //NLP classified this query incorrectly - lets remove this after NLP sorts into shopping initial 100%
   if (message.text.indexOf('1 but') > -1 || message.text.indexOf('2 but') > -1 || message.text.indexOf('3 but') > -1) {
    var fake_exec = {
      mode: 'shopping',
      action: 'initial',
      params: { query: message.text.split(' but ')[1] }
     }
   }
   var exec = fake_exec ? fake_exec : exec;
  //end of patch
  var results = yield amazon_search.search(exec.params,message.origin);
  winston.debug('!1',exec)

  if (results == null || !results) {
      winston.debug('-1')
      return new db.Message({
      incoming: false,
      thread_id: message.thread_id,
      resolved: true,
      user_id: 'kip',
      origin: message.origin,
      source: message.source,
      text: 'Oops! Sorry my brain froze!',
    })
  }

  message._timer.tic('done with amazon_search');

  return new db.Message({
    incoming: false,
    thread_id: message.thread_id,
    resolved: true,
    user_id: 'kip',
    origin: message.origin,
    source: message.source,
    execute: [exec],
    text: 'Hi, here are some options you might like. Tap `Add to Cart` to save to your Cart 😊',
    amazon: JSON.stringify(results),
    mode: 'shopping',
    action: 'results',
    original_query: results.original_query
  })
}

handlers['shopping.focus'] = function*(message, exec) {
  if (!exec.params.focus) {
    kip.err('no focus supplied');
    return default_reply(message);
  }

  // find the search results this focus query is referencing
  var results = yield getLatestAmazonResults(message);

  return new db.Message({
    incoming: false,
    thread_id: message.thread_id,
    resolved: true,
    user_id: 'kip',
    origin: message.origin,
    source: message.source,
    amazon: JSON.stringify(results),
    mode: 'shopping',
    action: 'focus',
    focus: exec.params.focus
  })
};

// "more"
handlers['shopping.more'] = function*(message, exec) {
  exec.params = yield getLatestAmazonQuery(message);
  exec.params.skip = (exec.params.skip || 0) + 3;
    winston.debug('!2', exec)

  var results = yield amazon_search.search(exec.params,message.origin);
   if (results == null || !results) {
          winston.debug('-2')

      return new db.Message({
      incoming: false,
      thread_id: message.thread_id,
      resolved: true,
      user_id: 'kip',
      origin: message.origin,
      source: message.source,
      text: 'Oops! Sorry my brain froze!',
    })
  }

  return new db.Message({
    incoming: false,
    thread_id: message.thread_id,
    resolved: true,
    user_id: 'kip',
    origin: message.origin,
    source: message.source,
    execute: [exec],
    text: 'Hi, here are some more options. Type `more` to see more options or tap `Add to Cart` to save to your Cart 😊',
    amazon: JSON.stringify(results),
    mode: 'shopping',
    action: 'results',
    original_query: results.original_query
  })
}

// "more like 2"
handlers['shopping.similar'] = function*(message, exec) {
  if (!exec.params.focus) {
    kip.err('no focus supplied')
    return default_reply(message);
  }

  exec.params.skip = 0; //(exec.params.skip || 0) + 3;

  if (!exec.params.asin) {
    var old_results = yield getLatestAmazonResults(message);
    winston.debug(old_results);
    exec.params.asin = old_results[exec.params.focus - 1].ASIN[0];
  }
    winston.debug('!2', exec)


  var results = yield amazon_search.similar(exec.params,message.origin);
   if (results == null || !results) {
          winston.debug('-3')

      return new db.Message({
      incoming: false,
      thread_id: message.thread_id,
      resolved: true,
      user_id: 'kip',
      origin: message.origin,
      source: message.source,
      text: 'Oops! Sorry my brain froze!',
    })
  }

  return new db.Message({
    incoming: false,
    thread_id: message.thread_id,
    resolved: true,
    user_id: 'kip',
    origin: message.origin,
    source: message.source,
    execute: [exec],
    text: 'I found some similar options, would you like to see more product info? Tap `More Info`',
    amazon: JSON.stringify(results),
    mode: 'shopping',
    action: 'results',
    original_query: results.original_query
  })
}

// "cheaper" and "denim"
handlers['shopping.modify.all'] = function*(message, exec) {

  var old_params = yield getLatestAmazonQuery(message);
  var old_results = yield getLatestAmazonResults(message);
  kip.debug('old params', old_params);
  kip.debug('new params', exec.params);


  if (exec.params && exec.params.val && exec.params.val.length == 1 && message.text && (message.text.indexOf('1 but') > -1 || message.text.indexOf('2 but') > -1 || message.text.indexOf('3 but') > -1) && message.text.split(' but ')[1] && message.text.split(' but ')[1].split(' ').length > 1){
    var all_modifiers = message.text.split(' but ')[1].split(' ');
    if (all_modifiers.length >= 2) {
      for (var i = 1; i < all_modifiers.length; i++) {
         if (all_modifiers[i] && all_modifiers[i] !== '') {
          exec.params.val.push(all_modifiers[i].replace('_',' ').trim());
         }
      }
    }
  }

  // for "cheaper" modify the params and then do another search.
  if (exec.params.type === 'price') {
    _.merge(exec.params, old_params);
    var max_price = Math.max.apply(null, old_results.map(r => parseFloat(r.realPrice.slice(1))));
    if (exec.params.param === 'less') {
      exec.params.max_price = max_price * 0.8;
    } else if (exec.params.param === 'more') {
      kip.log('wow someone wanted something more expensive');
      exec.params.min_price = max_price * 1.1;
    }
  }
  else if (exec.params.type === 'color') {
    var results = yield getLatestAmazonResults(message);
    exec.params.productGroup = results[0].ItemAttributes[0].ProductGroup[0];
    exec.params.browseNodes = results[0].BrowseNodes[0].BrowseNode;
    exec.params.color = exec.params.val[0];
  }
  else {
    var results = yield getLatestAmazonResults(message);
    exec.params.productGroup = results[0].ItemAttributes[0].ProductGroup[0];
    exec.params.browseNodes = results[0].BrowseNodes[0].BrowseNode;
  }
  winston.debug('!3', exec)
  exec.params.query = old_params.query;
  if (!exec.params.query) {
              winston.debug('-3.5')

    return new db.Message({
      incoming: false,
      thread_id: message.thread_id,
      resolved: true,
      user_id: 'kip',
      origin: message.origin,
      source: message.source,
      text: 'Oops! Sorry my brain froze!',
    })
  }


  var results = yield amazon_search.search(exec.params,message.origin);
   if (results == null || !results) {
          winston.debug('-4')

      return new db.Message({
      incoming: false,
      thread_id: message.thread_id,
      resolved: true,
      user_id: 'kip',
      origin: message.origin,
      source: message.source,
      text: 'Oops! Sorry my brain froze!',
    })
  }

  return new db.Message({
    incoming: false,
    thread_id: message.thread_id,
    resolved: true,
    user_id: 'kip',
    origin: message.origin,
    source: message.source,
    execute: [exec],
    text: 'Hi, here are some different options. Use `more` to see more options or `buy 1`, `2`, or `3` to get it now 😊',
    amazon: JSON.stringify(results),
    mode: 'shopping',
    action: 'results'
  })
};

// "like 1 but cheaper", "like 2 but blue"
handlers['shopping.modify.one'] = function*(message, exec) {
  if (!exec.params.focus) {
    kip.err('no focus supplied')
    return default_reply(message);
  }

  var old_params = yield getLatestAmazonQuery(message);
  var old_results = yield getLatestAmazonResults(message);
  kip.debug('old params', old_params);
  kip.debug('new params', exec.params);
    if (exec.params && exec.params.val && exec.params.val.length == 1 && message.text && (message.text.indexOf('1 but') > -1 || message.text.indexOf('2 but') > -1 || message.text.indexOf('3 but') > -1) && message.text.split(' but ')[1] && message.text.split(' but ')[1].split(' ').length > 1){
    var all_modifiers = message.text.split(' but ')[1].split(' ');
      // winston.debug('\n\n\n\n\n\nall_modifiers: ', message.text,'\n\n\n\n\n\n\n')
    if (all_modifiers.length >= 2) {
      for (var i = 1; i < all_modifiers.length; i++) {
         if (all_modifiers[i] && all_modifiers[i] !== '') {
          exec.params.val.push(all_modifiers[i].replace('_',' ').trim());
         }
      }
    }
  }
      winston.debug('!4', exec)

  // modify the params and then do another search.
  // kip.debug('itemAttributes_Title: ', old_results[exec.params.focus -1].ItemAttributes[0].Title)
  if (exec.params.type === 'price') {
    var max_price = parseFloat(old_results[exec.params.focus - 1].realPrice.slice(1));
    if (exec.params.param === 'less') {
      exec.params.max_price = max_price * 0.8;
    } else if (exec.params.param === 'more') {
      kip.log('wow someone wanted something more expensive');
      exec.params.min_price = max_price * 1.1;
    }
  }
  else if (exec.params.type === 'color') {
    var results = yield getLatestAmazonResults(message);
    exec.params.productGroup = results[0].ItemAttributes[0].ProductGroup[0];
    exec.params.browseNodes = results[0].BrowseNodes[0].BrowseNode;
    exec.params.color = exec.params.val[0];

    // winston.debug('exec for color search: ', JSON.stringify(exec))
  }
  else {
    var results = yield getLatestAmazonResults(message);
    exec.params.productGroup = results[0].ItemAttributes[0].ProductGroup[0];
    exec.params.browseNodes = results[0].BrowseNodes[0].BrowseNode;
    // exec.params.color = exec.params.val.name;
    // throw new Error('this type of modification not handled yet: ' + exec.params.type);
  }

   if ((results == null || !results) && exec.params.type !== 'price')  {
                  winston.debug('-5')

      return new db.Message({
      incoming: false,
      thread_id: message.thread_id,
      resolved: true,
      user_id: 'kip',
      origin: message.origin,
      source: message.source,
      text: 'Oops! Sorry my brain froze!',
    })
  }

  exec.params.query = old_params.query;

  if (!exec.params.query) {
    return new db.Message({
      incoming: false,
      thread_id: message.thread_id,
      resolved: true,
      user_id: 'kip',
      origin: message.origin,
      source: message.source,
      text: 'Oops! Sorry my brain froze!',
    })
  }


  var results = yield amazon_search.search(exec.params,message.origin);
  return new db.Message({
    incoming: false,
    thread_id: message.thread_id,
    resolved: true,
    user_id: 'kip',
    origin: message.origin,
    source: message.source,
    execute: [exec],
    text: 'Hi, here are some different options. Use `more` to see more options or `buy 1`, `2`, or `3` to get it now 😊',
    amazon: JSON.stringify(results),
    mode: 'shopping',
    action: 'results'
  })
}

handlers['cart.save'] = function*(message, exec) {
  if (!exec.params.focus) {
    throw new Error('no focus for saving to cart');
  }



 var raw_results = (message.flags && message.flags.old_search) ? JSON.parse(message.amazon) : yield getLatestAmazonResults(message);
  winston.debug('raw_results: ', typeof raw_results, raw_results);
 var results = (typeof raw_results == 'array' || typeof raw_results == 'object' ) ? raw_results : JSON.parse(raw_results);

  var cart_id = (message.source.origin == 'facebook') ? message.source.org : message.cart_reference_id || message.source.team; // TODO make this available for other platforms
  //Diverting team vs. personal cart based on source origin for now
  var cart_type= message.source.origin == 'slack' ? 'team' : 'personal';
  winston.debug('INSIDE REPLY_LOGIC SAVEE   :   ', exec.params.focus - 1 )
;  try {
    yield kipcart.addToCart(cart_id, message.user_id, results[exec.params.focus - 1], cart_type)
  } catch (e) {
    kip.err(e);
    return text_reply(message, 'Sorry, it\'s my fault – I can\'t add this item to cart. Please click on item link above to add to cart, thanks! 😊')
  }

  // view the cart
  return yield handlers['cart.view'](message, exec);
};

handlers['cart.remove'] = function*(message, exec) {
  if (!exec.params.focus) {
    throw new Error('no focus for removing from cart', message)
  }

  var cart_id = (message.source.origin === 'facebook') ? message.source.org : message.cart_reference_id || message.source.team;

  //Diverting team vs. personal cart based on source origin for now
  var cart_type= message.source.origin == 'slack' ? 'team' : 'personal';

  yield kipcart.removeFromCart(cart_id, message.user_id, exec.params.focus, cart_type);
  var confirmation = text_reply(message, `Item ${exec.params.focus} removed from your cart`);
  var viewcart = yield handlers['cart.view'](message);
  return [confirmation, viewcart];
};


handlers['cart.view'] = function*(message, exec) {
  kip.debug('cart.view');
  var res = new db.Message({
    incoming: false,
    thread_id: message.thread_id,
    resolved: true,
    user_id: 'kip',
    origin: message.origin,
    source: message.source,
    mode: 'cart',
    action: 'view',
    focus: exec && _.get(exec, 'params.focus')
  })
  var cart_reference_id = (message.source.origin == 'facebook') ? message.source.org : message.cart_reference_id || message.source.team; // TODO
  winston.debug('reply-473: cart_reference_id: ', cart_reference_id)
  res.data = yield kipcart.getCart(cart_reference_id);
  res.data = res.data.toObject();
  if (res.data.items.length < 1) {
    return text_reply(message, 'It looks like your cart is empty');
  }
  kip.debug('view cart message', res);
  return res;
};

handlers['cart.empty'] = function*(message, exec) {
  kip.debug('cart.empty');
  var res = new db.Message({
    incoming: false,
    thread_id: message.thread_id,
    resolved: true,
    user_id: 'kip',
    origin: message.origin,
    source: message.source,
    mode: 'cart',
    action: 'empty'
  });
  var cart_reference_id = (message.source.origin == 'facebook') ? message.source.org : message.cart_reference_id || message.source.team; // TODO
  winston.debug('reply_logic cart.empty handler: cart_reference_id: ', cart_reference_id, ' message: ', message.source);
  res.data = yield kipcart.emptyCart(cart_reference_id);
  res.data = res.data.toObject();
  if (res.data.items.length < 1) {
    return text_reply(message, 'Your cart is now empty');
  }
  kip.debug('empty cart message', res);
  return res;
};


;`
                         __
           ---_ ...... _/_ -
          /  .      ./ .'*\ \
          : '         /__-'   \.
         /                      )
       _/                  >   .'
     /   .   .       _.-" /  .'
     \           __/"     /.'/|
       \ '--  .-" /     //' |\|
        \|  \ | /     //_ _ |/|
          .  \:     //|_ _ _|\|
         | \/.    //  | _ _ |/| ASH
          \_ | \/ /    \ _ _ \\\
              \__/      \ _ _ \|\
`







//
// Returns the amazon results as it is stored in the db (json string)
// Recalls more history from the db if it needs to, and the history is just appended
// to the existing history so you don't need to worry about stuff getting too messed up.
//
function* getLatestAmazonResults(message) {
  var results, i = 0;
  while (!results) {
    if (!message.history[i]) {
      var more_history = yield db.Messages.find({
        thread_id: message.thread_id,
        ts: {
          $lte: message.ts
        }
      }).sort('-ts').skip(i).limit(20);

      if (more_history.length === 0) {
        winston.debug(message);
        throw new Error('Could not find amazon results in message history for message ' + message._id)
      }

      message.history = message.history.concat(more_history);
    }

    try {
      results = JSON.parse(message.history[i].amazon);
      results[0].ASIN[0]; // check to make sure there is an actual result
    } catch (e) {
      results = false;
      // welp no results here.
    }

    i++;
  }
  return results;
}

//
// Gets the most recent set of params used to search amazon
//
function* getLatestAmazonQuery(message) {
  var params, i = 0;
  while (!params) {
    if (!message.history[i]) {
      var more_history = yield db.Messages.find({
        thread_id: message.thread_id,
        ts: {
          $lte: message.ts
        }
      }).sort('-ts').skip(i).limit(20);

      if (more_history.length === 0) {
        throw new Error('Could not find amazon results in message history for message ' + message._id)
      }

      message.history = message.history.concat(more_history);
    }

    var m = message.history[i];
    if (m.mode === 'shopping' && m.action === 'results' && m.execute[0].params.query) {
      params = m.execute[0].params;
    }

    i++;
  }
  return params;
}
