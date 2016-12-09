var winston = require('winston');
winston.level = process.env.NODE_ENV === 'production' ? 'info' : 'debug';
var _ = require('lodash')

var amazon_search = require('../amazon_search.js');
var picstitch = require("../picstitch.js");
var processData = require("../process.js");
var kipcart = require('../cart');
var cardTemplate = require('../slack/card_templates');
var request = require('request');
var slackUtils = require('../slack/utils');
var queue = require('../queue-mongo');

//
// Handlers take something from the message.execute array and turn it into new messages
//
var handlers = {}

//handle buttons
handlers['search_btn'] = function*(message, data) {
  let query = data[0].replace('_', ' ');
  message.text = query;
  const msg = yield handlers['shopping.initial'](message, {
    mode: 'shopping',
    action: 'initial',
    params: {
      query: query
    }
  })
  return [msg];
}

handlers['shopping.initial'] = function*(message, exec) {
  //if switching back to shopping mode from food or some other mode
  if (message.text == 'shopping') {
      return new db.Message({
      incoming: false,
      thread_id: message.thread_id,
      resolved: true,
      user_id: 'kip',
      origin: message.origin,
      source: message.source,
      mode: 'shopping',
      action: 'switch'
      })
  }

  // typing(message);
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
  // yield slackUtils.showLoading(message);
  var results = yield amazon_search.search(exec.params,message.origin);
  // yield slackUtils.hideLoading(message);

  if (results == null || !results) {
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
  });

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

  var results = yield amazon_search.search(exec.params,message.origin);
   if (results == null || !results) {

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
    exec.params.asin = old_results[exec.params.focus - 1].ASIN[0];
  }
    winston.debug('!2', exec)


  var results = yield amazon_search.similar(exec.params,message.origin);
   if (results == null || !results) {

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

handlers['home.expand'] = function*(message, exec) {
  return yield slackUtils.showMenu(message);
};

handlers['home.detract'] = function*(message, exec) {
   return yield slackUtils.hideMenu(message);

};

handlers['home.loading'] = function*(message) {

  kip.debug(' \n\n\n\n\n\n\n\n\n\n  👳shopping.js:393:home.loading', message,'  \n\n\n\n\n\n\n\n\n\n')

  var message = new db.Message({
    incoming: false,
    thread_id: message.thread_id,
    resolved: true,
    user_id: 'kip',
    origin: message.origin,
    source: message.source,
    text: 'Searching...',
  })

  yield queue.publish('outgoing.' + message.origin, message, message._id + '.typing.' + (+(Math.random() * 100).toString().slice(3)).toString(36))
  

   // return new db.Message({
   //    incoming: false,
   //    thread_id: message.thread_id,
   //    mode: 'shopping',
   //    resolved: true,
   //    user_id: 'kip',
   //    origin: message.origin,
   //    source: message.source,
   //    text: 'Searching...'
   //  })
};

handlers['cart.loading'] = function (message) {
  // nothing to see here
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
  winston.debug('INSIDE REPLY_LOGIC SAVEE   :   ', exec.params.focus - 1 );  
  try {
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

module.exports.handlers = handlers

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
