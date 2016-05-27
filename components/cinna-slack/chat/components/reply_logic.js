/*eslint-env es6*/
var async = require('async');
var request = require('request');
var co = require('co')
var _ = require('lodash')
var fs = require('fs')

var banter = require("./banter.js");
// var history = require("./history.js");
var search = require("./search.js");
var amazon_search = require('./amazon_search.js');
var picstitch = require("./picstitch.js");
var processData = require("./process.js");
var purchase = require("./purchase.js");
// var init_team = require("./init_team.js");
// var conversation_botkit = require('./conversation_botkit');
// var weekly_updates = require('./weekly_updates');
var kipcart = require('./cart');
var nlp = require('../../nlp/api');
//set env vars
var config = require('../../config');
var mailerTransport = require('../../mail/IF_mail.js');

//load mongoose models
var mongoose = require('mongoose');
var db = require('../../db');
var Message = db.Message;
var Chatuser = db.Chatuser;
var Slackbots = db.Slackbots;

var supervisor = require('./supervisor');
var upload = require('./upload.js');
var email = require('./email');
/////////// LOAD INCOMING ////////////////

var queue = require('./queue-mongo');
var kip = require('../../kip');

// For container stuff, this file needs to be totally stateless.
// all state should be in the db, not in any cache here.



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
  return msg
}

// sends a simple text reply
function send_text_reply(message, text) {
  var msg = text_reply(message, text);
  queue.publish('outgoing.' + message.origin, msg, message._id + '.reply.' + (+(Math.random() * 100).toString().slice(3)).toString(36))
}

// Make it look like Kip is typing
function typing(message) {
  var msg = {
    action: 'typing'
  };
  queue.publish('outgoing.' + message.origin, msg, message._id + '.typing.' + (+(Math.random() * 100).toString().slice(3)).toString(36))
}


//
// Listen for incoming messages from all platforms because I'm 🌽 ALL 🌽 EARS
//
queue.topic('incoming').subscribe(incoming => {
  co(function*() {
    kip.debug('🔥', incoming);

    // find the last 20 messages in this conversation, including this one
    var history = yield db.Messages.find({
      thread_id: incoming.data.thread_id,
      ts: {
        $lte: incoming.data.ts
      }
    }).sort('-ts').limit(20);

    var message = history[0];
    message.history = history.slice(1);

    // fail fast
    if (message._id.toString() !== incoming.data._id.toString()) {
      throw new Error('correct message not retrieved from db');
    }

    var replies = yield simple_response(message);
    kip.debug('simple replies'.cyan, replies);

    if (!replies || replies.length === 0) {
      replies = yield nlp_response(message);
      kip.debug('nlp replies'.cyan, replies);
    }

    if (!replies || replies.length === 0) {
      kip.error('Could not understand message ' + message._id);
      replies = [default_reply(message)];
    }

    yield replies.map(r => r.save());
    yield replies.map((r, i) => {
      queue.publish('outgoing.' + r.origin, r, message._id + '.reply.' + i);
    });
    incoming.ack();
  }).catch(kip.err);
});


//pre process incoming messages for canned responses
function* simple_response(message) {
  var replies = [];

  //check for canned responses/actions before routing to NLP
  // this adds mode and action to the message
  var reply = banter.checkForCanned(message);

  if (!reply.flag) {
    return
  }

  switch (reply.flag) {
    case 'basic': //just respond, no actions
      return [text_reply(message, reply.res)];

    case 'search.initial':
      //send a reply right away
      send_text_reply(message, reply.res);
      typing(message);

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
      incomingAction(message);
      break;

    case 'cart.remove':
      message.searchSelect = [reply.query];
      message.mode = 'cart';
      message.action = 'remove';
      incomingAction(message);
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
      console.log('Kip response cancelled');
      break;
    default:
      console.log('error: canned action flag missing');
  }

  var messages = yield execute(message);

  return messages;
}



// use nlp to deterine the intent of the user
function* nlp_response(message) {

  // the nlp api adds the processing data to the message
  yield nlp.parse(message);

  console.log(message.execute);
  var debug_message = text_reply(message, '_debug nlp_ `' + JSON.stringify(message.execute[0]) + '`');

  var messages = yield execute(message);

  return [debug_message].concat(messages);
}

// do the things
function execute(message) {
  return co(function*() {
    var messages = yield message.execute.reduce((messages, exec) => {
      var route = exec.mode + '.' + exec.action;
      if (!handlers[route]) {
        throw new Error(route + ' handler not implemented');
      }

      var new_messages = handlers[route](message, exec);
      if (new_messages instanceof Array) {
        messages = messages.concat(new_messages)
      } else {
        messages.push(new_messages)
      }
      return messages;
    }, [])

    kip.debug('messages', messages);

    // only return messages
    return messages.filter(m => m instanceof db.Message);
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
  var results = yield amazon_search.search(exec.params);

  return new db.Message({
    incoming: false,
    thread_id: message.thread_id,
    resolved: true,
    user_id: 'kip',
    origin: message.origin,
    source: message.source,
    text: 'Hi, here are some options you might like. Use `more` to see more options or `buy 1`, `2`, or `3` to get it now 😊',
    amazon: JSON.stringify(results),
    mode: 'shopping',
    action: 'results'
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
    amazon: results,
    mode: 'shopping',
    action: 'focus',
    focus: exec.params.focus
  })
};

handlers['cart.save'] = function*(message, exec) {
  if (!exec.params.focus) {
    throw new Error('no focus for saving to cart');
  }

  var results = yield getLatestAmazonResults(message);
  var result_array = JSON.parse(results);
  var cart_id = message.cart_reference_id || message.source.team; // TODO make this available for other platforms
  try {
    yield kipcart.addToCart(cart_id, message.user_id, result_array[exec.params.focus - 1])
  } catch (e) {
    kip.err(e);
    return text_reply(message, 'Sorry, it\'s my fault – I can\'t add this item to cart. Please click on item link above to add to cart, thanks! 😊')
  }
  kip.debug('hereasdfsaf')

  // view the cart
  return yield handlers['cart.view'](message, exec);
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
  var cart_reference_id = message.cart_reference_id || message.source.team; // TODO
  res.data = yield kipcart.getCart(cart_reference_id);
  res.data = res.data.toObject();
  if (res.data.items.length < 1) {
    return text_reply(message, 'It looks like you have not added anything to your cart yet.');
  }
  kip.debug('view cart message', res);
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
        throw new Error('Could not find amazon results in message history for message ' + message._id)
      }

      message.history = message.history.concat(more_history);
    }

    if (message.history[i].amazon) {
      results = message.history[i].amazon;
    }

    i++;
  }
  return results;
}












//sentence breakdown incoming from python
function incomingAction(data) {
  kip.debug('in mode', data.mode)

  //sort context Mode (search vs. banter vs. purchase)
  switch (data.mode) {
    case 'shopping':
      shoppingMode(data);
      break;
    case 'banter':
      smalltalkMode(data);
      break;
    case 'cart':
      cartMode(data);
      break;
    case 'mode':
      modeMode(data);
      break;
    case 'supervisor':
    //route to supervisor chat window
    default:
      searchMode(data);
  }
}

