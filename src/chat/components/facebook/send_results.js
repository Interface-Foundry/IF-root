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
 * This function send results to user
 * @param {string} channel: facebook api sender id
 * @param {string} text: self explanatory
 * @param {object} outgoing: the entire outgoing message object
 * @param {string} fbtoken: facebook send api token
 */

var send_results = function* (channel, text, results, outgoing, fbtoken) {

  var giphy_gif = ''

request('http://api.giphy.com/v1/gifs/search?q=' + outgoing.data.original_query + '&api_key=dc6zaTOxFJmzC', function(err, res, body) {
    if (err) console.log(err);

    // console.log('GIFY RETURN DATA: ', JSON.parse(body).data[0])
    giphy_gif = JSON.parse(body).data[0] ? JSON.parse(body).data[0].images.fixed_width_small.url :  'http://kipthis.com/images/header_partners.png';

    var cards = results.map((result, i) => {
        var n = i + 1 + '';

        //get picstitch image
        if (result && result.image_url){
            var image = ((result.image_url.indexOf('http') > -1) ? result.image_url : 'http://kipthis.com/images/header_partners.png')
        } else {
            kip.debug('error: no result.image_url (picstitch) found');
            var image = 'http://kipthis.com/images/header_partners.png';
        }
        return {
                "title": result.title,
                "image_url": (result.image_url && result.image_url.indexOf('http') > -1 ? result.image_url : 'http://kipthis.com/images/header_partners.png'),
                "buttons": [{
                    "type": "postback",
                    "title": "Add to Cart",
                    "payload": JSON.stringify({
                        dataId: outgoing.data.thread_id,
                        object_id: outgoing.data._id,
                        action: "add",
                        selected: i + 1,
                        ts: outgoing.data.ts,
                        initial: true
                    })
                },
                {
                    "type": "web_url",
                    "url": result.title_link,
                    "title": "View on Amazon"
                },
                {
                    "type": "postback",
                    "title": "Details",
                    "payload": JSON.stringify({
                        dataId: outgoing.data.thread_id,
                        action: "focus",
                        selected: i + 1,
                        ts: outgoing.data.ts
                    })
                }],
            }
    });

    cards.push( {
        "title": 'Click "See More Results" below for more products!',
        "image_url": giphy_gif,
        "buttons": [{
            "type": "postback",
            "title": "See More Results",
            "payload": JSON.stringify({
                dataId: outgoing.data.thread_id,
                action: "more",
                ts: outgoing.data.ts
            })
        },{
            "type": "postback",
            "title": "View Cart",
            "payload": JSON.stringify({
                dataId: outgoing.data.thread_id,
                action: "list",
                ts: outgoing.data.ts
            })
         }]})
       var modify_menu = {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": cards
                }
            },
            "quick_replies":[
                      {
                        "content_type":"text",
                        "title":"Cheaper",
                        "payload": JSON.stringify({
                                action: "cheaper",
                                selected: '1'
                            })
                      },
                      {
                        "content_type":"text",
                        "title":"Similar",
                        "payload": JSON.stringify({
                                action: "similar",
                                selected: "1"
                            })
                      },
                      {
                        "content_type":"text",
                        "title":"Color",
                        "payload": JSON.stringify({
                                action: "sub_menu_color",
                                selected: "1"
                            })
                      },
                      {
                        "content_type":"text",
                        "title":"Emoji",
                        "payload": JSON.stringify({
                                dataId: outgoing.data.thread_id,
                                action: "sub_menu_emoji",
                                selected: "1"
                            })
                      }
                    ]
        };

        //prevents showing back when there's no back
        // if (backCache > 0){
        //     console.log('BACK CACHE')
        //     modify_menu.quick_replies.push({
        //         "content_type":"text",
        //         "title":" < Back",
        //         "payload": JSON.stringify({
        //                 action: "back",
        //                 type:"last_search"
        //             })
        //       });
        // }

        request({
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: {
                access_token: fbtoken
            },
            method: 'POST',
            json: {
                recipient: {
                    id: channel
                },
                message: modify_menu,
            }
        }, function(err, res, body) {
            if (err) console.error('post err ', err);
            console.log(body);
            outgoing.ack();
        });
 })
}

module.exports = send_results;