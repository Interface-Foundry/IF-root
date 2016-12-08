var express = require('express');
var app = express();
var builder = require('botbuilder');
var co = require('co');
var queue = require('../queue-mongo');
var _ = require('lodash');
var http = require('http');
var request = require('request');
var async = require('async');
var bodyParser = require('body-parser');
var busboy = require('connect-busboy');
var fs = require('fs');
var emojiText = require('emoji-text'); //convert emoji to text
var parse_results = require('./parse_res');
var focus = require('./focus');
var kipcart = require('../cart');
var process_image = require('../process');
var fs = require('fs');

//=========================================================
// Server Setup
//=========================================================
var server = require('http').createServer(app);
var keyfile = process.env.NODE_ENV === 'production' ? __dirname + '/skype-prod.pfx' : __dirname + '/skype-dev.pfx';
var httpsServer = require('https').createServer({
  pfx: fs.readFileSync(keyfile)
}, app);

server.listen(8000, function(e) {
    if (e) {
        console.error(e)
    }
    console.log('botbuilder app listening on port 8000 🌏 💬')
})
httpsServer.listen(4343, function(e) {
  if (kip.err(e)) return;
  console.log('botbuilder app listening on https port 4343')
})



//=========================================================
// Bot Setup
//=========================================================
var credentials = {
  mitsu: {
    appId:'589f13e8-1c04-4823-832d-195b793faf20',
    appPassword: 'EFePMpRio0eO0Trubona4O2'
  },
  alyx: {
    appId: '318a63f8-c9bc-406a-adf1-0bea5b333f3d',
    appPassword:'4LZ837bTJiB1a64mTpUA2NO'
  },
  "test-a": {
    appId: '7e0eb83a-53b9-4b91-94ff-c2feed28f3c5',
    appPassword:'oKSt75PfRSdnjg4HgoKYSRP'
  },
  "test-b": {
    appId: 'c65fabd5-6a4a-47a4-9853-74e2c63d067e',
    appPassword: 'caPpo0JpX9SmkKTf2iro1tQ'
  },
  kip: {
    appId: '7431dd85-ac18-41e7-9941-e3fe37ae6d75',
    appPassword:'8pgJToqGYgZuPT8mm0Mmk26'
  },
  target: {
    appId: 'b8460a2d-96d0-4c68-97e6-56fae6c22f00',
    appPassword: 'SSgTUmntbe77OULjVknZmwg'
  }
};




//pick the credentials we need
if(process.env.NODE_ENV == 'development_mitsu') {
  var names = ['mitsu'];
} else if (process.env.NODE_ENV == 'development') {
  names = ['test-a', 'test-b'];
} else if (process.env.NODE_ENV === 'production') {
  names = ['kip', 'target'];
} else {
  names = ['alyx']
}

var bots = names.map(name => {
  kip.log('Loading bot', name.cyan);

  var connector = new builder.ChatConnector(credentials[name]);
  app.post('/api/messages/', connector.listen());
  var bot = new builder.UniversalBot(connector);
  setup_bot(bot);
})


var sessions = {};