//* * * * * ACTION CONTEXT ModeS * * * * * * *//

function modeMode(data) {
  // whoa meta a mode to switch modes

}


function shoppingMode(data) {

  //* * * * typing event
  if (data.action == 'initial' || data.action == 'similar' || data.action == 'modify' || data.action == 'more') {
    typing();
  }

  //sort search action type
  switch (data.action) {
    case 'initial':
      search.searchInitial(data);
      break;
    case 'similar':
      search.searchSimilar(data);
      break;
    case 'modify':
    case 'modified': //because the nlp json is wack

      //fix NLP bug TODO
      if (data.dataModify && data.dataModify.val && Array.isArray(data.dataModify.val)) {
        if (data.dataModify.val[0] == 'cheeper' || data.dataModify.val[0] == 'cheper' || data.dataModify.val[0] == 'chiper' || data.dataModify.val[0] == 'chaper' || data.dataModify.val[0] == 'chaeper') {
          data.dataModify.type = 'price';
          data.dataModify.param = 'less';
        }
      }
      search.searchModify(data);
      break;
    case 'focus':
      search.searchFocus(data);
      break;
    case 'back':
      //search.searchBack(data);
      break;
    case 'more':
      search.searchMore(data); //Search more from same query
      break;
    default:
      search.searchInitial(data);
  }
}

function smalltalkMode(data) {
  //sort search action type
  switch (data.action) {
    case 'question':
      break;
    case 'smalltalk':
      outgoingResponse(data, 'txt');
      break;
    default:
  }
}

function cartMode(data) {
  //sort purchase action
  switch (data.action) {
    case 'save':
      saveToCart(data);
      break;
    case 'remove':
      removeCartItem(data);
      break;
    case 'removeAll':
      removeAllCart(data);
      break;
    case 'list':
      viewCart(data);
      break;
    case 'checkout':
      viewCart(data);
      break;
    default:
      console.log('error: no purchase Mode action selected');
  }
}


/////////// OUTGOING RESPONSES ////////////

//process canned message stuff
//data: kip data object
var cannedBanter = function(data) {
  data.mode = 'banter';
  data.action = 'smalltalk';
  incomingAction(data);
}

var sendTxtResponse = function(data, msg, flag) {
  data.action = 'smallTalk';
  if (!msg) {
    console.log('error: no message sent with sendTxtResponse(), using default');
    msg = 'Sorry, I didn\'t understand';
  }
  data.client_res = [];
  data.client_res.push(msg);
  sendResponse(data, flag);
}

//Constructing reply to user
var outgoingResponse = function(data, action, source) { //what we're replying to user with
  // console.log('Mitsu: iojs668: OUTGOINGRESPONSE DATA ', data)
  //stitch images before send to user
  if (action == 'stitch') {
    picstitch.stitchResults(data, source, function(urlArr) {
      //sending out stitched image response
      data.client_res = [];
      data.urlShorten = [];
      processData.urlShorten(data, function(res) {
        var count = 0;

        if (data.source.origin == 'slack') {
          //store a new mongo ID to pass in Slack callback
          data.searchId = mongoose.Types.ObjectId();

        }

        //put all result URLs into arr
        async.eachSeries(res, function(i, callback) {
          data.urlShorten.push(i); //save shortened URLs

          processData.getNumEmoji(data, count + 1, function(emoji) {
            res[count] = res[count].trim();
            if (data.source.origin == 'slack') {

              var attachObj = {};

              var actionObj = [
                {
                  "name": "addcart",
                  "text": "⭐ add to cart",
                  "style": "primary",
                  "type": "button",
                  "value": count
                // "confirm": {
                //   "title": "Are you sure?",
                //   "text": "This will approve the request.",
                //   "ok_text": "Yes",
                //   "dismiss_text": "No"
                // }
                },
                {
                  "name": "cheaper",
                  "text": "💎 cheaper",
                  "style": "default",
                  "type": "button",
                  "value": count
                },
                {
                  "name": "similar",
                  "text": "⚡ similar",
                  "style": "default",
                  "type": "button",
                  "value": count
                },
                {
                  "name": "modify",
                  "text": "🌀 modify",
                  "style": "default",
                  "type": "button",
                  "value": count
                },
                {
                  "name": "moreinfo",
                  "text": "💬 info",
                  "style": "default",
                  "type": "button",
                  "value": count
                }
              ];
              //attachObj.actions = actionObj;
              //attachObj.callback_id = data.searchId; //pass mongo id as callback id so we can access reference later

              attachObj.image_url = urlArr[count];
              attachObj.title = emoji + ' ' + truncate(data.amazon[count].ItemAttributes[0].Title[0]);
              attachObj.title_link = res[count];
              attachObj.color = "#45a5f4";
              attachObj.fallback = 'Here are some options you might like';

              console.log('ATTACH OBJ: ', attachObj);

              data.client_res.push(attachObj);
            // '<'++' | ' + +'>';
            } else if (data.source.origin == 'socket.io') {
              data.client_res.push(emoji + '<a target="_blank" href="' + res[count] + '"> ' + truncate(data.amazon[count].ItemAttributes[0].Title[0]) + '</a>');
              data.client_res.push(urlArr[count]);
            } else if (data.source.origin == 'telegram') {
              var attachObj = {};
              attachObj.photo = urlArr[count];
              attachObj.message = emoji + '[' + truncate(data.amazon[count].ItemAttributes[0].Title[0]) + '](' + res[count] + ')';
              data.client_res.push(attachObj);
            }
            count++;
            callback();
          });
        }, function done() {
          checkOutgoingBanter(data);
        });
      });

    });
  } else if (action == 'txt') {

    banter.getCinnaResponse(data, function(res) {
      if (res && res !== 'null') {
        // data.client_res = [];
        // data.client_res.push(res);
        data.client_res.unshift(res);
      }
      sendResponse(data);
    });
  }
  //no cinna response check
  else if (action == 'final') {
    sendResponse(data);
  }
}

//check for extra banter to send with message.
var checkOutgoingBanter = function(data) {
  banter.getCinnaResponse(data, function(res) {
    if (res && res !== 'null') {
      data.client_res.unshift(res); // add to beginning of message
      // console.log('mitsu6')

      sendResponse(data);
    } else {
      // console.log('mitsu7', res)
      sendResponse(data);
    }
  });
}

