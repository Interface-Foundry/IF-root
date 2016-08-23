require('kip')
var winston = require('winston');
winston.level = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

//
// Handlers take something from the message.execute array and turn it into new messages
//
var handlers = {}
module.exports = {}
module.exports.handlers = handlers

/**
 * Main handler which decides what part of the onbaording process the user is at 
 * 
 * @param {any} message
 */
function * handle(message) {
  var last_action = _.get(message, 'history[0].action')
  if (!last_action) {
    return yield handlers['shopping.initial'](message)
  } else {
    return yield handlers['get-admins.response'](message)
  }
}

module.exports.handle = handle

handlers['shopping.initial'] = function*(message, exec) {
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
