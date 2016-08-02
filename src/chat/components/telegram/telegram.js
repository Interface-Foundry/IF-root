var telegram = require('telegram-bot-api');
var co = require('co');
var kip = require('kip');
var async = require('async');
var queue = require('../queue-mongo');
var db = require('../../../db')
var _ = require('lodash');
var telegramToken;
  if (process.env.NODE_ENV == 'development_alyx'){
      telegramToken = '187934179:AAG7_UuhOETnyWEce3k24QCd2OhTBBQcYnk';
  }else if (process.env.NODE_ENV == 'development_mitsu'){
      telegramToken = '187934179:AAG7_UuhOETnyWEce3k24QCd2OhTBBQcYnk';
  }else{
      telegramToken = '144478430:AAG1k609USwh5iUORHLdNK-2YV6YWHQV4TQ';
  }

// if (process.env.NODE_ENV !== 'development') {

  var tg = new telegram({
          token: '187934179:AAG7_UuhOETnyWEce3k24QCd2OhTBBQcYnk',
          updates: {
              enabled: true,
              get_interval: 1000
      }
  });
// }



tg.getMe()
.then(function(data)
{
    console.log(data);
})
.catch(function(err)
{
    console.log(err);
});



tg.on('message', function(msg) {
      //if user sends sticker msg.msg will be undefined
      if (msg.sticker) {
          console.log('Telegram message is a sticker: ',msg)
          return
      }

  //     { message_id: 2237,
  // from: { id: 197103511, first_name: 'M', last_name: 'M' },
  // chat:
  //  { id: 197103511,
  //    first_name: 'M',
  //    last_name: 'M',
  //    type: 'private' },
  // date: 1464202890,
  // text: 'Shoes' }

      var message = new db.Message({
          incoming: true,
          thread_id: msg.chat.id,
          original_text: msg.text,
          user_id: 'telegram' + "_" + msg.from.id,
          origin: 'telegram',
          source: {
              'origin':'telegram',
              'channel':msg.from.id.toString(),
              'org':'telegram',
              'id':'telegram' + "_" + msg.from.id, //for retrieving chat history in node memory,
          }
      })

      console.log('Received message from telegram: ', msg);

      message.text = message.text.trim(); //remove extra spaces on edges of string

      // queue it up for processing
      message.save().then(() => {
        queue.publish('incoming', message, ['telegram', msg.from.id, msg.message_id, msg.date].join('.'))
      });
})