//send back msg to user, based on source.origin
var sendResponse = function(data, flag) {

  //SAVE OUTGOING MESSAGES TO MONGO
  if (data.mode && data.action && !(data.flags && data.flags.searchResults)) {
    console.log('SAVING OUTGOING RESPONSE');
    history.saveHistory(data, false, function(res) {
      //whatever
    }); //saving outgoing message
  //});
  } else {
    console.log('error: cant save outgoing response, missing Mode or action');
  }
  /// / / / / / / / / / /

  //* * * * * * * *
  // Socket.io Outgoing
  //* * * * * * * *
  if (data.source && data.source.channel && data.source.origin == 'socket.io') {
    //check if socket user exists
    if (io.sockets.connected[data.source.channel]) {

      //loop through responses in order
      for (var i = 0; i < data.client_res.length; i++) {

        if (typeof data.client_res[i] === 'string') {
          io.sockets.connected[data.source.channel].emit("msgFromSever", {
            message: data.client_res[i]
          });
        }
        //item is an attachment object, send attachment
        else if (data.client_res[i] instanceof Array) {

          for (var z = 0; z < data.client_res[i].length; z++) {
            io.sockets.connected[data.source.channel].emit("msgFromSever", {
              message: data.client_res[i][z].thumb_url
            });
            io.sockets.connected[data.source.channel].emit("msgFromSever", {
              message: '<b>Please use Slack for "view cart"</b>: ' + data.client_res[i][z].text
            });
          }

        } else {
          io.sockets.connected[data.source.channel].emit("msgFromSever", {
            message: data.client_res[i]
          });
        }
      }
    }
    //---supervisor: relay search result previews back to supervisor---//
    else if (data.source.channel && data.source.origin == 'supervisor') {
      data.flags = {
        searchResults: true
      }
      var proxy = data
      delete proxy.amazon
      supervisor.emit(data)
    }
    //----------------------------------------------------------------//
    else {
      console.log('error: socket io channel missing', data);
    }
  }
  //* * * * * * * *
  // Telegram Outgoing
  //* * * * * * * *
  else if (data.source && data.source.channel && data.source.origin == 'telegram') {

    if (data.action == 'initial' || data.action == 'modify' || data.action == 'similar' || data.action == 'more') {

      var message = data.client_res[0]; //use first item in client_res array as text message
      console.log('attachthis ', message);


      //remove first message from res arr
      var attachThis = data.client_res;
      attachThis.shift();

      //attachThis = JSON.stringify(attachThis);

      // console.log('attachthis ',attachThis);



      async.eachSeries(attachThis, function(attach, callback) {
        upload.uploadPicture('telegram', attach.photo, 100, true).then(function(uploaded) {
          tg.sendMessage({
            chat_id: data.source.channel,
            text: attach.message,
            parse_mode: 'Markdown',
            disable_web_page_preview: 'true'
          }).then(function(datum) {
            tg.sendPhoto({
              chat_id: encode_utf8(data.source.channel),
              photo: encode_utf8(uploaded.outputPath)
            }).then(function(datum) {
              if (uploaded.outputPath) {
                fs.unlink(uploaded.outputPath, function(err, res) {
                  // if (err) console.log('fs error: ', err)
                })
              }
              if (uploaded.inputPath) {
                fs.unlink(uploaded.inputPath, function(err, res) {
                  // if (err) console.log('fs error: ', err)
                })
              }
              callback();
            }).catch(function(err) {
              if (err) {
                console.log('ios.js1259: err', err)
              }
              if (uploaded.outputPath) {
                fs.unlink(outputPath, function(err, res) {
                  if (err) console.log('fs error: ', err)
                })
              }
              if (uploaded.inputPath) {
                fs.unlink(inputPath, function(err, res) {
                  if (err) console.log('fs error: ', err)
                })
              }
              callback();
            })
          }).catch(function(err) {
            if (err) {
              console.log('ios.js1264: err', err)
            }
            callback();
          })
        }).catch(function(err) {
          if (err) console.log('\n\n\niojs image upload error: ', err, '\n\n\n')
          callback();
        })
      }, function done() {});

      // var msgData = {
      //   // attachments: [...],
      //     icon_url:'http://kipthis.com/img/kip-icon.png',
      //     username:'Kip',
      //     attachments: attachThis
      // };
      // slackUsers_web[data.source.org].chat.postMessage(data.source.channel, message, msgData, function() {});

    } else if (data.action == 'focus') {

      // console.log('client_res', data.client_res)

      try {
        var formatted = '[' + data.client_res[1].split('|')[1].split('>')[0] + '](' + data.client_res[1].split('|')[0].split('<')[1]
        formatted = formatted.slice(0, -1)
        formatted = formatted + ')'
      } catch (err) {
        console.log('io.js 1269 err: ', err)
        return
      }
      data.client_res[1] = formatted ? formatted : data.client_res[1]
      var toSend = data.client_res[1] + '\n' + data.client_res[2] + '\n' + truncate(data.client_res[3]) + '\n' + (data.client_res[4] ? data.client_res[4] : '')
      // console.log('formatted : ',formatted)
      upload.uploadPicture('telegram', data.client_res[0], 100, true).then(function(uploaded) {
        tg.sendPhoto({
          chat_id: encode_utf8(data.source.channel),
          photo: encode_utf8(uploaded.outputPath)
        }).then(function(datum) {
          tg.sendMessage({
            chat_id: data.source.channel,
            text: toSend,
            parse_mode: 'Markdown',
            disable_web_page_preview: 'true'
          })
          if (uploaded.outputPath) {
            fs.unlink(uploaded.outputPath, function(err, res) {
              // if (err) console.log('fs error: ', err)
            })
          }
          if (uploaded.inputPath) {
            fs.unlink(uploaded.inputPath, function(err, res) {
              // if (err) console.log('fs error: ', err)
            })
          }
        })
      }).catch(function(err) {
        if (err) {
          console.log('ios.js1285: err', err)
        }

      })
    } else if (data.action == 'save') {
      console.log('\n\n\nSAVE: ', data.client_res)
      try {
        var formatted = '[View Cart](' + data.client_res[1][data.client_res[1].length - 1].text.split('|')[0].split('<')[1] + ')'
      // + data.client_res[0].text.split('>>')[1].split('>')[0]
      // formatted = formatted.slice(0,-1)
      // formatted = formatted + ')'
      } catch (err) {
        console.log('\n\n\nio.js 1316-err: ', err, '\n\n\n')
        return
      }
      // console.log('toSend:', toSend,'formatted: ',formatted)
      tg.sendMessage({
        chat_id: data.source.channel,
        text: 'Awesome! I\'ve saved your item for you 😊 Use `checkout` anytime to checkout or `help` for more options.',
        parse_mode: 'Markdown',
        disable_web_page_preview: 'true'
      })
        .then(function() {
          if (formatted) {
            console.log('\n\n\nFORMATTED: ', formatted)
            tg.sendMessage({
              chat_id: data.source.channel,
              text: formatted,
              parse_mode: 'Markdown',
              disable_web_page_preview: 'true'
            })
          }
        })
        .catch(function(err) {
          console.log('io.js 1307 err', err)
        })
    } else if (data.action == 'checkout') {
      console.log('\n\n\nCHECKOUT: ', data.client_res)
      async.eachSeries(data.client_res[1], function iterator(item, callback) {
        console.log('ITEM LEL: ', item)
        if (item.text.indexOf('_Summary') > -1) {
          return callback(item)
        }
        var itemLink = ''
        try {
          itemLink = '[' + item.text.split('|')[1].split('>')[0] + '](' + item.text.split('|')[0].split('<')[1] + ')'
          itemLink = encode_utf8(itemLink)
        } catch (err) {
          console.log('io.js 1296 err:', err)
          return callback(null)
        }
        tg.sendMessage({
          chat_id: data.source.channel,
          text: itemLink,
          parse_mode: 'Markdown',
          disable_web_page_preview: 'true'
        }).then(function() {
          var extraInfo = item.text.split('$')[1]
          extraInfo = '\n $' + extraInfo
          extraInfo = extraInfo.replace('*', '').replace('@', '').replace('<', '').replace('>', '')
          tg.sendMessage({
            chat_id: data.source.channel,
            text: encode_utf8(extraInfo),
            parse_mode: 'Markdown',
            disable_web_page_preview: 'true'
          })
            .then(function() {
              callback(null)
            })
            .catch(function(err) {
              console.log('io.js 1354 err: ', err)
              callback(null)
            })
        })
      }, function done(thing) {
        if (thing.text) {
          // console.log('\n\n DONESKI!', thing)
          var itemLink = ''
          try {
            itemLink = '[Purchase Items](' + thing.text.split('|')[0].split('<')[1] + ')'
            itemLink = encode_utf8(itemLink)
            tg.sendMessage({
              chat_id: data.source.channel,
              text: '_Summary: Team Cart_ \n Total: *$691.37* \n' + itemLink,
              parse_mode: 'Markdown',
              disable_web_page_preview: 'true'
            }).catch(function(err) {
              console.log('io.js 1353 err:', err)
            })
          } catch (err) {
            console.log('io.js 1356 err:', err)
          }
        } else {
          // console.log('wtf is thing: ',thing)
        }
      })


      // // var extraInfo = data.client_res[1][0].text.split('$')[1]
      // // extraInfo = '\n $' + extraInfo
      // // var finalSend = itemLink + extraInfo
      // //      tg.sendMessage({
      // //          chat_id: data.source.channel,
      // //          text: data.client_res[0],
      // //          parse_mode: 'Markdown',
      // //          disable_web_page_preview: 'true'
      // //      }).then(function(){
      //         console.log('finalSend: ', itemLink)
      //          tg.sendMessage({
      //              chat_id: data.source.channel,
      //              text: itemLink,
      //              parse_mode: 'Markdown',
      //              disable_web_page_preview: 'true'
      //          }).then(function(){

    //          // })
    //      }).catch(function(err) {
    //          console.log('io.js 1338 err',err)
    //      })
    } else if (data.action == 'sendAttachment') {
      console.log('\n\n\nTelegram sendAttachment data: ', data, '\n\n\n')
      // //remove first message from res arr
      // var attachThis = data.client_res;
      // attachThis = JSON.stringify(attachThis);

      // var msgData = {
      //   // attachments: [...],
      //     icon_url:'http://kipthis.com/img/kip-icon.png',
      //     username:'Kip',
      //     attachments: attachThis
      // };
      // slackUsers_web[data.source.org].chat.postMessage(data.source.channel, message, msgData, function() {});

    } else {
      console.log('\n\n\nTelegram ELSE : ', data, '\n\n\n')
      //loop through responses in order
      async.eachSeries(data.client_res, function(message, callback) {
        tg.sendMessage({
          chat_id: data.source.channel,
          text: message
        })
        callback();
      }, function done() {});
    }

  }
  //* * * * * * * *
  // Email Outgoing
  //* * * * * * * *
  else if (data.source && data.source.channel && data.source.origin == 'slack' && data.flags && data.flags.email) {

    if (data.action == 'initial' || data.action == 'modify' || data.action == 'similar' || data.action == 'more') {

      var messages = [data.client_res[0]];
      data.client_res.shift();
      var photos = [];
      data.client_res.forEach(function(el, index) {
        messages.push(el.title + '\n\n' + el.title_link);
        photos.push({
          filename: index.toString() + '.png',
          path: el.image_url
        });
      })
      messages.push('Simply reply with your choice (buy 1, buy 2 or buy 3) to add it to cart.  To find out more information about a product reply with the number you wish to get details for. To search again, simply reply with the name of the product you are looking for :)')

      email.results(data).catch((e) => {
        console.log(e.stack);
      });

      // email.reply({
      //   to: data.emailInfo.to,
      //   text: messages.join('\n\n'),
      //   attachments: photos
      // }, data).catch((e) => {
      //   console.log(e.stack);
      // })

    } else if (data.action == 'focus') {
      console.log('EMAIL OUTGOING FOCUS client_res', data.client_res);

      try {
        var formatted = data.client_res[1].split('|')[1].split('>')[0] + '\n\n' + data.client_res[1].split('|')[0].split('<')[1];
        formatted = formatted.slice(0, -1);
      } catch (err) {
        console.log('io.js 1269 err: ', err);
        return;
      }
      data.client_res[1] = formatted ? formatted : data.client_res[1];
      var toSend = data.client_res[1] + '\n\n' + (data.client_res[2] ? data.client_res[2] : '') + '\n\n' + (data.client_res[3] ? data.client_res[3] : '') + '\n\n' + (data.client_res[4] ? data.client_res[4] : '');
      console.log('data.client_res[0] : ', decodeURIComponent(data.client_res[0]))

      email.reply({
        to: data.emailInfo.to,
        text: toSend + '\n\nSimply reply with your choice (buy 1, buy 2 or buy 3) to add it to cart.  To find out more information about a product reply with the number you wish to get details for. To search again, simply reply with the name of the product you are looking for :)',
        attachments: [{
          filename: 'productr32r23r3.jpg',
          path: data.client_res[0]
        }]
      }, data).catch((e) => {
        console.log(e.stack);
      })

    } else if (data.action == 'save') {
      var messages = ['Awesome! I\'ve saved your item for you 😊'];
      data.client_res.shift();
      console.log('\n\n\nEMAIL SAVE: ', data.client_res);
      // data.client_res = JSON.stringify(data.client_res);
      var photos = [];
      data.client_res[0].forEach(function(el, index) {
        // console.log('\n\n\n', el)
        messages.push(el.text + '\n\n');
        if (el.thumb_url) {
          photos.push({
            filename: index.toString() + '.jpg',
            path: el.thumb_url
          });
        }
      })
      console.log('messages ', messages.join('\n\n'), 'photos: ', photos);


      email.reply({
        to: data.emailInfo.to,
        text: messages.join('\n\n'),
        attachments: photos
      }, data);
    } else if (data.action == 'checkout') {
      var messages = ['Awesome! I\'ve saved your item for you 😊'];
      data.client_res.shift();
      console.log('\n\n\nEMAIL SAVE: ', data.client_res);
      // data.client_res = JSON.stringify(data.client_res);
      var photos = [];
      data.client_res[0].forEach(function(el, index) {
        console.log('\n\n\n', el)
        messages.push(el.text + '\n\n');
        if (el.thumb_url) {
          photos.push({
            filename: index.toString() + '.jpg',
            path: el.thumb_url
          });
        }
      })
      console.log('messages ', messages.join('\n\n'), 'photos: ', photos);
      email.reply({
        to: data.emailInfo.to,
        text: messages.join('\n\n'),
        attachments: photos
      }, data);
    } else if (data.action == 'sendAttachment') {
      // console.log('\n\n\nTelegram sendAttachment data: ', data,'\n\n\n')
      // //remove first message from res arr
      // var attachThis = data.client_res;
      // attachThis = JSON.stringify(attachThis);

      // var msgData = {
      //   // attachments: [...],
      //     icon_url:'http://kipthis.com/img/kip-icon.png',
      //     username:'Kip',
      //     attachments: attachThis
      // };
      // slackUsers_web[data.source.org].chat.postMessage(data.source.channel, message, msgData, function() {});

    } else {
      //   console.log('\n\n\nTelegram ELSE : ', data,'\n\n\n')
      // //loop through responses in order
      // async.eachSeries(data.client_res, function(message, callback) {
      //     tg.sendMessage({
      //         chat_id: data.source.channel,
      //         text: message
      //     })
      //     callback();
      // }, function done(){
      // });
    }
  }
  //* * * * * * * *
  // Slack Outgoing
  //* * * * * * * *
  else if (!(data.flags && data.flags.email) && data.source && data.source.channel && data.source.origin == 'slack' || (data.flags && data.flags.toClient)) {

    //eventually cinna can change emotions in this pic based on response type
    var params = {
      icon_url: 'http://kipthis.com/img/kip-icon.png'
    }
    //check if slackuser exists
    if (slackUsers[data.source.org]) {

      if (data.action == 'initial' || data.action == 'modify' || data.action == 'similar' || data.action == 'more') {

        var message;
        //checking for search msg and updating it
        if (messageHistory[data.source.id] && messageHistory[data.source.id].typing) {
          var msgData = {};
          slackUsers_web[data.source.org].chat.update(messageHistory[data.source.id].typing.ts, messageHistory[data.source.id].typing.channel, data.client_res[0], {}, function(err, res) {});

        } else {
          var message = data.client_res[0]; //use first item in client_res array as text message
        }

        //remove first message from res arr
        var attachThis = data.client_res;
        attachThis.shift();

        attachThis = JSON.stringify(attachThis);

        var msgData = {
          // attachments: [...],
          icon_url: 'http://kipthis.com/img/kip-icon.png',
          username: 'Kip',
          attachments: attachThis
        };
        slackUsers_web[data.source.org].chat.postMessage(data.source.channel, message, msgData, function() {});
      } else if (data.action == 'focus') {
        var attachments = [
          {
            "color": "#45a5f4"
          },
          {
            "color": "#45a5f4",
            "fields": []
          }
        ];

        //remove first message from res arr
        var attachThis = data.client_res;

        attachments[0].image_url = attachThis[0]; //add image search results to attachment
        attachments[0].fallback = 'More information'; //fallback for search result

        var actionObj = [
          {
            "name": "AddCart",
            "text": ":thumbsup: Add to Cart",
            "style": "primary",
            "type": "button",
            "value": "yes",
            "confirm": {
              "title": "Are you sure?",
              "text": "This will approve the request.",
              "ok_text": "Yes",
              "dismiss_text": "No"
            }
          }
        ];
        //attachments[0].actions = actionObj;

        attachThis.shift(); //remove image from array

        attachments[1].fallback = 'More information';
        //put in attachment fields
        async.eachSeries(attachThis, function(attach, callback) {
          //attach = attach.replace('\\n','');
          var field = {
            "value": attach,
            "short": false
          }
          attachments[1].fields.push(field);
          callback();

        }, function done() {

          attachments = JSON.stringify(attachments);

          var msgData = {
            // attachments: [...],
            icon_url: 'http://kipthis.com/img/kip-icon.png',
            username: 'Kip',
            attachments: attachments
          };
          slackUsers_web[data.source.org].chat.postMessage(data.source.channel, message, msgData, function() {});

        });
      } else if (data.action == 'sendAttachment') {

        //remove first message from res arr
        var attachThis = data.client_res;
        attachThis = JSON.stringify(attachThis);

        var msgData = {
          // attachments: [...],
          icon_url: 'http://kipthis.com/img/kip-icon.png',
          username: 'Kip',
          attachments: attachThis
        };
        slackUsers_web[data.source.org].chat.postMessage(data.source.channel, message, msgData, function() {});

      } else {
        //loop through responses in order
        async.eachSeries(data.client_res, function(message, callback) {



          //item is a string, send message
          if (typeof message === 'string') {
            var msgData = {
              // attachments: [...],
              icon_url: 'http://kipthis.com/img/kip-icon.png',
              username: 'Kip'
            };
            slackUsers_web[data.source.org].chat.postMessage(data.source.channel, message, msgData, function(err, res) {

              //store typing message for later to remove it
              if (res.ok && flag == 'typing') {

                messageHistory[data.source.id].typing = {
                  ts: res.ts,
                  channel: res.channel
                }

                console.log('👹👹👹 ', messageHistory[data.source.id]);

              } else {
                if (err) {
                  console.log('👹👹👹 delete typing event err ', err);
                }
              }

              callback();
            });
          }
          //item is an attachment object, send attachment
          else if (message !== null && typeof message === 'object' || message instanceof Array) {

            console.log('ATTACH ', message);
            var attachThis = message;
            attachThis = JSON.stringify(attachThis);

            var msgData = {
              icon_url: 'http://kipthis.com/img/kip-icon.png',
              username: 'Kip',
              attachments: attachThis
            };
            slackUsers_web[data.source.org].chat.postMessage(data.source.channel, '', msgData, function() {
              callback();
            });
          }

        }, function done() {

          var msgData = {
            icon_url: 'http://kipthis.com/img/kip-icon.png',
            username: 'Kip',
            attachments: attachThis
          };
          slackUsers_web[data.source.org].chat.postMessage(data.source.channel, '', msgData, function() {});
        });
      }
    } else {
      console.log('error: slackUsers channel missing', slackUsers);
    }
  }
  //---supervisor: relay search result previews back to supervisor---//
  else if (data.source && data.source.channel && data.source.origin == 'supervisor') {
    console.log('Sending results back to supervisor..')
    data.flags = {
      searchResults: true
    }
    // console.log('Supervisor: 728 emitting', data)
    supervisor.emit(data)
  }
  //----------------------------------------------------------------//
  else {
    console.log('error: data.source.channel or source.origin missing')
  }


}