function setup_bot(bot) {
//welcome message
// bot.dialog('/', [
//     function (session) {
//         // Send a greeting and show help.
//         var card = new builder.HeroCard(session)
//             .title("Microsoft Bot Framework")
//             .text("Your bots - wherever your users are talking.")
//             .images([
//                  builder.CardImage.create(session, "http://docs.botframework.com/images/demo_bot_image.png")
//             ]);
//         var msg = new builder.Message(session).attachments([card]);
//         session.send(msg);
//         session.send("Hi... I'm the Microsoft Bot Framework demo bot for Skype. I can show you everything you can use our Bot Builder SDK to do on Skype.");
//         session.beginDialog('/help');
//     },
//     function (session, results) {
//         // Display menu
//         session.beginDialog('/menu');
//     },
//     function (session, results) {
//         // Always say goodbye
//         session.send("Ok... See you later!");
//     }
// ]);


//welcome message :)
bot.on('contactRelationUpdate', function (message) {

    //TBD
    if (message.action === 'add') {
        var name = message.user ? message.user.name : null;
        var reply = new builder.Message()
                .address(message.address)
                .text("Hi %s – I'm Kip, your penguin shopper! Tell me what you're looking for and I'll show you 3 options.", name || 'there');

        bot.send(reply);


        //bbbutons: (my country not here)
        //---> tell us which country to send to: "Which country to add next?"

    } else {
        //remove user from DB!
    }
});




bot.dialog('/', function (session) {

    var text = session.message.text;
    var user = session.message.user;
    sessions[user.id] = session;
   // message:
   // { type: 'message',
   //   timestamp: '2016-07-08T21:18:46.707Z',
   //   text: 'wjgifwjgwiogjwgjgirgei',
   //   entities: [ [Object] ],
   //   address:
   //    { id: '3yrKrjkz3E8LnRvk',
   //      channelId: 'skype',
   //      user: [Object],
   //      conversation: [Object],
   //      bot: [Object],
   //      serviceUrl: 'https://skype.botframework.com' },
   //   attachments: [],
   //   user: { id: '29:1LJMJ1EMFNK3vkP5B1OjgL5M082J45ynqIct-OLEj0Jo' } },
   //Postback handler
   // if (session.message.value.dataId) {
   //   console.log('\n\n\n\n\n\n\n\n\n\n\nGOTTA CATCH EM ALLLLLLLLL\n\n\n\n\n\n\n\n\n\n\n\n')
   // }

    // bot.on('typing', function (message) {
    //     // User is typing
    // });

    //Attachment Handling
     if (session.message.attachments && session.message.attachments[0] && session.message.attachments[0].contentType == 'image') {
         var data = { file: {url_private: session.message.attachments[0].contentUrl}};
         return process_image.imageSearch(data,'',function(res){
            console.log('\nTranslated image',res)
            if (res && res.length > 0) {
                var message = new db.Message({
                    incoming: true,
                    thread_id: user.id,
                    cart_reference_id: user.id,
                    original_text: res,
                    user_id: user.id,
                    origin: 'skype',
                    source: {
                        'origin': 'skype',
                        'channel': 'skype_' + user.id,
                        'org': "skype_" + user.id,
                        'id': "skype_" + user.id,
                        'user': "skype_" + user.id
                    },
                    ts: Date.now(),
                    session: session
                });
                // queue it up for processing
                message.save().then(() => {
                    queue.publish('incoming', message, ['skype', user.id, +message.ts].join('.'))
                });
            }
        });
    }
    else if (session.message.attachments && session.message.attachments[0]) {
         var img_array = [
            'http://kipthis.com/kip_stickers/kip1.png',
            'http://kipthis.com/kip_stickers/kip2.png',
            'http://kipthis.com/kip_stickers/kip3.png',
            'http://kipthis.com/kip_stickers/kip4.png',
            'http://kipthis.com/kip_stickers/kip5.png',
            'http://kipthis.com/kip_stickers/kip6.png',
            'http://kipthis.com/kip_stickers/kip7.png',
            'http://kipthis.com/kip_stickers/kip8.png',
            'http://kipthis.com/kip_stickers/kip9.png'
            ];
         var msg = new builder.Message(session)
            .attachments([{
                contentType: "image/jpeg",
                contentUrl: img_array[Math.floor(Math.random()*img_array.length)]
            }]);
        session.send(msg);
        return
    }

    text = emojiText.convert(text,{delimiter: ' '});

    text = skypeEmojiHack(text);

    var message = new db.Message({
        incoming: true,
        thread_id: user.id,
        cart_reference_id: user.id,
        original_text: text,
        user_id: user.id,
        origin: 'skype',
        source: {
            'origin': 'skype',
            'channel': user.id,
            'org': "skype_" + user.id,
            'id': "skype_" + user.id,
            'user': "skype_" + user.id
        },
        ts: Date.now(),
        session: session
    });
    // clean up the text
    message.text = message.original_text.trim(); //remove extra spaces on edges of string
    console.log('>>>>'.yellow, message.text.yellow);

    // queue it up for processing
    message.save().then(() => {
        queue.publish('incoming', message, ['skype', user.id, +message.ts].join('.'))
    }).catch(kip.err);
})


bot.dialog('/results', [
    function (session) {
     // console.log(channel, text, results, outgoing)
        co(function*(){
             var giphy_gif = '';
         yield request('http://api.giphy.com/v1/gifs/search?q=' + session.outgoing.data.original_query + '&api_key=dc6zaTOxFJmzC', function(err, res, body) {
            if (err) console.log(err);
            // console.log('GIFY RETURN DATA: ', JSON.parse(body).data[0])
            giphy_gif = JSON.parse(body).data[0] ? JSON.parse(body).data[0].images.fixed_width_small.url :  'http://kipthis.com/images/header_partners.png';
            //picstitch images
            // var image1 = ((results[0].image_url.indexOf('http') > -1) ? results[0].image_url : 'http://kipthis.com/images/header_partners.png')
            // var image2 = ((results[1].image_url.indexOf('http') > -1) ? results[1].image_url : 'http://kipthis.com/images/header_partners.png')
            // var image3 = ((results[2].image_url.indexOf('http') > -1) ? results[2].image_url : 'http://kipthis.com/images/header_partners.png')

            if(session.outgoing.data.amazon){
                //amazon images
                var parsedAmazon = JSON.parse(session.outgoing.data.amazon);
                // console.log('\n\n\n DOOOO ',parsedAmazon[0])
                var image1 = ((session.results[0].image_url.indexOf('http') > -1) ? session.results[0].image_url : 'http://kipthis.com/images/header_partners.png');
                var image2 = ((session.results[1].image_url.indexOf('http') > -1) ? session.results[1].image_url : 'http://kipthis.com/images/header_partners.png');
                var image3 = ((session.results[2].image_url.indexOf('http') > -1) ? session.results[2].image_url : 'http://kipthis.com/images/header_partners.png');
            }
            // console.log('SEND_RESULTS FIRED, RESULTS: ', results)
            //Ask the user to select an item from a carousel.
            var msg = new builder.Message(session)
                .textFormat(builder.TextFormat.xml)
                .attachmentLayout('carousel')
                .attachments([
                    new builder.HeroCard(session)
                        .title(session.results[0].title)
                        // .subtitle("Space Needle")
                        .text("<a href="+session.results[0].title_link+">Read reviews on Amazon</a>")
                        .images([
                            builder.CardImage.create(session, image1)
                                .tap(builder.CardAction.showImage(session, results[0].title_link)),
                        ])
                        .tap(builder.CardAction.openUrl(session, session.results[0].title_link))
                        .buttons([
                            builder.CardAction.imBack(session, 
                                'Added!<context hidden="save 1" />'
                                // '<dataId:' + session.outgoing.data.thread_id + ', action=\"add\", selected=\"1\", ts: '+ session.outgoing.data.ts + ', initial:\"true\" />'
                            , "Add to Cart"),
                            builder.CardAction.imBack(session, "Cheaper!<context hidden='1 but cheaper' />" , "Find Cheaper"),
                            builder.CardAction.imBack(session, "1", "More Info")
                        ]),
                    new builder.HeroCard(session)
                        .title(session.results[1].title)
                        // .subtitle("Space Needle")
                        .text("<a href="+ session.results[1].title_link+">Read reviews on Amazon</a>")
                        .images([
                            builder.CardImage.create(session, image2)
                                .tap(builder.CardAction.showImage(session, results[1].title_link)),
                        ])
                        .tap(builder.CardAction.openUrl(session, session.results[1].title_link))
                        .buttons([
                            builder.CardAction.imBack(session, 
                                'Added!<context hidden="save 2" />'
                                // '<dataId:' + session.outgoing.data.thread_id + ', action=\"add\", selected=\"2\", ts: '+ session.outgoing.data.ts + ', initial:\"true\" />'
                            , "Add to Cart"),
                            builder.CardAction.imBack(session, "Cheaper!<context hidden='2 but cheaper' />" , "Find Cheaper"),
                            builder.CardAction.imBack(session, "2", "More Info")
                        ]),
                    new builder.HeroCard(session)
                        .title(session.results[2].title)
                        // .subtitle("Space Needle")
                        .text("<a href="+session.results[2].title_link+">Read reviews on Amazon</a>")
                        .images([
                            builder.CardImage.create(session, image3)
                                .tap(builder.CardAction.showImage(session, results[2].title_link)),
                        ])
                        .tap(builder.CardAction.openUrl(session, session.results[2].title_link))
                        .buttons([
                            builder.CardAction.imBack(session, 
                                'Added!<context hidden="save 3" />'
                                // '<dataId:' + session.outgoing.data.thread_id + ', action=\"add\", selected=\"3\", ts: '+ session.outgoing.data.ts + ', initial:\"true\" />'
                            , "Add to Cart"),
                            builder.CardAction.imBack(session, "Cheaper!<context hidden='3  but cheaper' />" , "Find Cheaper"),
                            builder.CardAction.imBack(session, "3", "More Info")
                        ])
                 ]);
                    // builder.Prompts.choice(session, msg, "select:100|select:101|select:102");
                    session.endDialog(msg);
             })
         })




        // builder.Prompts.choice(session, "What demo would you like to run?", "prompts|picture|cards|list|carousel|receipt|(quit)");







    },
    function (session, results) {
        // if (results.response && results.response.entity != '(quit)') {
        //     // Launch demo dialog
        //     session.beginDialog('/' + results.response.entity);
        // } else {
            // Exit the menu
            session.endDialog();
        // }
    },
    function (session, results) {
        // The menu runs a loop until the user chooses to (quit).
        session.replaceDialog('/');
    }
]);

}