kip.debug('subscribing to outgoing.telegram');
queue.topic('outgoing.telegram').subscribe(outgoing => {
    console.log('outgoing telegram message');
    console.log(outgoing);
    var data = outgoing.data;
    // console.log('D:', data)
    if (data.action == 'initial' || data.action == 'modify' || data.action == 'similar' || data.action == 'more') {
            var message = data.client_res[0]; //use first item in client_res array as text message
            console.log('attachthis ',message);
            var attachThis = data.client_res;
            attachThis.shift();
            async.eachSeries(attachThis, function(attach, callback) {
                 upload.uploadPicture('telegram', attach.photo, 100, true).then(function(uploaded) {
                     tg.sendMessage({
                        chat_id: data.source.channel,
                        text: attach.message,
                        parse_mode: 'Markdown',
                        disable_web_page_preview: 'true'
                     }).then(function(datum){
                          tg.sendPhoto({
                            chat_id: encode_utf8(data.source.channel),
                            photo: encode_utf8(uploaded.outputPath)
                            }).then(function(datum){
                                if (uploaded.outputPath) {
                                    fs.unlink(uploaded.outputPath, function(err, res) {
                                    })
                                }
                                if (uploaded.inputPath) {
                                    fs.unlink(uploaded.inputPath, function(err, res) {
                                    })
                                }
                                callback();
                            }).catch(function(err){
                                if (err) { console.log('ios.js1259: err',err) }
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
                        }).catch(function(err){
                            if (err) {
                                console.log('ios.js1264: err',err)
                            }
                            callback();
                        })
                    }).catch(function(err) {
                        if (err)  console.log('\n\n\niojs image upload error: ',err,'\n\n\n')
                        callback();
                    })
            }, function done(){
            });
        }
        else if (data.action == 'focus'){
           try {
             var formatted = '[' + data.client_res[1].split('|')[1].split('>')[0] + '](' + data.client_res[1].split('|')[0].split('<')[1]
             formatted = formatted.slice(0,-1)
             formatted = formatted + ')'
           } catch(err) {
             console.log('io.js 1269 err: ',err)
             return
           }
          data.client_res[1] = formatted ? formatted : data.client_res[1]
          var toSend = data.client_res[1] + '\n' + data.client_res[2] + '\n' + truncate(data.client_res[3]) + '\n' + (data.client_res[4] ? data.client_res[4] : '')
           upload.uploadPicture('telegram', data.client_res[0],100, true).then(function(uploaded) {
             tg.sendPhoto({
                chat_id: encode_utf8(data.source.channel),
                photo: encode_utf8(uploaded.outputPath)
              }).then(function(datum){
                tg.sendMessage({
                    chat_id: data.source.channel,
                    text: toSend,
                    parse_mode: 'Markdown',
                    disable_web_page_preview: 'true'
                })
                if (uploaded.outputPath) {
                    fs.unlink(uploaded.outputPath, function(err, res) {
                    })
                }
                if (uploaded.inputPath) {
                    fs.unlink(uploaded.inputPath, function(err, res) {
                    })
                }
              })
            }).catch(function(err){
                if (err) { console.log('ios.js1285: err',err) }
            })
        }
        else if (data.action == 'save') {
          try {
             var formatted = '[View Cart](' + data.client_res[1][data.client_res[1].length-1].text.split('|')[0].split('<')[1] + ')'
           } catch(err) {
             console.log('\n\n\nio.js 1316-err: ',err,'\n\n\n')
             return
           }
          tg.sendMessage({
                chat_id: data.source.channel,
                text: 'Awesome! I\'ve saved your item for you 😊 Use `checkout` anytime to checkout or `help` for more options.',
                parse_mode: 'Markdown',
                disable_web_page_preview: 'true'
            })
            .then(function() {
              if (formatted) {
                tg.sendMessage({
                    chat_id: data.source.channel,
                    text: formatted,
                    parse_mode: 'Markdown',
                    disable_web_page_preview: 'true'
                })
              }
            })
            .catch(function(err) {
                console.log('io.js 1307 err',err)
            })
        }
        else if (data.action == 'checkout') {
             async.eachSeries(data.client_res[1], function iterator(item, callback) {
                if (item.text.indexOf('_Summary') > -1) {
                    return callback(item)
                }
                 var itemLink = ''
                  try {
                    itemLink = '[' + item.text.split('|')[1].split('>')[0] + '](' + item.text.split('|')[0].split('<')[1] + ')'
                    itemLink = encode_utf8(itemLink)
                   } catch(err) {
                     return callback(null)
                   }
                   tg.sendMessage({
                        chat_id: data.source.channel,
                        text: itemLink,
                        parse_mode: 'Markdown',
                        disable_web_page_preview: 'true'
                    }).then(function(){
                         var extraInfo = item.text.split('$')[1]
                         extraInfo = '\n $' + extraInfo
                         extraInfo = extraInfo.replace('*','').replace('@','').replace('<','').replace('>','')
                         tg.sendMessage({
                            chat_id: data.source.channel,
                            text: encode_utf8(extraInfo),
                            parse_mode: 'Markdown',
                                disable_web_page_preview: 'true'
                            })
                            .then(function(){
                                callback(null)
                            })
                            .catch(function(err) {
                                console.log('io.js 1354 err: ',err)
                                callback(null)
                            })
                    })
              }, function done(thing) {
                if (thing.text) {
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
                         console.log('io.js 1353 err:',err)
                       })
                       } catch(err) {
                         console.log('io.js 1356 err:',err)
                       }
                } else {
                }
              })
        }
        else if (data.action == 'sendAttachment'){
          console.log('\n\n\nTelegram sendAttachment data: ', data,'\n\n\n')
        }
        else {
            console.log('\n\n\nTelegram ELSE : ', data,'\n\n\n')
            // async.eachSeries(data.client_res, function(message, callback) {
                tg.sendMessage({
                    chat_id: data.source.channel,
                    text: data.text
                })
            //     callback();
            // }, function done(){
            // });
        }
});