/////////// tools /////////////


//* * * * * * ORDER ACTIONS TEMP!!!!! * * * * * * * * //

//save amazon item to cart
var saveToCart = function(data) {

  //----supervisor: flag to skip history.recallHistory step below ---//
  if (data.flags && data.flags.recalled) {
    // console.log('\n\n\nDATA.FLAGS RECALLED!!!', data.flags)
    var cartHistory = {
      cart: []
    }
    //async push items to cart
    // async.eachSeries(data.searchSelect, function(searchSelect, callback) {
    // if (item.recallHistory && item.recallHistory.amazon){
    // proxy.cart.push(data.amazon[data.searchSelect - 1]); //add selected items to cart
    // }else {
    cartHistory.cart.push(data.amazon[data.searchSelect[0] - 1]); //add selected items to cart
    // }
    // callback();
    // }, function done(){
    console.log('\n\n\nio930: SUPERVISOR cartHistory: ', cartHistory, '\n\n\n')
    if (cartHistory.cart.length == 0) {
      console.log('No items in proxy cart: io.js : Line 933', cartHistory)
      return
    } else {
      // console.log('\n\n\n\n\n I mean brah it shouldnt be coming here....',data.source.id,messageHistory,'\n\n\n\n\n\n')
      purchase.outputCart(data, cartHistory, function(res) {
        // processData.urlShorten(res, function(res2){
        res.client_res = [res.client_res];
        // res.client_res.push(res2);
        // console.log('Mitsu937ios: res2 = :',res2)
        // var proxy = res
        // delete proxy.amazon
        // console.log('Mitsu iojs935: ', JSON.stringify(res.client_res))

        outgoingResponse(res, 'txt');
      });
      // });
      // });
      return
    }
  }
  //-----------------------------------------------------------------//

  data.mode = 'search'; //modifying Mode to recall search history. a hack for now

  history.recallHistory(data, function(item) {
    data.mode = 'purchase'; //modifying Mode. a hack for now
    // console.log('\n\n\nio1288 ok for real doe whats item: ',item)
    //no saved history search object
    if (!item) {
      console.log('\n\n\n\nwarning: NO ITEMS TO SAVE TO CART from data.amazon\n\n\n');
      //cannedBanter(data,'Oops sorry, I\'m not sure which item you\'re referring to');
      sendTxtResponse(data, 'Oops sorry, I\'m not sure which item you\'re referring to');
    } else {

      // co lets us use "yield" to with promises to untangle async shit
      co(function*() {
        var cart;
        for (var index = 0; index < data.searchSelect.length; index++) {
          var searchSelect = data.searchSelect[index];
          console.log('adding searchSelect ' + searchSelect);

          // i am not sure what this does
          if (item.recallHistory && item.recallHistory.amazon) {
            var itemToAdd = item.recallHistory.amazon[searchSelect - 1];
          } else {
            itemToAdd = item.amazon[searchSelect - 1];
          }

          // Check for that pesky situation where we can't add to cart
          // because the user needs to choose size or color options
          if (itemToAdd.mustSelectSize) {
            return processData.getItemLink(_.get(itemToAdd, 'DetailPageURL[0]'), data.source.user, 'ASIN-' + _.get(itemToAdd, 'ASIN[0]')).then(function(url) {
              sendTxtResponse(data, 'Please click on this <' + url + '|Amazon link> to choose your size and style, thanks! 😊');
            }).catch(function(e) {
              console.log('could not get link for item')
              console.log(e.stack)
              sendTxtResponse(data, 'Sorry, it looks like you have to order this particular item directly from Amazon, not me! D:');
            })
          }

          messageHistory[data.source.id].cart.push(itemToAdd); //add selected items to cart
          cart = yield kipcart.addToCart(data.source.org, data.source.user, itemToAdd)
            .catch(function(reason) {
              // could not add item to cart, make kip say something nice
              console.log(reason);
              sendTxtResponse(data, 'Sorry, it\'s my fault – I can\'t add this item to cart. Please click on item link above to add to cart, thanks! 😊');
            })
        }
        // data.client_res = ['<' + cart.link + '|» View Cart>']
        // outgoingResponse(data, 'txt');
        // View cart after adding item TODO doesn't display for some reason
        // Even after adding in 500 ms which solves any amazon rate limiting problems
        if (cart) {
          setTimeout(function() {
            viewCart(data, true);
          }, 500)
        }
      }).then(function() {}).catch(function(err) {
        console.log(err);
        console.log(err.stack)
        sendTxtResponse(data, err);
        //send email about this issue
        var mailOptions = {
          to: 'Kip Server <hello@kipthis.com>',
          from: 'Kip save tp cart broke <server@kipthis.com>',
          subject: 'Kip save tp cart broke',
          text: 'Fix this ok thx'
        };
        mailerTransport.sendMail(mailOptions, function(err) {
          if (err) console.log(err);
        });
      })
    }
  });
}

