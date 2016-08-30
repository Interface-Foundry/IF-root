/*eslint-env es6*/
var async = require('async');
var request = require('request');
var co = require('co');
var _ = require('lodash');
var fs = require('fs');

var banter = require("./banter.js");
// var history = require("./history.js");
// var search = require("./search.js");
var amazon_search = require('./amazon_search.js');
var amazon_variety = require('./amazon_variety.js');

var picstitch = require("./picstitch.js");
var processData = require("./process.js");
var purchase = require("./purchase.js");
// var init_team = require("./init_team.js");
// var conversation_botkit = require('./conversation_botkit');
// var weekly_updates = require('./weekly_updates');
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
  // winston.debug('\n\n\nsendmsg: ', msg);
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
    /////////////////////

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
          replies = yield nlp_response(message);
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
          payload: '{"actions":[{"name":"cheaper","value":"1"}],"callback_id":"57081aeed625bc9f8a359926","team":{"id":"T02PN3B25","domain":"kipsearch"},"channel":{"id":"D0GRF5J4T","name":"directmessage"},"user":{"id":"U02PN3T5R","name":"alyx"},"action_ts":"1460148983.486353","message_ts":"1460148974.000406","attachment_id":"2","token":"obnfDfOpF3e4zKd24pSa9FHg","original_message":{"text":"Hi, here are some options you might like. Use `more` to see more options or `buy 1`, `2` or `3` to get it now :blush:","username":"Kip","icons":{"image_48":"https:\\/\\/s3-us-west-2.amazonaws.com\\/slack-files2\\/bot_icons\\/2015-12-08\\/16204337716_48.png"},"bot_id":"B0GRE31MK","attachments":[{"fallback":"Here are some options you might like","image_url":"https:\\/\\/s3.amazonaws.com\\/if-kip-chat-images\\/ZM0ZP8V7RNXDY81DH4L1HQ7S.png","image_width":400,"image_height":175,"image_bytes":34155,"callback_id":"57081aeed625bc9f8a359926","title":":one: Women\'s Military Up Buckle Combat Boots Mid Knee High E...","id":1,"title_link":"http:\\/\\/goo.gl\\/VgkoLs","color":"45a5f4","actions":[{"id":"1","name":"AddCart","text":"\\u2b50 add to cart","type":"button","value":"0","style":"primary"},{"id":"2","name":"Cheaper","text":"\\ud83d\\udcb8 cheaper","type":"button","value":"0","style":"default"},{"id":"3","name":"Similar","text":"\\u27b0 similar","type":"button","value":"0","style":"default"},{"id":"4","name":"Modify","text":"\\ud83c\\udf00 modify","type":"button","value":"0","style":"default"},{"id":"5","name":"Moreinfo","text":"\\ud83d\\udcac info","type":"button","value":"0","style":"default"}]},{"fallback":"Here are some options you might like","image_url":"https:\\/\\/s3.amazonaws.com\\/if-kip-chat-images\\/CPY561LDJDMINVXX6OI1ICNM.png","image_width":400,"image_height":175,"image_bytes":26562,"callback_id":"57081aeed625bc9f8a359926","title":":two: COCO 1 Womens Buckle Riding Knee High Boots,Coco-01v4.0...","id":2,"title_link":"http:\\/\\/goo.gl\\/u8EY7U","color":"45a5f4","actions":[{"id":"6","name":"AddCart","text":"\\u2b50 add to cart","type":"button","value":"1","style":"primary"},{"id":"7","name":"Cheaper","text":"\\ud83d\\udcb8 cheaper","type":"button","value":"1","style":"default"},{"id":"8","name":"Similar","text":"\\u27b0 similar","type":"button","value":"1","style":"default"},{"id":"9","name":"Modify","text":"\\ud83c\\udf00 modify","type":"button","value":"1","style":"default"},{"id":"10","name":"Moreinfo","text":"\\ud83d\\udcac info","type":"button","value":"1","style":"default"}]},{"fallback":"Here are some options you might like","image_url":"https:\\/\\/s3.amazonaws.com\\/if-kip-chat-images\\/WQSCP0BWTPXYHBTXR7E2PIPS.png","image_width":400,"image_height":175,"image_bytes":22442,"callback_id":"57081aeed625bc9f8a359926","title":":three: Forever Mango-21 Women\'s Winkle Back Shaft Side Zip Kne...","id":3,"title_link":"http:\\/\\/goo.gl\\/teZTD5","color":"45a5f4","actions":[{"id":"11","name":"AddCart","text":"\\u2b50 add to cart","type":"button","value":"2","style":"primary"},{"id":"12","name":"Cheaper","text":"\\ud83d\\udcb8 cheaper","type":"button","value":"2","style":"default"},{"id":"13","name":"Similar","text":"\\u27b0 similar","type":"button","value":"2","style":"default"},{"id":"14","name":"Modify","text":"\\ud83c\\udf00 modify","type":"button","value":"2","style":"default"},{"id":"15","name":"Moreinfo","text":"\\ud83d\\udcac info","type":"button","value":"2","style":"default"}]}],"type":"message","subtype":"bot_message","ts":"1460148974.000406"},"response_url":"https:\\/\\/hooks.slack.com\\/actions\\/T02PN3B25\\/33282428390\\/2Sq4RdP8qAJKRp5JrXfNoGP1"}'
        };
      } else if (res == 'addcart') {
        slackTester = {
          payload: '{"actions":[{"name":"addcart","value":"1"}],"callback_id":"570c721cd365f919d8e2d42d","team":{"id":"T02PN3B25","domain":"kipsearch"},"channel":{"id":"D0GRF5J4T","name":"directmessage"},"user":{"id":"U02PN3T5R","name":"alyx"},"action_ts":"1460433491.790565","message_ts":"1460433437.000476","attachment_id":"2","token":"obnfDfOpF3e4zKd24pSa9FHg","original_message":{"text":"Hi, here are some options you might like. Use `more` to see more options or `buy 1`, `2` or `3` to get it now :blush:","username":"Kip","icons":{"image_48":"https:\\/\\/s3-us-west-2.amazonaws.com\\/slack-files2\\/bot_icons\\/2015-12-08\\/16204337716_48.png"},"bot_id":"B0GRE31MK","attachments":[{"fallback":"Here are some options you might like","image_url":"https:\\/\\/s3.amazonaws.com\\/if-kip-chat-images\\/Q3QUY8L4W7M800SX5VX0ZJPZ.png","image_width":400,"image_height":175,"image_bytes":44065,"callback_id":"570c721cd365f919d8e2d42d","title":":one: Poop Emoji Pillow Emoticon Stuffed Plush Toy Doll Smile...","id":1,"title_link":"http:\\/\\/goo.gl\\/tUkU8X","color":"45a5f4","actions":[{"id":"1","name":"addcart","text":"\\u2b50 add to cart","type":"button","value":"0","style":"primary"},{"id":"2","name":"cheaper","text":":money_mouth_face: cheaper","type":"button","value":"0","style":"default"},{"id":"3","name":"similar","text":"\\u26a1 similar","type":"button","value":"0","style":"default"},{"id":"4","name":"modify","text":"\\ud83c\\udf00 modify","type":"button","value":"0","style":"default"},{"id":"5","name":"moreinfo","text":"\\ud83d\\udcac info","type":"button","value":"0","style":"default"}]},{"fallback":"Here are some options you might like","image_url":"https:\\/\\/s3.amazonaws.com\\/if-kip-chat-images\\/JVK7D21JRMI3W166JGZY3E9E.png","image_width":400,"image_height":175,"image_bytes":43405,"callback_id":"570c721cd365f919d8e2d42d","title":":two: ToLuLu\\u00ae Soft Emoji Bedding Pillow Cushion Car Sofa Pill...","id":2,"title_link":"http:\\/\\/goo.gl\\/slwuZ2","color":"45a5f4","actions":[{"id":"6","name":"addcart","text":"\\u2b50 add to cart","type":"button","value":"1","style":"primary"},{"id":"7","name":"cheaper","text":":money_mouth_face: cheaper","type":"button","value":"1","style":"default"},{"id":"8","name":"similar","text":"\\u26a1 similar","type":"button","value":"1","style":"default"},{"id":"9","name":"modify","text":"\\ud83c\\udf00 modify","type":"button","value":"1","style":"default"},{"id":"10","name":"moreinfo","text":"\\ud83d\\udcac info","type":"button","value":"1","style":"default"}]},{"fallback":"Here are some options you might like","image_url":"https:\\/\\/s3.amazonaws.com\\/if-kip-chat-images\\/QUKE3JMMCWAOFCVSTTFL8WYE.png","image_width":400,"image_height":175,"image_bytes":25642,"callback_id":"570c721cd365f919d8e2d42d","title":":three: Emoji Shirt Smiley - Money Mouth Face - Doller Sign - F...","id":3,"title_link":"http:\\/\\/goo.gl\\/vCPV35","color":"45a5f4","actions":[{"id":"11","name":"addcart","text":"\\u2b50 add to cart","type":"button","value":"2","style":"primary"},{"id":"12","name":"cheaper","text":":money_mouth_face: cheaper","type":"button","value":"2","style":"default"},{"id":"13","name":"similar","text":"\\u26a1 similar","type":"button","value":"2","style":"default"},{"id":"14","name":"modify","text":"\\ud83c\\udf00 modify","type":"button","value":"2","style":"default"},{"id":"15","name":"moreinfo","text":"\\ud83d\\udcac info","type":"button","value":"2","style":"default"}]}],"type":"message","subtype":"bot_message","ts":"1460433437.000476"},"response_url":"https:\\/\\/hooks.slack.com\\/actions\\/T02PN3B25\\/33838187251\\/zVu3xcqUIvln4FbwLLC51zIR"}'
        };
      } else if (res == 'similar') {
        slackTester = {
          payload: '{"actions":[{"name":"similar","value":"2"}],"callback_id":"570c6cef64513dd7d7b1fd24","team":{"id":"T02PN3B25","domain":"kipsearch"},"channel":{"id":"D0GRF5J4T","name":"directmessage"},"user":{"id":"U02PN3T5R","name":"alyx"},"action_ts":"1460433572.400826","message_ts":"1460432112.000473","attachment_id":"3","token":"obnfDfOpF3e4zKd24pSa9FHg","original_message":{"text":"Hi, here are some options you might like. Use `more` to see more options or `buy 1`, `2` or `3` to get it now :blush:","username":"Kip","icons":{"image_48":"https:\\/\\/s3-us-west-2.amazonaws.com\\/slack-files2\\/bot_icons\\/2015-12-08\\/16204337716_48.png"},"bot_id":"B0GRE31MK","attachments":[{"fallback":"Here are some options you might like","image_url":"https:\\/\\/s3.amazonaws.com\\/if-kip-chat-images\\/K8JSSSW1PUVP4IZJLP4M2ZP1.png","image_width":400,"image_height":175,"image_bytes":42014,"callback_id":"570c6cef64513dd7d7b1fd24","title":":one: Poop Emoji Pillow Emoticon Stuffed Plush Toy Doll Smile...","id":1,"title_link":"http:\\/\\/goo.gl\\/tUkU8X","color":"45a5f4","actions":[{"id":"1","name":"addcart","text":"\\u2b50 add to cart","type":"button","value":"0","style":"primary"},{"id":"2","name":"cheaper","text":"\\ud83e\\udd11 cheaper","type":"button","value":"0","style":"default"},{"id":"3","name":"similar","text":"\\u26a1 similar","type":"button","value":"0","style":"default"},{"id":"4","name":"modify","text":"\\ud83c\\udf00 modify","type":"button","value":"0","style":"default"},{"id":"5","name":"moreinfo","text":"\\ud83d\\udcac info","type":"button","value":"0","style":"default"}]},{"fallback":"Here are some options you might like","image_url":"https:\\/\\/s3.amazonaws.com\\/if-kip-chat-images\\/IS52N2SHFGP2RD9BDRKWWXBG.png","image_width":400,"image_height":175,"image_bytes":43405,"callback_id":"570c6cef64513dd7d7b1fd24","title":":two: ToLuLu\\u00ae Soft Emoji Bedding Pillow Cushion Car Sofa Pill...","id":2,"title_link":"http:\\/\\/goo.gl\\/slwuZ2","color":"45a5f4","actions":[{"id":"6","name":"addcart","text":"\\u2b50 add to cart","type":"button","value":"1","style":"primary"},{"id":"7","name":"cheaper","text":"\\ud83e\\udd11 cheaper","type":"button","value":"1","style":"default"},{"id":"8","name":"similar","text":"\\u26a1 similar","type":"button","value":"1","style":"default"},{"id":"9","name":"modify","text":"\\ud83c\\udf00 modify","type":"button","value":"1","style":"default"},{"id":"10","name":"moreinfo","text":"\\ud83d\\udcac info","type":"button","value":"1","style":"default"}]},{"fallback":"Here are some options you might like","image_url":"https:\\/\\/s3.amazonaws.com\\/if-kip-chat-images\\/VTCYNQ0V06PZVODX85ORIE1C.png","image_width":400,"image_height":175,"image_bytes":25642,"callback_id":"570c6cef64513dd7d7b1fd24","title":":three: Emoji Shirt Smiley - Money Mouth Face - Doller Sign - F...","id":3,"title_link":"http:\\/\\/goo.gl\\/vCPV35","color":"45a5f4","actions":[{"id":"11","name":"addcart","text":"\\u2b50 add to cart","type":"button","value":"2","style":"primary"},{"id":"12","name":"cheaper","text":"\\ud83e\\udd11 cheaper","type":"button","value":"2","style":"default"},{"id":"13","name":"similar","text":"\\u26a1 similar","type":"button","value":"2","style":"default"},{"id":"14","name":"modify","text":"\\ud83c\\udf00 modify","type":"button","value":"2","style":"default"},{"id":"15","name":"moreinfo","text":"\\ud83d\\udcac info","type":"button","value":"2","style":"default"}]}],"type":"message","subtype":"bot_message","ts":"1460432112.000473"},"response_url":"https:\\/\\/hooks.slack.com\\/actions\\/T02PN3B25\\/33887511719\\/sh4EXEcx5h2HVAjz5dIIG50i"}'
        };
      } else if (res == 'modify') {
        slackTester = {
          payload: '{"actions":[{"name":"modify","value":"1"}],"callback_id":"570c75d7d365f919d8e2d431","team":{"id":"T02PN3B25","domain":"kipsearch"},"channel":{"id":"D0GRF5J4T","name":"directmessage"},"user":{"id":"U02PN3T5R","name":"alyx"},"action_ts":"1460434417.593489","message_ts":"1460434392.000484","attachment_id":"2","token":"obnfDfOpF3e4zKd24pSa9FHg","original_message":{"text":"Hi, here are some options you might like. Use `more` to see more options or `buy 1`, `2` or `3` to get it now :blush:","username":"Kip","icons":{"image_48":"https:\\/\\/s3-us-west-2.amazonaws.com\\/slack-files2\\/bot_icons\\/2015-12-08\\/16204337716_48.png"},"bot_id":"B0GRE31MK","attachments":[{"fallback":"Here are some options you might like","image_url":"https:\\/\\/s3.amazonaws.com\\/if-kip-chat-images\\/6BSZE72GXWKRR0Y79V72NBC7.png","image_width":400,"image_height":175,"image_bytes":39117,"callback_id":"570c75d7d365f919d8e2d431","title":":one: Youngin\' Blues: The Story of Reed and RaKeem","id":1,"title_link":"http:\\/\\/goo.gl\\/dG0mQm","color":"45a5f4","actions":[{"id":"1","name":"addcart","text":"\\u2b50 add to cart","type":"button","value":"0","style":"primary"},{"id":"2","name":"cheaper","text":":money_mouth_face: cheaper","type":"button","value":"0","style":"default"},{"id":"3","name":"similar","text":"\\u26a1 similar","type":"button","value":"0","style":"default"},{"id":"4","name":"modify","text":"\\ud83c\\udf00 modify","type":"button","value":"0","style":"default"},{"id":"5","name":"moreinfo","text":"\\ud83d\\udcac info","type":"button","value":"0","style":"default"}]},{"fallback":"Here are some options you might like","image_url":"https:\\/\\/s3.amazonaws.com\\/if-kip-chat-images\\/UWF0QVNWH4I4LOA7V9PJX270.png","image_width":400,"image_height":175,"image_bytes":44919,"callback_id":"570c75d7d365f919d8e2d431","title":":two: 2015-16 Totally Certified Roll Call Mirror Camo RC Auto...","id":2,"title_link":"http:\\/\\/goo.gl\\/0UHjD5","color":"45a5f4","actions":[{"id":"6","name":"addcart","text":"\\u2b50 add to cart","type":"button","value":"1","style":"primary"},{"id":"7","name":"cheaper","text":":money_mouth_face: cheaper","type":"button","value":"1","style":"default"},{"id":"8","name":"similar","text":"\\u26a1 similar","type":"button","value":"1","style":"default"},{"id":"9","name":"modify","text":"\\ud83c\\udf00 modify","type":"button","value":"1","style":"default"},{"id":"10","name":"moreinfo","text":"\\ud83d\\udcac info","type":"button","value":"1","style":"default"}]},{"fallback":"Here are some options you might like","image_url":"https:\\/\\/s3.amazonaws.com\\/if-kip-chat-images\\/K89N9L5QU3SVLH3T7QE4YRZN.png","image_width":400,"image_height":175,"image_bytes":48795,"callback_id":"570c75d7d365f919d8e2d431","title":":three: Rakeem Interlude (feat. Merc)","id":3,"title_link":"http:\\/\\/goo.gl\\/XWkxKp","color":"45a5f4","actions":[{"id":"11","name":"addcart","text":"\\u2b50 add to cart","type":"button","value":"2","style":"primary"},{"id":"12","name":"cheaper","text":":money_mouth_face: cheaper","type":"button","value":"2","style":"default"},{"id":"13","name":"similar","text":"\\u26a1 similar","type":"button","value":"2","style":"default"},{"id":"14","name":"modify","text":"\\ud83c\\udf00 modify","type":"button","value":"2","style":"default"},{"id":"15","name":"moreinfo","text":"\\ud83d\\udcac info","type":"button","value":"2","style":"default"}]}],"type":"message","subtype":"bot_message","ts":"1460434392.000484"},"response_url":"https:\\/\\/hooks.slack.com\\/actions\\/T02PN3B25\\/33879490084\\/KY3oPL33C2V4W9V7B45xWEMA"}'
        };
      } else if (res == 'moreinfo') {
        slackTester = {
          payload: '{"actions":[{"name":"moreinfo","value":"0"}],"callback_id":"570c7611d365f919d8e2d433","team":{"id":"T02PN3B25","domain":"kipsearch"},"channel":{"id":"D0GRF5J4T","name":"directmessage"},"user":{"id":"U02PN3T5R","name":"alyx"},"action_ts":"1460434463.610937","message_ts":"1460434449.000488","attachment_id":"1","token":"obnfDfOpF3e4zKd24pSa9FHg","original_message":{"text":"Hi, here are some options you might like. Use `more` to see more options or `buy 1`, `2` or `3` to get it now :blush:","username":"Kip","icons":{"image_48":"https:\\/\\/s3-us-west-2.amazonaws.com\\/slack-files2\\/bot_icons\\/2015-12-08\\/16204337716_48.png"},"bot_id":"B0GRE31MK","attachments":[{"fallback":"Here are some options you might like","image_url":"https:\\/\\/s3.amazonaws.com\\/if-kip-chat-images\\/OBIAI1M7VY2U2BGWWAA3VIZB.png","image_width":400,"image_height":175,"image_bytes":52377,"callback_id":"570c7611d365f919d8e2d433","title":":one: Greatest Hits","id":1,"title_link":"http:\\/\\/goo.gl\\/vpf4iz","color":"45a5f4","actions":[{"id":"1","name":"addcart","text":"\\u2b50 add to cart","type":"button","value":"0","style":"primary"},{"id":"2","name":"cheaper","text":":money_mouth_face: cheaper","type":"button","value":"0","style":"default"},{"id":"3","name":"similar","text":"\\u26a1 similar","type":"button","value":"0","style":"default"},{"id":"4","name":"modify","text":"\\ud83c\\udf00 modify","type":"button","value":"0","style":"default"},{"id":"5","name":"moreinfo","text":"\\ud83d\\udcac info","type":"button","value":"0","style":"default"}]},{"fallback":"Here are some options you might like","image_url":"https:\\/\\/s3.amazonaws.com\\/if-kip-chat-images\\/Z9RGCV9RBFGATNUWVSRUKT7X.png","image_width":400,"image_height":175,"image_bytes":35445,"callback_id":"570c7611d365f919d8e2d433","title":":two: ZZ Way - Spring ZigZag Craft Game","id":2,"title_link":"http:\\/\\/goo.gl\\/W9si1L","color":"45a5f4","actions":[{"id":"6","name":"addcart","text":"\\u2b50 add to cart","type":"button","value":"1","style":"primary"},{"id":"7","name":"cheaper","text":":money_mouth_face: cheaper","type":"button","value":"1","style":"default"},{"id":"8","name":"similar","text":"\\u26a1 similar","type":"button","value":"1","style":"default"},{"id":"9","name":"modify","text":"\\ud83c\\udf00 modify","type":"button","value":"1","style":"default"},{"id":"10","name":"moreinfo","text":"\\ud83d\\udcac info","type":"button","value":"1","style":"default"}]},{"fallback":"Here are some options you might like","image_url":"https:\\/\\/s3.amazonaws.com\\/if-kip-chat-images\\/WOIKXKZKL7JO3J6IR9L8YFJ5.png","image_width":400,"image_height":175,"image_bytes":52322,"callback_id":"570c7611d365f919d8e2d433","title":":three: Til The Casket Drops [Explicit]","id":3,"title_link":"http:\\/\\/goo.gl\\/tDTjNp","color":"45a5f4","actions":[{"id":"11","name":"addcart","text":"\\u2b50 add to cart","type":"button","value":"2","style":"primary"},{"id":"12","name":"cheaper","text":":money_mouth_face: cheaper","type":"button","value":"2","style":"default"},{"id":"13","name":"similar","text":"\\u26a1 similar","type":"button","value":"2","style":"default"},{"id":"14","name":"modify","text":"\\ud83c\\udf00 modify","type":"button","value":"2","style":"default"},{"id":"15","name":"moreinfo","text":"\\ud83d\\udcac info","type":"button","value":"2","style":"default"}]}],"type":"message","subtype":"bot_message","ts":"1460434449.000488"},"response_url":"https:\\/\\/hooks.slack.com\\/actions\\/T02PN3B25\\/33890435429\\/zRrVRvLmlnN8PEDyvMcQWNIx"}'
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
  kip.debug('!1',exec)

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
    kip.debug('!2', exec)

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
    kip.debug(old_results);
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
  kip.debug('!3', exec)
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
          kip.debug('-4')

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
      kip.debug('!4', exec)

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
    try {
      amazon_variety.getVariations(results[exec.params.focus - 1], message)
    } catch (err) {
      kip.err(e);
      return text_reply(message, 'Sorry, it\'s my fault – I can\'t add this item to cart. Please click on item link above to add to cart, thanks! 😊')
  }
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