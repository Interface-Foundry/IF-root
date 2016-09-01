var co = require('co');
var kip = require('kip');
var queue = require('../queue-mongo');
var db = require('../../../db');
var Chatuser = db.Chatuser;
var _ = require('lodash');
var http = require('http');
var request = require('request');
var async = require('async');
var fs = require('fs');
//set env vars
var config = require('../../../config');
var quiz = require('./onboard_quiz');

/**
 * This function sends a basic text message to the user. it will split up the length of the text as necessary.
 * @param {string} img: name of file
 * @param {string} sender: input raw sender id sent from fb
 * @param {string} fbtoken: facebook send api token
 * @param {object} callback: callback function
 */

var send_text = function* (channel, text, outgoing, fbtoken) {
  //intercept of vanilla help message when user types 'help' instead of clicking help button
  if (text.indexOf("I'm Kip, your penguin shopper.") > -1)
  {
     fb_utility.send_suggestions_card(sender, fbtoken);
     return
  }
  function chunkString(str, length) {
    return str.match(new RegExp('.{1,' + length + '}', 'g'));
  }
  if (text.length >= 200) {
      var text_array = chunkString(text, 250)
      var el_count = 0;
      var char_count = 0;
      var current_chunk = ''
      async.eachSeries(text_array, function iterator(chunk, cb){
          char_count = char_count + chunk.length;
          if (el_count == text_array.length-1) {
               request({
                  url: 'https://graph.facebook.com/v2.7/me/messages',
                  qs: {
                      access_token: fbtoken
                  },
                  method: 'POST',
                  json: {
                      recipient: {
                          id: channel
                      },
                      message: {text: current_chunk},
                      notification_type: "NO_PUSH"
                  }
              }, function(err, res, body) {
                  if (err) console.error('post err ', err);
                  console.log(body);
                  char_count = 0;
                  current_chunk = '';
                  el_count++;
                  cb();
              });
          }
          else if (char_count > 125) {
               request({
                  url: 'https://graph.facebook.com/v2.7/me/messages',
                  qs: {
                      access_token: fbtoken
                  },
                  method: 'POST',
                  json: {
                      recipient: {
                          id: channel
                      },
                      message: {text: current_chunk},
                      notification_type: "NO_PUSH"
                  }
              }, function(err, res, body) {
                  if (err) console.error('post err ', err);
                  console.log(body);
                  char_count = 0;
                  current_chunk = '';
                  el_count++;
                  cb();
              });
          }
          else {
              current_chunk = current_chunk + ' ' + chunk;
              el_count++;
              cb()
          }
      }, function done() {
        outgoing.ack();

      })
    }
  else {
     request({
          url: 'https://graph.facebook.com/v2.7/me/messages',
          qs: {
              access_token: fbtoken
          },
          method: 'POST',
          json: {
              recipient: {
                  id: channel
              },
              message: {text: text},
              notification_type: "NO_PUSH"
          }
      }, function(err, res, body) {
          if (err) console.error('post err ', err);
          console.log(body);
          outgoing.ack();
      });
  }

}

module.exports = send_text;