function removeCartItem(data) {

  // co lets us use "yield" to with promises to untangle async shit
  co(function*() {
    for (var index = 0; index < data.searchSelect.length; index++) {
      var searchSelect = data.searchSelect[index];
      console.log('removing searchSelect ' + searchSelect);

      yield kipcart.removeFromCart(data.source.org, data.source.user, searchSelect);
    }

    data.client_res = ['Item ' + searchSelect.toString() + '⃣ removed from your cart']
    outgoingResponse(data, 'txt');
    viewCart(data);

  }).then(function() {}).catch(function(err) {
    console.log(err);
    console.log(err.stack)
    return;
    sendTxtResponse(data, err);
  })
}

function viewCart(data, show_added_item) {

  console.log('view cart')
  db.Metrics.log('cart.view', data);

  console.log(data.source)

  co(function*() {
    var cart = yield kipcart.getCart(data.source.org);

    if (cart.items.length < 1) {
      return sendTxtResponse(data, 'Looks like you have not added anything to your cart yet.');
    }

    var slackbot = yield db.Slackbots.findOne({
      team_id: data.source.org
    }).exec();

    // admins have special rights
    var isAdmin = slackbot.meta.office_assistants.indexOf(data.source.user) >= 0;
    var isP2P = slackbot.meta.office_assistants.length === 0;

    // get the latest added item if we need to highlight it
    if (show_added_item) {
      var added_item = cart.items[cart.items.length - 1];
      var added_asin = added_item.ASIN;
    }

    var cartObj = [];

    //add mode sticker
    cartObj.push({
      text: '',
      color: '#45a5f4',
      image_url: 'http://kipthis.com/kip_modes/mode_teamcart_view.png'
    })

    for (var i = 0; i < cart.aggregate_items.length; i++) {
      var item = cart.aggregate_items[i];
      var userString = item.added_by.map(function(u) {
        return '<@' + u + '>';
      }).join(', ');

      if (isAdmin || isP2P) {
        var link = yield processData.getItemLink(item.link, data.source.user, item._id.toString());
        console.log(link);
      }

      var actionObj = [
        {
          "name": "RemoveItem",
          "text": "➖",
          "style": "danger",
          "type": "button",
          "value": "no",
          "confirm": {
            "title": "Are you sure?",
            "text": "This will approve the request.",
            "ok_text": "Yes",
            "dismiss_text": "No"
          }
        },
        {
          "name": "AddItem",
          "text": "➕",
          "style": "primary",
          "type": "button",
          "value": "yes"
        }
      ];

      // add title, which is a link for admins/p2p and text otherwise
      var emojiType = (data.flags && data.flags.email) ? 'email' : 'slack';
      if (isAdmin || isP2P) {
        var text = [
          `${processData.emoji[i + 1][emojiType]} <${link}|${item.title}>`,
          `*${item.price}* each`,
          `Quantity: ${item.quantity}`,
          `_Added by: ${userString}_`
        ].join('\n');
      } else {
        var text = [
          `${processData.emoji[i + 1][emojiType]} *${item.title}*`,
          `Quantity: ${item.quantity}`,
          `_Added by: ${userString}_`
        ].join('\n');
      }

      cartObj.push({
        text: text,
        mrkdwn_in: ['text', 'pretext'],
        color: item.ASIN === added_asin ? '#7bd3b6' : '#45a5f4',
        thumb_url: item.image
      // actions: actionObj
      })
    }

    // Only show the purchase link in the summary for office admins.
    if (isAdmin || isP2P) {
      var summaryText = `_Summary: Team Cart_
 Total: *${cart.total}*`;
      summaryText += `
 <${cart.link}|» Purchase Items >`;
      cartObj.push({
        text: summaryText,
        mrkdwn_in: ['text', 'pretext'],
        color: '#49d63a'
      })
    } else {
      //var officeAdmins = slackbot.meta.office_assistants.join(' ')

      if (slackbot.meta.office_assistants && slackbot.meta.office_assistants[0]) {
        var officeAdmins = '<@' + slackbot.meta.office_assistants[0] + '>';
      } else {
        var officeAdmins = '';
      }

      cartObj.push({
        text: '_Office admins ' + officeAdmins + ' can checkout the Team Cart_',
        mrkdwn_in: ['text', 'pretext'],
        color: '#49d63a'
      })
    }

    data.client_res = [];
    data.client_res.push(cartObj);
    console.log('done with cartObj');

    banter.getCinnaResponse(data, function(res) {

      if (res[0] && res[0].text && data.client_res[0]) {


        //console.log('RES TEXT ',res[0].text);
        data.client_res[0].unshift(res[0]);
      // }
      // if (res.length == 1){
      //    console.log('RES TEXT ',res[0].text);
      //    data.client_res[0].unshift(res[0].text);
      // }else {
      //    for (var x = 0; x < res.length; x++) {
      //        data.client_res[0].unshift(res[x].text);
      //    }
      // }
      }

      console.log('CINNARES ', res);

      console.log('CLIENT_RES ', data.client_res);
      sendResponse(data);
    });
    // sendResponse(data);

  }).catch(function(e) {
    console.log('error retriving cart for view cart')
    setTimeout(function() {
      viewCart(data);
    }, 1000);
    console.log(e.stack);
  })
}