//
// Mechanism for responding to messages
//
kip.debug('subscribing to outgoing.skype');
queue.topic('outgoing.skype').subscribe(outgoing => {
    // var session = outgoing.message.session;
    // console.log(outgoing);
    // var data = outgoing.data;
    try {
        var session = sessions[outgoing.data.thread_id];

        if (!session) {
            return kip.debug('\n\n\n\n\n\n KIP SESSION NOT FOUND!!! \n\n\n\n\n\n\n', session);
        }

        var message = outgoing.data;
        // console.log('skype outgoing message', message.mode, message.action);
        var return_data = {};

        // if(message.text){
        //     session.send(message.text);
        //     console.log('<<<<'.yellow, message.text.yellow);
        //     outgoing.ack();
        // }

        co(function*() {
            if (message.mode === 'shopping' && message.action === 'results' && message.amazon.length > 0) {
                return_data = yield parse_results(message);
                // session.channel = message.source.channel;
                // session.text = message.text;
                // session.results = return_data;
                // session.outgoing = outgoing;
                // return session.beginDialog('/results');
                // console.log('1💀')
                return send_results(message.source.channel, message.text, return_data, outgoing, session);
            }
            else if (message.mode === 'cart' && message.action === 'save') {
                // console.log('2💀')
                return send_cart(message.source.channel, message.text, outgoing, session);
            }
            else if (message.mode === 'shopping' && message.action === 'focus' && message.focus) {
                // console.log('focus message :', message);
                return_data = yield focus(message);
                // console.log('3💀')
                return send_focus(message.source.channel, message.text, return_data, outgoing, session);
            }
            else if (message.mode === 'cart' && message.action === 'view') {
                // console.log('4💀')
                return send_cart(message.source.channel, message.text, outgoing, session);
            }
            // else if (message.text && message.text.indexOf('_debug nlp_') == -1) {
            //     return send_text(message.source.channel, message.text, outgoing)
            // }
            else if (message.text){
                // console.log('5💀')
                session.send(message.text);
            }
            else {
                console.log('\nhmm, shouldnt be getting here..', message);
            }
            // outgoing.ack();
        }).then(() => {

            //if(message.text){
            outgoing.ack();
            //}

        }).catch(e => {
            kip.err(e);
            outgoing.ack();
        // })
        })
    } catch ( e ) {
        kip.err(e);
    }

    function send_results(channel, text, results, outgoing, session) {
        // console.log(channel, text, results, outgoing)
        co(function*(){
            var cards = results.map((result, i) => {
                var n = i + 1 + '';
                // var image = result.image_url;
                //get picstitch image
                if (result && result.image_url){
                    var image = ((result.image_url.indexOf('http://') > -1) ? result.image_url.replace('http://','https://') : result.image_url)
                } 
                else {
                    kip.debug('error: no result.image_url (picstitch) found');
                    var image = 'http://kipthis.com/images/header_partners.png';
                }
                // var image = "https://upload.wikimedia.org/wikipedia/en/thumb/2/2a/PikePlaceMarket.jpg/800px-PikePlaceMarket.jpg";
                // console.log(i,'\n\n\nlel wtf is image mate: ',image,'\n\n\n');
                return card = new builder.HeroCard(session)
                    .title(result.title)
                    .text("<a href="+result.title_link+">Read reviews on Amazon</a>")
                    .images([
                        builder.CardImage.create(session, image)
                            .tap(builder.CardAction.showImage(session, image)),
                    ])
                    .tap(builder.CardAction.openUrl(session, result.title_link))
                    .buttons([
                        // <meta hiddenID="save 1" />
                        builder.CardAction.imBack(session, 'Added!<context hidden="save ' + n + '" />', "Add to Cart"),
                        builder.CardAction.imBack(session, "Cheaper!<context hidden='" + n + " but cheaper' />" , "Find Cheaper"),
                        builder.CardAction.imBack(session, n, "More Info")
                    ]);
            });

            var giphy_gif = '';

            // request('http://api.giphy.com/v1/gifs/search?q=' + outgoing.data.original_query + '&api_key=dc6zaTOxFJmzC', function(err, res, body) {
            //     if (err) console.log(err);
                giphy_gif = 'http://kipthis.com/images/header_partners.png'
                // JSON.parse(body).data[0] ? JSON.parse(body).data[0].images.fixed_height :  'http://kipthis.com/images/header_partners.png';
                cards.push(new builder.HeroCard(session)
                .title('Click "See More Results" below for more ')
                // .text('')
                .images([
                    builder.CardImage.create(session, giphy_gif)
                        .tap(builder.CardAction.showImage(session, giphy_gif)),
                ])
                // .tap(builder.CardAction.openUrl(session, ))
                .buttons([
                    builder.CardAction.imBack(session, 'more', "See More Results"),
                    builder.CardAction.imBack(session, 'view cart', "View Cart")
                 ]))
                var msg = new builder.Message(session)
                    .textFormat(builder.TextFormat.xml)
                    .attachmentLayout('carousel')
                    .attachments(cards);
                session.send(msg);
            // })
        })
    }

    function send_focus(channel, text, focus_info, outgoing, session) {
        console.log('FOCUS1 ',focus_info)
        console.log('FOCUS2 ',focus_info.description)
         // Send a greeting and start the menu.
        var card = new builder.HeroCard(session)
            .title(focus_info.title)
            .text((focus_info.price + '\n' + focus_info.description + '\n' + focus_info.reviews).substring(0,300))
            .images([
                 builder.CardImage.create(session, focus_info.image_url)
            ])
            .tap(builder.CardAction.openUrl(session, focus_info.title_link))
            .buttons([
                builder.CardAction.imBack(session, 'Added!<context hidden="save ' + focus_info.selected + '" />', "Add to Cart"),
                builder.CardAction.imBack(session, 'more like ' + focus_info.selected, "Similar"),
                builder.CardAction.imBack(session, "Cheaper!<context hidden='" + focus_info.selected + " but cheaper' />", "Find Cheaper"),
                // builder.CardAction.imBack(session, "select:101", "More Info")
            ]);
        var msg = new builder.Message(session).attachments([card]);
        session.send(msg);
    }

    function send_cart(channel, text, outgoing, session) {
        var cart = outgoing.data.data;
        // console.log('\n\n\n\n\nCART OBJECT : ', cart, outgoing,'\n\n\n\n\n');
        var cart_items = cart.aggregate_items.map((el, i) => {
            // console.log('\n\n\n\n\n  EL IS : ', el, '\n\n\n\n\n');
          var description = `<b>Price: ${el.price}\nQuantity: ${el.quantity}</b>`;
          var card = new builder.ThumbnailCard(session)
                .title(`${i+1}. ${truncate(el.title)}`)
                .text(description)
                .buttons([
                    builder.CardAction.postBack(session, `remove ${i+1}` , 'Remove Item')
                ])
            if (el.image) {
                // https://images-na.ssl-images-amazon.com/images/I/51Dgxd9NEiL._UL1500_.jpg
                if (el.image.indexOf('images-na.ssl-images-amazon.com') > -1) {
                  el.image = 'http://kipthis.com/images/kip_head.png';
                }
              el.image = ((el.image.indexOf('https://') > -1) ? el.image.replace('https://','http://') : el.image);
            kip.debug('\n\n\n\n\n\n\n\n\nSEND CART SKYPE IMAGE IS: ', el.image, '\n\n\n\n\n\n\n\n\n\n\n\n')
              card.images([
                  builder.CardImage.create(session, el.image)
                      .tap(builder.CardAction.showImage(session, el.image))
              ]); 
            };
            return card;
        })


        //I HATE YOU SKYPE, no really, fuck off.
        var urlwhat = outgoing.data.data.link;
        urlwhat = urlwhat.replace('http://','https://');

        cart_items.push(new builder.HeroCard(session)
            .title('Total: ' + outgoing.data.data.total)
            .buttons([
                builder.CardAction.openUrl(session, urlwhat, "Checkout with Amazon")
            ]))
        
        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments(cart_items)

        console.log('IN CONSTRUCT? ',JSON.stringify(msg.attachments));
        session.send(msg);
    }
})

app.get('/healthcheck', function(req, res) {
  res.send('feelin good');
})


//
// grabs emoji names from the xml sent by skype api
// <ss type="movember">:{</ss> -> "movember"
//
function skypeEmojiHack(text) {
  return text.replace(/<ss type="([^"]+)">[^>]+>/g, '$1')
}

function truncate(string) {
   if (string.length > 80)
      return string.substring(0,80)+'...';
   else
      return string;
};
