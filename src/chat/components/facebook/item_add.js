require('kip');

var co = require('co');
var _ = require('lodash');
var http = require('http');
var request = require('request');


var queue = require('../queue-mongo');
//set env vars

/**
 * This function sends FBButtons to user to select item
 * @param {object} data:
 * @param {string} channel: facebook api sender id
 * @param {string} text: self explanatory
 * @param {object} outgoing: the entire outgoing message object
 * @param {string} fbtoken: facebook send api token
 */
function* send_variety_again(postback, channel, outgoing, fbtoken) {
  var cur_variation_to_get = Object.keys(postback.remaining_data).pop()
  var cur_variation_opts = postback.remaining_data[cur_variation_to_get]
  var selected_data = postback.selected_data // selected data from postback thing

  cur_variation_to_get = (cur_variation_to_get.length < 11) ? cur_variation_to_get : cur_variation_to_get.slice(0,10)

  delete postback.remaining_data[cur_variation_to_get]
  console.log('deleting cur_variation_to_get', postback)
  var QR_OPTS = createQR(cur_variation_to_get, cur_variation_opts, channel, selected_data, postback.remaining_data)
  QR_OPTS = (QR_OPTS.length>10) ? QR_OPTS.slice(0,10) : QR_OPTS // probably add option to get more options via another button later

  var item_menu = {
  "recipient": {
    "id": channel.toString()
  },
  "message": {
    "quick_replies": QR_OPTS,
    "text": "pick " + getGoodName(cur_variation_to_get)
    }
  }
  console.log('item menu created:', JSON.stringify(item_menu))
  console.log('fbtoken: ', fbtoken)
  request.post({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {
        access_token: fbtoken
    },
    method: "POST",
    // headers: {
    //     "content-type": "application/json",
    // },
    json: {
      recipient: {
        id: channel.toString(),
      },
      message: {
          quick_replies: QR_OPTS,
          text: "pick " + getGoodName(cur_variation_to_get)
      }
    }
  }, function(err, res, body) {
    if (err) console.error('post err ', err);
    console.log('posting to fb')
    console.log(body);
  })
}

// create initial variety picker, from here add everything to payload and just create responses in postback
function* send_variety_picker_initial(data, channel, outgoing, fbtoken) {
  var obj = data.variationValues
  // use this variation
  console.log('channel: ', channel)
  var cur_variation_to_get = Object.keys(obj).pop()
  var cur_variation_opts = obj[cur_variation_to_get]
  var selected_data = {}
  // 10 buttons max, ignore more atm
  cur_variation_to_get = (cur_variation_to_get.length < 11) ? cur_variation_to_get : cur_variation_to_get.slice(0,10)

  delete obj[cur_variation_to_get]
  var QR_OPTS = createQR(cur_variation_to_get, cur_variation_opts, channel, selected_data, obj)
  QR_OPTS = (QR_OPTS.length>10) ? QR_OPTS.slice(0,10) : QR_OPTS // probably add option to get more options via another button later but literally who cares
  var item_menu = {
    "recipient": {
      "id": channel.toString()
    },
    "message": {
      "quick_replies": QR_OPTS,
      "text": "pick " + cur_variation_to_get
    }
  }
  console.log('item menu created:', JSON.stringify(item_menu))
  console.log('fbtoken: ', fbtoken)
  request.post({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {
        access_token: fbtoken
    },
    method: "POST",
    // headers: {
    //     "content-type": "application/json",
    // },
    json: {
      recipient: {
        id: channel.toString(),
      },
      message: {
          quick_replies: QR_OPTS,
          text: "pick " + getGoodName(cur_variation_to_get)
      }
    }
  }, function(err, res, body) {
    if (err) console.error('post err ', err);
    console.log('posting to fb')
    console.log(body);
  })
}

function getGoodName(n) {
  if (_.includes(n, '_')) {
    return n.split('_')[0]
  }
  else {
    return n
  }
}

function processPostback(data) {
  var data = JSON.parse(data.quick_reply)  // response in quick_reply object

  // var prev_selected = { data['key_being_used'] : postback.text}
  return data
}

/*data be something like
{ size_name:
   [ '6 B(M) US',
     '7 B(M) US'] }
     */
  /*"content_type": "text",
            "title":data.option,
            "payload": JSON.stringify({
                    dataId: "facebook_" + sender.toString(),
                    action: "button_search",
                    text: data.option
                })
  */

function createQR(key, options, sender, selected_data, remaining_data) {
  var tmp = []
  options.forEach(function (value) {
    var sd = {}
    sd[key] = value
    tmp.push({
      content_type: "text",
      title: value.length > 10 ? value.slice(0,10) : value,
      // payload needs to include dataId, action, remaining and sle
      payload: JSON.stringify({
        dataId: "facebook_" + sender.toString(),
        action: "item.add",
        // combo selected and value b/c limits and shit but probably will be cause of error in future
        selected_data: _.merge(selected_data, sd),
        remaining_data: remaining_data
        // key_being_used: key,
        // text: value
      })
    })
  })
  return tmp
}

/*
{ dataId: 'facebook_914619145317222',
  action: 'item.add',
  remaining_data: {},
  key_being_used: 'color_name',
  text: 'Black' }
*///not sure what else I need to include
function handleItemPostback(postback, sender) {
  if (Object.keys(postback.remaining_data).length === 0) { // item done, pass back to reply_logic
  var selectedData = combineKeyWithOpt(postback.key_being_used, postback.text, postback.selected_data)
  // send to reply_logic using item.add key
  } else { // create next keys and resend

    // get key and opts
    var cur_variation_to_get = Object.keys(postback.remaining_data).pop()
    var cur_variation_opts = postback.remaining_data[cur_variation_to_get]
    delete postback.remaining_data[cur_variation_to_get]
    // create quick response shit
    var selectedOpts = combineKeyWithOpt(postback.key_being_used, postback.text, postback.selected_data, postback.remaining_data)
  }
}


function combineKeyWithOpt(key, opt, selected_data) {
  var tmp_selected = {}
  if (selected_data.hasOwnProperty(key)) {
    console.log('already in the selected data thing')
    // some form of error
  } else {
    tmp_selected[key] = opt
    return _.merge(selected_data, tmp_selected)
  }
}

// function createMenu(data) {
//  var varietyMenu = {
//     "recipient": {
//         "id": sender.toString()
//     },
//     "message": {
//       "quick_replies": quick_replies_generated
//         "text": "What color do you want this in?"
//     },
//     "notification_type": "NO_PUSH"
//   }
//   request.post({
//       url: 'https://graph.facebook.com/v2.6/me/messages',
//       qs: {
//           access_token: fbtoken
//       },
//       method: "POST",
//       json: true,
//       headers: {
//           "content-type": "application/json",
//       },
//       body: varietyMenu
//   }, function(err, res, body) {
//       if (err) console.error('post err ', err);
//   })

// }

//  exportz
module.exports.send_variety_picker_initial = send_variety_picker_initial
module.exports.send_variety_again = send_variety_again
module.exports.createQR = createQR