//get user history
function recallHistory(data, callback, steps) {

  // console.log(steps);
  if (!data.source.org || !data.source.channel) {
    console.log('missing channel or org Id 3');
  }

  if (!messageHistory[data.source.id]) {
    callback();
  } else {

    //if # of steps to recall
    if (!steps) {
      var steps = 1;
    }
    //get by Mode type
    switch (data.mode) {
      case 'search':
      //console.log(data);

        switch (data.action) {
          //if action is focus, find lastest 'initial' item
          case 'focus':
            var result = messageHistory[data.source.id].search.filter(function(obj) {
              return obj.action == 'initial';
            });
            var arrLength = result.length - steps;
            callback(result[arrLength]);
            break;

          default:
            var arrLength = messageHistory[data.source.id].search.length - steps; //# of steps to reverse. default is 1
            callback(messageHistory[data.source.id].search[arrLength]); //get last item in arr
            break;
        }

        break;
      case 'banter':
        var arrLength = messageHistory[data.source.id].banter.length - steps; //# of steps to reverse. default is 1
        callback(messageHistory[data.source.id].banter[arrLength]); //get last item in arr
        break;
      case 'purchase':
        var arrLength = messageHistory[data.source.id].purchase.length - steps; //# of steps to reverse. default is 1
        callback(messageHistory[data.source.id].purchase[arrLength]); //get last item in arr
      default:
    }

  }

}



