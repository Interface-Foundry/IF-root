var bodyparser = require('body-parser');
var async = require('async');
var Message = require('../models/Message');
var Channel = require('../models/Channel');
var request = require('request')
var querystring = require('querystring');


module.exports = function(router) {
  router.use(bodyparser.json({limit: '100mb'}));

  //query db for messages
  router.get('/messages', function(req, res) {
    Message.find({'thread.ticket.isOpen': false}, function(err, data) {
      if (err) {
        console.log('/messages route err: ',err);
        return res.status(500).json({
          msg: 'internal server error'
        });
      }

      if (data && data.length === 0) {
        console.log('No data found.')
        return res.status(404).json({
          msg: 'internal server error'
        });
      }
      async.eachSeries(data, function(message, callback1) {
        // console.log('Backend: message routes: flags : ',message.flags)
        if (message.amazon && message.amazon.length > 0) {
              var tempArr = message.amazon; //lmao amazon 
              message.amazon = [];
          async.eachSeries(tempArr, function(item, callback2) {
            var parsed;
            try {
                parsed = JSON.parse(item)
            } catch(err) {
                console.log('Parsing error: ',err);
              return res.status(500).json({
                msg: 'internal server error'
              });
            }
            message.amazon.push(parsed);
            // console.log('Line 41: Parsed item:  ',message.amazon.length)
            callback2();
          }, function done(err) {
            if (err) {
              console.log(err);
              return res.status(500).json({
                msg: 'internal server error'
              });
            }
            // console.log('Line 50: Finished Parsing... ', message.amazon.length)
            callback1();
          })
        } else {
            callback1();
        }
      }, function done(err) {
        if (err) {
          console.log(err);
          return res.status(500).json({
            msg: 'internal server error'
          });
        }
        // console.log('Line 61: Getting heah')
        res.json(data);
      })
    });
  });

  //post a new message to db
  router.post('/newmessage', function(req, res) {

    //Check if message is 'kipsupervisor' if so unresolve channel
    if(req.body && typeof req.body.msg == 'string' && req.body.msg && req.body.msg.trim() == 'kipsupervisor') {
        Channel.findOne({id: req.body.source.id}, function(err, chan) {
          if(err) {
            console.log('/newmessage channelfindOne error 79: ',err)
            // return res.status(500).json({msg: 'internal server error: /newmessage route.'});
          }
        //If Channel not found create it here, I know there's a separate channels routes for that but just trust me
        if (!chan) {
          var channelFound;
          var count = 0;
          async.whilst(function() { return (!channelFound && count < 6) },
              function (callback) {
                  Channel.findOne({id: req.body.source.id}, function(err, data) {
                    if(err) {
                        console.log('/newmessage channelfindOne error 90: ',err)
                      // return res.status(500).json({msg: 'internal server error: /newmessage route.'});
                    }
                    if(!data) {
                      count++;
                      console.log(count)
                      setTimeout(function () {
                        callback(null, count);
                      }, 1000);
                    }
                    else if (data) {
                      console.log('Channel found!')
                      channelFound = data
                      callback(null);
                    }
                  })
              },
              function (err, n) {
                if (err) {
                    console.log('/newmessage channelfindOne error 109: ',err)
                  // return res.status(500).json({msg: 'internal server error'});
                }
                console.log('async loop finished',channelFound)
                channelFound.resolved = false
                channelFound.save(function(err, saved) {
                  if(err) {
                        console.log('/newmessage channelfindOne error 116: ',err)
                      // return res.status(500).json({msg: 'internal server error'});
                    }
                    console.log('Channel ',channelFound.id, ' opened.')
                  })
              });
       
        }
        //If Channel found
        if(chan) {
          chan.resolved = false
          chan.save(function(err, saved) {
            if(err) {
                 console.log('/newmessage channelfindOne error 129: ',err)
                // return res.status(500).json({msg: 'internal server error'});
              }
              console.log('Channel ',chan.id, ' opened.')
          })
        }

      })
    }

    Message.find({'source.channel': req.body.source.channel,
                  'source.id': req.body.source.id,
                  $and: [{'msg': req.body.msg}, {'client_res':req.body.client_res}, {'bucket':req.body.bucket}, {'action':req.body.action}, {'ts':req.body.ts}]
    }, function(err, data) {
      if (err) {
        console.log('messages 157 err: ',err)
        return res.status(500).json({
          msg: 'internal server error'
        });
      }
      if (!data[0]) {
        // console.log('message/newmessage: message not found..')
        if (req.body.flags && req.body.flags.toCinna) {
          return console.log('Not saving preview message.',req.body.flags)
           return res.status(200)
        }
        // console.log('message_routes: req.body: ',req.body)
        else if (req.body.amazon && req.body.amazon.length > 0) {
          var stringifiedItems = []
          async.eachSeries(req.body.amazon, function(item, callback) {
            stringifiedItems.push(JSON.stringify(item));
            callback();
          }, function done(err) {
            if (err) {
              console.log('/newmessage 163: ',err);
            }
            req.body.amazon = stringifiedItems
            var newMessage = new Message(req.body);
            newMessage.save(function(err, saved) {
              if (err) {
                console.log('/newmessage 169: ',err);
                return res.status(500).json({
                  msg: 'internal server error'
                });
              }
              // console.log('/messages 188 SAVED!',saved.msg)
              return res.json(saved);
            })
          })
        } 
        else {
          var newMessage = new Message(req.body);
          newMessage.save(function(err, saved) {
            if (err) {
              console.log('/newmessage 183: ',err);
              return res.status(500).json({
                msg: 'internal server error'
              });
            }
            // console.log('/messages 200 SAVED!',saved.msg)
            return res.json(saved);
          })
        }
      }
      else if (data[0] && data[0].msg !== undefined) {
        // console.log('Message doubled up!')
        return res.json(data[0])
      } 
      else {
               if (req.body.amazon && req.body.amazon.length > 0) {
                var stringifiedItems = []
                async.eachSeries(req.body.amazon, function(item, callback) {
                  stringifiedItems.push(JSON.stringify(item));
                  callback();
                }, function done(err) {
                  if (err) {
                    console.log(err);
                    return res.status(500).json({
                      msg: 'internal server error'
                    });
                  }
                  req.body.amazon = stringifiedItems
                  var newMessage = new Message(req.body);
                  newMessage.save(function(err, saved) {
                    if (err) {
                      console.log(err);
                      return res.status(500).json({
                        msg: 'internal server error'
                      });
                    }
                    // console.log('/messages 188 SAVED!',saved.msg)
                    res.json(saved);
                  })
                })
            } 
            else {

            var newMessage = new Message(req.body);
              newMessage.save(function(err, saved) {
                if (err) {
                  console.log(err, req.body);
                  return res.status(500).json({
                    msg: 'internal server error'
                  });
                }
                // console.log('/messages 232 SAVED!',saved.msg)
                return res.json(saved);
              })
              
          }
    }
  })
})

  //resolve existing message in db
  router.post('/resolve', function(req, res) {

    Message.find({
      'source.id': req.body.source.id,
      'source.channel': req.body.source.channel
    }, function(err, data) {
      if (err) {
        console.log(err);
        return res.status(500).json({
          msg: 'internal server error'
        });
      }
      if (data && data.length < 1) {
        console.log('Message not found.')
        return res.status(500).json({
          msg: 'internal server error'
        });
      }
      if (data) {
        async.eachSeries(data, function iteratior(msg, callback){ 

          if(msg && msg.thread && msg.thread.ticket) {
            msg.thread.ticket.isOpen = false
              if (req.body.amazon && req.body.amazon.length > 0) {
                var stringifiedItems = []
                async.eachSeries(req.body.amazon, function(item, callback) {
                  stringifiedItems.push(JSON.stringify(item));
                  callback();
                }, function done(err) {
                  if (err) {
                    console.log(err);
                    return res.status(500).json({
                      msg: 'internal server error'
                    });
                  }
                  msg.amazon = stringifiedItems
                  msg.save(function(err, result) {
                    if (err) {
                      console.log(err);
                      return res.status(500).json({
                        msg: 'internal server error'
                      });
                    }
                    console.log('Message resolved.')
                    callback()
                  })
                })
              } else {
                msg.save(function(err, result) {
                  if (err) {
                    console.log(err);
                    return res.status(500).json({
                      msg: 'internal server error'
                    });
                  }
                  console.log('Message resolved.')
                  callback()
                })
              }
          } 
          else {
            console.log('message/resolve route: msg.thread or msg.thread.ticket missing, did not resolve.')
            callback()
          }
              


        }, function done(){
          res.json({});
        })


      }
    });
  });

   //fetch processed message
  router.post('/urlshorten', function(req, res) {
    // var url = new URL('http://kipbubble.com/product/'+req.body.url+'&format=txt')
    // console.log('\n\n\n\n\n***messageroutes 201: req', req.body.array)
      var linkArray = []
      async.eachSeries(req.body.array, function iterator(url, callback) {
        request({
          method: 'GET',
          url: 'https://api-ssl.bitly.com/v3/shorten?access_token=da558f7ab202c75b175678909c408cad2b2b89f0&longUrl=http://kipbubble.com/product/'+url+'&format=txt',
          }, function(e, r, b) {
          if (e) {
            console.log('message_routes/urlshorten: ',e)
            callback()
            } else {
            linkArray.push(b)
            callback()
          }
        })
      }, function done(e) {
        if (e) {
          console.log('urlShorten api error: ',e)
           return res.status(500).json({
            msg: 'internal server error'
          });
        } else {
          res.json(linkArray);
        }
      })
  })

  
  router.post('/stitch', function(req, res) {

    console.log('/stitch req.body',req.body)
    var results = [];
    async.eachSeries(req.body, function iterator(item, callback){
      request({
        method: 'POST',
        url: 'http://54.164.59.227:5000',
        json: true,
        body: [item]
      }, function(e, r, b) {
        if (e) {
          console.log('picStitch error: ',e)
          callback(e)
        } else {
          // console.log('user routes 49 r:', r)
          results.push(b)
          callback()
        }
      })
    }, function(err) {
      if (err) {
        console.log('user_routes/stitch err: ',err)
        return res.send(err)
      } 
      // console.log('user routes 57: results: ',results)
      res.json(results);      
    })
  });




  
}