//MODE UPDATE HANDLING
var updateMode = function(data) {

  console.log('UPDATE MODE DATA ', data);

  if (!kipUser[data.source.id]) {
    kipUser[data.source.id] = {};
  }

  switch (data.mode) {
    case 'shopping':
      console.log('SHOPPING MODE ON ', data);

      kipUser[data.source.id].conversations = 'shopping';
      //show shopping sticker message

      if (data.action && data.action !== 'initial') {
        incomingAction(data);
      } else {
        shoppingMode(data);
      }
      break;

    case 'settings':
      kipUser[data.source.id].conversations = 'settings';
      //fire show settings
      settingsMode(data);
      console.log('SETTINGS MODE ON')
      break;

    // case 'viewcart':
      //     kipUser[data.source.id].conversations = 'shopping';
      //     incomingAction(data);
      //     //switch to shopping mode and fire view cart
      //     console.log('VIEW CART MODE ON')
      // break;

    case 'collect':
      kipUser[data.source.id].conversations = 'collect';
      collectMode(data);
      // fire collect function
      console.log('COLLECT MODE ON')
      break;

    case 'onboarding':
      kipUser[data.source.id].conversations = 'onboarding';
      // fire collect function
      onboardingMode(data);
      console.log('onboard MODE ON')
      break;

    case 'addmember':
      kipUser[data.source.id].conversations = 'addmember';
      // fire collect function
      addmemberMode(data);
      console.log('onboard MODE ON')
      break;

    case 'report':
      kipUser[data.source.id].conversations = 'shopping';
      // fire collect function
      reportMode(data);
      console.log('report MODE ON')
      break;

    default:
      kipUser[data.source.id].conversations = 'shopping';
      if (data.action && data.action !== 'initial') {
        incomingAction(data);
      } else {
        shoppingMode(data);
      }
      console.log('DEFAULT SHOPPING MODE ON');
      break;

  }

}

//* * * * MODE FUNCTIONS * * * * //
function settingsMode(data) {
  data.mode = 'mode';
  data.action = 'settings';
  history.saveHistory(data, true, function(res) {});

  kipUser[data.source.id].conversations = 'settings';

  co(function*() {
    // um let's refresh the slackbot just in case...
    var slackbot = yield db.Slackbots.findOne({
      team_id: data.source.org
    }).exec();

    return conversation_botkit.settings(slackbot, data.source.user, function(msg) {
      data.mode;
      data.action;

      if (typeof msg === 'object') {
        var obj = _.extend(data, msg); //merge data obj from kip with botkit
      } else {
        var obj = data;
        obj.mode = msg;
      }

      console.log('💎incoming💎 💎 ', obj);
      updateMode(obj);
    })

  }).catch((e) => {
    console.log(e);
    console.log(e.stack);
  })

}


function addmemberMode(data) {
  data.mode = 'mode';
  data.action = 'addmember';
  history.saveHistory(data, true, function(res) {});

  kipUser[data.source.id].conversations = 'addmember';

  co(function*() {

    //var slackbot = yield db.Slackbots.findOne({team_id: team_id}).exec()
    return weekly_updates.addMembers(data.source.org, data.source.user, data.source.channel, function(msg) {

      console.log('done adding members');

      data.mode;
      data.action;

      if (typeof msg === 'object') {
        var obj = _.extend(data, msg); //merge data obj from kip with botkit
      } else {
        var obj = data;
        obj.mode = msg;
      }

      console.log('💎incoming💎 💎 ', obj);
      updateMode(obj);
    })
  }).catch((e) => {
    console.log(e);
    console.log(e.stack);
  })

}

function collectMode(data) {

  data.mode = 'mode';
  data.action = 'collect';
  history.saveHistory(data, true, function(res) {});

  kipUser[data.source.id].conversations = "collect";

  data.text = data.msg; //converting

  if (data.text.indexOf('<#C') >= 0) {
    throw new Error('cannot do "collect #channel" right now')
    console.log('attempting to collect for one or more channels');
    var channels = data.text.match(/<#C[0-9A-Z]+>/g).map(function(markdown) {
      return markdown.replace('<#', '').replace('>', '');
    })
    console.log('channels: ' + channels.join(', '));

    // get list of users in all channels
    return channels.map(function(channel) {

      request('https://slack.com/api/channels.info?token=' + kipUser[data.source.id].slack.bot.bot_access_token + '&channel=' + channel, function(e, r, b) {
        if (e) {
          console.log(e);
        }

        var channelInfo = JSON.parse(r.body)
        debugger;
        if (channelInfo.channel && channelInfo.channel.members) {
          // um okay now what?

          return weekly_updates.collectFromUsers(data.source.org, data.source.user, channel, channelInfo.channel.members, function() {
            console.log('um done collecting orders for channel ' + channel)

            kipUser[data.source.id].conversations = 'shopping';

            //fire same here as exit settings mode!!!!

            // data.mode;
            // data.action;

            // if(typeof msg === 'object'){
            //     var obj = _.extend(data, msg); //merge data obj from kip with botkit
            // }else {
            //     var obj = data;
            //     obj.mode = msg;
            // }

          })
        }
      });

    })
  } else {
    console.log('triggering kip collect, maybe if the person is an admin?')
    return weekly_updates.collect(data.source.org, data.source.user, function() {
      console.log('done collecting orders');
      kipUser[data.source.id].conversations = 'shopping';

      sendTxtResponse(data, 'Done sending last call to all Team Cart Members 😊 Type `settings` for last call options');
    // updateMode();
    })
  }
}

function onboardingMode(data) {

  console.log('ONBOARDING FIRED 💎 💎 💎 💎')

  data.mode = 'mode';
  data.action = 'onboarding';
  history.saveHistory(data, true, function(res) {});

  kipUser[data.source.id].conversations = 'onboarding';

  // "user" is actually the slackbot here
  // "data.user" is the user having the convo
  return conversation_botkit.onboard(kipUser[data.source.id].slack, data.source.user, function() {
    console.log('done with onboarding conversation')
    kipUser[data.source.id].conversations = 'shopping';
  });
}

function shoppingMode(data) {

  console.log('SHOPPING MODE FIRED 💎 💎 💎 💎');

  data.mode = 'mode';
  data.action = 'shopping';
// kipUser[data.source.id].conversations = 'shopping';
}

function reportMode(data) {
  data.mode = 'mode';
  data.action = 'report';
  history.saveHistory(data, true, function(res) {});

  console.log('report generation');

  var isAdmin = kipUser[data.source.id].slack.meta.office_assistants.indexOf(data.source.user) >= 0;
  var isP2P = kipUser[data.source.id].slack.meta.office_assistants.length === 0;
  var num_days = 7;

  console.log('isAdmin:', isAdmin, ' isP2P:', isP2P);
  console.log(JSON.stringify(kipUser, null, 2));
  console.log(data.user);
  console.log(data.source);

  return kipcart.report(kipUser[data.source.id].slack.team_id, num_days).then(function(report) {
    console.log('found ' + report.items.length + ' items');

    var fun_stats = [
      isAdmin || isP2P ? `You added *${report.items.length}* to your cart totalling *${report.total}*` : `You added *${report.items.length}* to your cart`,
      `The most items came from the *${report.top_category}* category`,
      `You searched for *${report.most_searched}* the most`,
      `Most other teams didnt search for *${report.unique_search}* as much as you did!`
    ].join('\n');

    if (report.items.length === 0) {
      fun_stats = 'You have not added anything to your cart.';
    }

    // make a nice slacky item report
    var m = {
      user: kipUser[data.source.id].slack.bot.bot_user_id,
      username: "Kip",
      "text": `*Cart Overview for the last ${num_days} days*`,
      "attachments": [
        {
          "title": "Summary",
          "text": fun_stats,
          "mrkdwn_in": [
            "text",
            "pretext"
          ]
        }
      ]
    };

    m.attachments = m.attachments.concat(report.items
      .sort((a, b) => {
        if (a.purchased != b.purchased) {
          return a.purchased ? 1 : -1;
        }
        return a.added_date - b.added_date;
      })
      .map((item) => {
        var userString = item.added_by.map(function(u) {
          return '<@' + u + '>';
        }).join(', ');

        var text = [
          `${item.title}`,
          isAdmin || isP2P ? `*${item.price}* each` : '',
          `Quantity: ${item.quantity}`,
          isAdmin || isP2P ? `_Added by: ${userString}_` : '',
          item.purchased ? 'Not currently in cart' : '*Currently in cart*',
        ].join('\n').replace(/\n+/g, '\n')

        return {
          "text": text,
          "thumb_url": item.image,
          "mrkdwn_in": [
            "text"
          ],
          "color": item.purchased ? "#45a5f4" : "#7bd3b6"
        };
      }))

    console.log(m);
    slackUsers_web[data.source.org].chat.postMessage(data.source.channel, '', m, function() {
      console.log('um okay posted a message i think?');
    });

  }).catch(function(e) {
    console.log('error generating report');
    console.log(e);
    console.log(e.stack);
  })
}




/////TOOLS

//trim a string to char #
function truncate(string) {
  if (string.length > 80)
    return string.substring(0, 80) + '...';
  else
    return string;
}
;

function encode_utf8(s) {
  return unescape(encodeURIComponent(s));
}


function InvervalTimer(callback, interval) {
  var timerId,
    startTime,
    remaining = 0;
  var state = 0; //  0 = idle, 1 = running, 2 = paused, 3= resumed

  this.pause = function() {
    if (state != 1) return;

    remaining = interval - (new Date() - startTime);
    clearInterval(timerId);
    state = 2;
  };

  this.resume = function() {
    if (state != 2) return;

    state = 3;
    setTimeout(this.timeoutCallback, remaining);
  };

  this.timeoutCallback = function() {
    if (state != 3) return;

    callback();

    startTime = new Date();
    timerId = setInterval(callback, interval);
    state = 1;
  };

  startTime = new Date();
  timerId = setInterval(callback, interval);
  state = 1;
}

/// exports
module.exports.initSlackUsers = initSlackUsers;
module.exports.updateMode = updateMode;
module.exports.newSlack = newSlack;
module.exports.preProcess = preProcess;
module.exports.slackUsers = slackUsers;
module.exports.sendResponse = sendResponse;

module.exports.incomingMsgAction = incomingMsgAction;
module.exports.loadSocketIO = loadSocketIO;

module.exports.sendTxtResponse = sendTxtResponse;
module.exports.cannedBanter = cannedBanter;
module.exports.outgoingResponse = outgoingResponse;
module.exports.checkOutgoingBanter = checkOutgoingBanter;
module.exports.saveToCart = saveToCart;
